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

const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises
const config = require('../config')
const utils = require('../utils')
const chokidar = require('chokidar')
const uuid = require('../uuid');
const logger = require('../logger');
const EventEmitter = require('events');
const Tail = require('tail').Tail;
const fileUtils = require('./fileUtils')
const { execSync } = require('child_process');
const { install } = require('esinstall');

import s3fs from '../s3fs';
import aspenfs from '../aspen-fs';

class FilesChangedEmitter extends EventEmitter {
}

const filesChangedEmitter = new FilesChangedEmitter();

let functions = {}
let authKeyMap = {}
let packagesMap = {}

readFunctions().then(() => {
    logger.debug(`Read ${Object.keys(functions).length} applications to memory`)
})

watchForFileChanges()

function watchForFileChanges() {
    chokidar.watch(config.functionsRoot, {
        ignoreInitial: true,
        ignored: '**/application.log',
    }).on('all', (event, path) => {
        logger.debug("File changed. Reading in functions")
        logger.debug(event, path)
        readFunctions()
    })
}

async function readFunctions() {
    functions = {}
    authKeyMap = {}
    packagesMap = {}
    
    const appNames = await aspenfs.readdir(config.functionsRoot);
    const readFilePromises = []

    for (let appName of appNames) {
        readFilePromises.push(readSingleApplication(appName))
    }

    await Promise.all(readFilePromises)
    filesChangedEmitter.emit('files_read')
}

async function read(dir, appName) {

    const fileTree = {}

    async function walk(dir, directoryTree, folder = '') {
        let files = await fsPromises.readdir(dir);
        await Promise.all(files.map(async file => {
            const filePath = path.join(dir, file);
            const stats = await fsPromises.stat(filePath);
            if (stats.isDirectory()) {
                directoryTree[file] = {
                    _type: 'directory'
                }

                return walk(filePath, directoryTree[file], `${folder}/${file}`);
            } else if (stats.isFile()) {

                const runtime = utils.runtimeFromName(file)
                const executeUrl = runtime ? utils.constructExecuteUrl(appName, folder, file) : ''
                const staticUrl = utils.constructStaticUrl(appName, folder, file)
                directoryTree[file] = {
                    runtime,
                    executeUrl,
                    staticUrl,
                    _type: 'file'
                }

                return filePath;
            }
        }));
    }

    await walk(dir, fileTree)
    return fileTree
}

// TODO: Play with list S3 API to clean this up
async function readS3(appName) {
    const filesPath = path.join(appName, "files/");
    const filePathsList = await s3fs.listDirectoryContents(filesPath);
    const files = {};

    for(const filePath of filePathsList) {
        const splitPath = filePath.split("/");
        const fileName = splitPath.pop();
        const filesRunner = files;
        const finalDir = splitPath.reduce((curr, key) => {
            if (!(key in curr)) {
                curr[key] = {
                    _type: 'directory'
                }            
            } 
            return curr[key];
        } , filesRunner);

        const runtime = utils.runtimeFromName(fileName)
        const executeUrl = runtime ? utils.constructExecuteUrl(appName, splitPath, fileName) : ''
        const staticUrl = utils.constructStaticUrl(appName, splitPath, fileName)
        finalDir[fileName] = {
            runtime,
            executeUrl,
            staticUrl,
            _type: 'file'
        }
    }
    
    const result = files[appName]['files'];
    delete result['_type'];
    return result;
}

async function readSingleApplication(appName) {
    try {
        const settingsBytes = await aspenfs.readFile(`${config.functionsRoot}${appName}/settings.json`);
        const settings = JSON.parse(settingsBytes)
        settings.applicationId = appName
        settings.controllerUrl = utils.constructControllerUrl(appName, settings['access-key'])

        let files = {};
        if (config.useS3) {
            files = await readS3(appName);
        } else if (fs.existsSync(`${config.functionsRoot}${appName}/files`)) {
            files = await read(`${config.functionsRoot}${appName}/files`,appName)
        }
        
        if (files['environment.json']) {
            const envBytes = await aspenfs.readFile(`${config.functionsRoot}${appName}/files/environment.json`)
            const env = JSON.parse(envBytes)
            settings['environment'] = env
        }

        // TODO: figure out package json
        // const packageJson = await readPackageJson(appName);

        authKeyMap[settings["access-key"]] = appName
        
        functions[appName] = {
            settings,
            files
        }

        // packagesMap[appName] = packageJson;

    } catch (err) {
        logger.error('Unable to read application: ' + appName)
        logger.error(err)
    }
}

async function readPackageJson(appName) {
    let dependencies = {};
    let devDependencies = {};
    try {
        const packageJsonBytes = await fsPromises.readFile(`${config.functionsRoot}${appName}/package.json`);
        const packageJson = JSON.parse(packageJsonBytes)
        dependencies = packageJson.dependencies || {};
        devDependencies = packageJson.devDependencies || {};
    } catch {
        // may not exist
    }

    return {
        dependencies,
        devDependencies
    }
}

function getApplicationIdFromAuthToken(authToken) {
    return authKeyMap[authToken]
}

function getApplicationMetaData(appId) {
    return functions[appId]
}

function getApplicationDependencies(appId) {
    return packagesMap[appId]
}

function lookupObjectByPath(lookupObject, lookupPath) {
    lookupPath = lookupPath.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    lookupPath = lookupPath.replace(/^\//, ''); // strip a leading slash
    const pathItems = lookupPath.split('/');
    for (let i = 0; i < pathItems.length; ++i) {
        const pathItem = pathItems[i];
        if (pathItem in lookupObject) {
            lookupObject = lookupObject[pathItem];
        } else {
            return;
        }
    }
    return lookupObject;
}

function checkFunctionExists(applicationId, functionFilePath) {
    if (!applicationId || !functionFilePath) {
        return false
    }

    const appIdLower = applicationId.toLowerCase()

    if (!functions[appIdLower] ||
        !functions[appIdLower].files) {
        return false
    }

    if (!lookupObjectByPath(functions[appIdLower].files, functionFilePath)) {
        return false
    }

    return true
}


function checkApplicationExists(applicationId) {
    return !!(functions[applicationId.toLowerCase()])
}

async function createNewApplication(applicationId, email) {
    if (checkApplicationExists(applicationId)) {
        throw new Error('Application already exists')
    }

    // await fsPromises.mkdir(`${config.functionsRoot}${applicationId}`)
    // await fsPromises.mkdir(`${config.functionsRoot}${applicationId}/files`)

    const settings = {
        "access-key": uuid.v4(),
        author: email,
        "execution-environments": ["master-chrome", "master-firefox", "user"]
    }

    await saveFunctionSettingsToFile(applicationId, settings)

    // TODO: packages?
    // execSync("yarn init -y", {cwd: `${config.functionsRoot}${applicationId}`})

    await readSingleApplication(applicationId);

    return settings["access-key"]
}

async function saveFunctionSettingsToFile(applicationId, settings) {
    const settingsCopy = {...settings}
    delete settingsCopy.environment
    await aspenfs.writeFile(`${config.functionsRoot}${applicationId}/settings.json`, JSON.stringify(settingsCopy, null, 4))
}

async function waitForNewFilesToBeRead() {
    const timeoutMs = 1000;
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            resolve()
        }, timeoutMs)
    })

    const filesChangedPromise = new Promise((resolve, reject) => {
        filesChangedEmitter.on('files_read', () => {
            resolve()
        })
    })

    return Promise.race([
        filesChangedPromise,
        timeout
    ])
}

// Deprecated (I THINK) - meant for drag/drop
async function addFunctionFile(applicationId, file, filePath) {
    if (!checkApplicationExists(applicationId)) {
        throw new Error('Application does not exist')
    }
    const newFilePath = `${config.functionsRoot}${applicationId}/files${filePath}`

    // ensure the destination folder exists
    const newFileDir = path.dirname(newFilePath)
    !fs.existsSync(newFileDir) && fs.mkdirSync(newFileDir);

    // file is uploaded to os.tmpdir() so we just need to rename it to get it to the correct location
    await fsPromises.rename(file.path, newFilePath)
    await waitForNewFilesToBeRead()
}

async function addFunctionString(applicationId, filename, code) {
    if (!checkApplicationExists(applicationId)) {
        throw new Error('Application does not exist')
    }
    const newFilePath = `${config.functionsRoot}${applicationId}/files/${filename}`
    await aspenfs.writeFile(newFilePath, code)

    // await waitForNewFilesToBeRead()
    await readSingleApplication(applicationId);
}

async function addDependencies(applicationId, newDependencies, isDev) {
    const packageString = `${newDependencies}${isDev ? ' --dev' : ''}`;
    
    const appDirectory = `${config.functionsRoot}${applicationId}`;

    execSync(`yarn add ${packageString}`, {cwd: appDirectory});

    const packageJson = await readPackageJson(applicationId);

    const destPath = `${appDirectory}/files/web_modules`;
    const dependencies = Object.keys(packageJson.dependencies);
    await install(dependencies, {cwd: appDirectory, dest: destPath}); 

    packagesMap[applicationId] = packageJson;
}

async function updateApplication(applicationId, applicationSettings) {
    // only allows the user to change certain settings
    const changeableSettings = ['execution-environments']

    const newSettings = {}
    for (let key of Object.keys(applicationSettings)) {
        if (changeableSettings.includes(key)) {
            newSettings[key] = applicationSettings[key]
        }
    }

    functions[applicationId].settings = {...functions[applicationId].settings, ...newSettings}

    await saveFunctionSettingsToFile(applicationId, functions[applicationId].settings)
}

function applicationAllowsCustomControllers(applicationId) {
    const executionEnvironments = functions[applicationId].settings['execution-environments']
    return executionEnvironments.includes('user')
}

async function deleteFunction(applicationId, functionName) {
    const filePath = `${config.functionsRoot}${applicationId}/files/${functionName}`
    await aspenfs.deleteFile(filePath);
    // await waitForNewFilesToBeRead()
    await readSingleApplication(applicationId);
}

async function getFunctionAsString(applicationId, functionName) {
    const filePath = `${config.functionsRoot}${applicationId}/files/${functionName}`
    const data = await aspenfs.readFile(filePath)
    return data.toString()
}

async function saveJobLogs(applicationId, {jobId, type, message, functionName}) {
    const filePath = `${config.functionsRoot}${applicationId}/files/application.log`
    const logLine = `${new Date().toLocaleString()} | ${functionName} | ${jobId} | ${type} | ${message}\n`
    return fsPromises.appendFile(filePath, logLine)
}

async function tailLogs(applicationId, callback) {
    const filePath = `${config.functionsRoot}${applicationId}/files/application.log`
    const lastLines = await fileUtils.readLastLines(filePath, 5)
    lastLines.split('\n').forEach((line) => callback(line))
    const tail = new Tail(filePath, {fromBeginning: false});
    tail.on("line", (line) => callback(line));
    return tail
}

module.exports = {
    getApplicationIdFromAuthToken,
    getApplicationMetaData: getApplicationMetaData,
    getApplicationDependencies,
    checkFunctionExists,
    checkApplicationExists,
    createNewApplication,
    addFunctionFile,
    addFunctionString,
    addDependencies,
    updateApplication,
    applicationAllowsCustomControllers,
    deleteFunction,
    getFunctionAsString,
    saveJobLogs,
    tailLogs,
}
