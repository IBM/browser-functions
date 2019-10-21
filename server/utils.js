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

const config = require('./config')
const logger = require('./logger')
const fs = require('fs')
const fsPromises = fs.promises

function constructExecuteUrl(appName, folder, functionName) {
    const folderStr = folder ? folder + '/' : '/'
    return `${config.protocol}://${appName}.${config.host}${config.portInfo}/execute${folderStr}${functionName}`
}

function constructStaticUrl(appName, folder, functionName) {
    const folderStr = folder ? folder + '/' : '/'
    return `${config.protocol}://${appName}.${config.host}${config.portInfo}/static${folderStr}${functionName}`
}

function constructControllerUrl(appName, accessKey) {
    return `${config.protocol}://${appName}.${config.functionDomain}${config.portInfo}/controller?access-key=${accessKey}`
}

function runtimeFromName(name) {
    if (name.endsWith('.js')) {
        return 'JavaScript'
    }
    if (name.endsWith('.html')) {
        return 'HtmlMixed'
    }
    return ''
}

const fileExtensions = {
    javascript: 'js',
    htmlmixed: 'html',
}

function getPortFromRequest(req) {
    if (req.headers.host.match(/:/g)) {
        return ':' + req.headers.host.split(':')[1]
    } else {
        return ''
    }
}

/*
* Render a template using {{ }} and injecting global variables
* */
function renderTemplate(res, filePath, variables = {}) {
    fsPromises.readFile(filePath).then((fileData => {
        let templateData = fileData.toString()
        let variableInit = "\n<!-- Global variable initialisation from server -->\n"
        variableInit += "<script>\n"
        variableInit += "window.serverVars = {\n"

        for (let key of Object.keys(variables)) {
            templateData = templateData.replace(new RegExp(`{{${key}}}`, 'g'), variables[key])
            variableInit += `\t${key} : ${JSON.stringify(variables[key])},\n`
        }

        variableInit += "}\n"
        variableInit += "</script>\n"

        templateData = templateData.replace("<!--INJECT_SERVER_VARS-->", variableInit)
        res.send(templateData)
    })).catch((e) => {
        res.send("Error reading template " + filePath)
        logger.error(e)
    })
}

const regex = {
    email: /[^@]+@[^\.]+\..+/,
    filename: /^[\w\-]+$/
}

function onProcessExit(callback) {
    const onExit = (e) => {
        callback()
        if (e !== 1) {
            process.exit(e)
        }
    }

    process.on('SIGTERM', onExit);
    process.on('exit', onExit);
    process.on('SIGUSR1', onExit);
    process.on('SIGUSR2', onExit)

}

function getApplicationIdAsSubDomain(req) {
    // anything before the functionDomain is considered the application name
    let subDomains = req.hostname.replace(config.functionDomain, '')
    subDomains = subDomains.replace('.', '')
    
    if (subDomains === 'www') return null;

    return subDomains
}

module.exports = {
    constructExecuteUrl,
    runtimeFromName,
    fileExtensions,
    getPortFromRequest,
    renderTemplate,
    regex,
    onProcessExit,
    getApplicationIdAsSubDomain,
    constructControllerUrl,
    constructStaticUrl
}
