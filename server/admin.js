/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const chrome = require('puppeteer');
const firefox = require('puppeteer-firefox');
const config = require('./config')
const uuid = require('./uuid')
const utils = require('./utils')
const security = require('./security')
const controllers = require("./websockets/controllers");
const express = require('express')
const router = express.Router()
const {spawn} = require('child_process');
const logger = require('./logger')

const serveOptions = {root: __dirname + '/../ui/'}

function setupAdmin(app) {

    const browserInstances = {}

    utils.onProcessExit(() => {
        for (let browserId of Object.keys(browserInstances)) {
            const browser = browserInstances[browserId]
            browser.close()
        }
    })

    router.use(security.authenticateAdmin)

    app.use('/admin', router)

    router.get('/stats', async function (req, res) {

        const controllerData = controllers.allControllers().map(controller => ({
            browser: controller.browser,
            version: controller.browserVersion,
            address: controller.request.connection.remoteAddress, // might need to use socket.handshake.address
            connectedAt: controller.connectedAt.toLocaleString(),
            id: controller.id
        }));

        const browserData = Object.keys(browserInstances).map(browserId => {
            const browser = browserInstances[browserId]

            return {
                id: browserId,
                version: browser.version,
                createdAt: browser.createdAt.toLocaleString()
            }
        })

        res.send({
            browsers: browserData,
            controllers: controllerData
        })
    })

    router.get('/', async function (req, res) {
        res.sendFile('admin.html', serveOptions)
    })

    router.post('/browser/chrome', async function (req, res) {
        await addNewChrome()
        res.sendStatus(200)
    })

    router.post('/browser/firefox', async function (req, res) {
        await addNewFirefox()
        res.sendStatus(200)
    })

    router.delete('/browser/:id', async function (req, res) {
        const id = req.params.id
        await closeBrowser(id)
        res.sendStatus(200)
    })

    router.delete('/controller/:id', async function (req, res) {
        const id = req.params.id
        await closeController(id)
        res.sendStatus(200)
    })

    async function closeBrowser(id) {
        await browserInstances[id].close()
        delete browserInstances[id]
    }

    async function closeController(id) {
        const socket = controllerSockets.find(socket => socket.id === id)
        socket.emit('SHUT_DOWN')
    }

    async function addNewChrome() {
        const args = chrome.defaultArgs()
        args.push('--site-per-process')
        return addNewBrowser(chrome, config.chromeTabCount, args)
    }

    async function addNewFirefox() {
        const args = firefox.defaultArgs()
        return addNewBrowser(firefox, config.firefoxTabCount, args)
    }

    async function addNewBrowser(engine, tabCount, args) {
        if (!args) {
            args = engine.defaultArgs()
        }

        try {
            const browser = await engine.launch({args});
            browser.createdAt = new Date()
            browser.version = await browser.version()
            const browserId = uuid.v4()
            browserInstances[browserId] = browser

            if (logger.isLevelEnabled('debug')) {
                captureLogsFromBrowserTabs(browser)
            }

            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            page.setDefaultNavigationTimeout(5 * 60 * 1000)

            const tabs = config.isDev ? 2 : tabCount
            // Use localhost for admin controller to ensure no domain clashes with functions
            // Long running functions on same domain/subdomain as controller will lock up the controller
            // TODO: confirm there are no security issues introduced by using localhost for the controller.
            await page.goto(`http://localhost:${config.port}/controller?tabs=${tabs}&access-key=${config.masterAccessKey}`);
        } catch (ex) {
            logger.error('Unable to add new browser', ex)
        }
    }

    if (!config.isDev) {
        killExistingBrowserInstances().then(() => {
            addNewChrome()
            addNewFirefox()
        })
    } else {
        addNewChrome()
    }
}

function captureLogsFromBrowserTabs(browser) {
    browser.on('targetcreated', async (target) => {
        logger.debug('New ' + target.type() + '\n\turl: ' + target.url() + '\n\tTabs: ' + (await browser.pages()).length)

        const page = await target.page()
        if (!page) {
            return
        }
        page.on('console', msg => {
            logger.debug('Console ' + msg.type() + ' message:')
            logger.debug('\tmessage: ' + msg.text())
            logger.debug('\tlocation: ' + msg.location().url + ':' + msg.location().lineNumber)
        })
        page.on('error', msg => {
            logger.debug(page.url() + ' - error: ' + JSON.stringify(msg))
        })
        page.on("pageerror", function (err) {
            logger.debug(err.toString())
        })
    })
}

async function killExistingBrowserInstances() {
    await killProcess('firefox')
    await killProcess('chrome')
}

function killProcess(processName) {
    const killall = spawn('killall', ['-9', processName]);

    return new Promise((resolve, reject) => {
        killall.stdout.on('data', (data) => {
            logger.debug(`stdout: ${data}`);
        });

        killall.stderr.on('data', (data) => {
            logger.debug(`stderr: ${data}`);
        });

        killall.on('close', (code) => {
            logger.info(`killall process exited with code ${code}`);
            resolve()
        });
    })
}

module.exports = {
    setupAdmin
}

/* firefox default args
[ '-no-remote', '-foreground', '-headless', 'about:blank' ]

* */

/* chrome default args
[
  '--disable-background-networking',
  '--enable-features=NetworkService,NetworkServiceInProcess',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-features=site-per-process,TranslateUI,BlinkGenPropertyTrees',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-sync',
  '--force-color-profile=srgb',
  '--metrics-recording-only',
  '--no-first-run',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--headless',
  '--hide-scrollbars',
  '--mute-audio',
  'about:blank'
]

* */
