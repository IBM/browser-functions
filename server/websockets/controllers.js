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

const logger = require('../logger')

class ControllerGroup {
    constructor() {
        this.roundRobinIndex = 0
        this.sockets = []
    }

    add(socket) {
        this.sockets.push(socket)
    }

    remove(socket) {
        const index = this.sockets.indexOf(socket)
        if (index > -1) {
            this.sockets.splice(index, 1)
            return true
        } else {
            return false
        }
    }

    controllerCount() {
        return this.sockets.length
    }

    getNextController() {
        if (this.roundRobinIndex >= this.sockets.length) {
            this.roundRobinIndex = 0
        }

        const executeController = this.sockets[this.roundRobinIndex]
        this.roundRobinIndex++
        return executeController
    }
}

const controllers = {
    masterFirefox: new ControllerGroup(),
    masterChrome: new ControllerGroup(),
    application: {

    }
}

function addMasterController(controller) {
    if (controller.browser === "Chrome") {
        controllers.masterChrome.sockets.push(controller)
    } else if (controller.browser === "Firefox") {
        controllers.masterFirefox.sockets.push(controller)
    } else {
        logger.error("Unknown controller browser type " + controller.browser)
    }
}

function addApplicationController(applicationId, controller) {
    if (!controllers.application[applicationId]) {
        controllers.application[applicationId] = new ControllerGroup()
    }
    controllers.application[applicationId].add(controller)
}

function removeController(socket) {
    controllers.masterFirefox.remove(socket)
    controllers.masterChrome.remove(socket)

    for (let appId of Object.keys(controllers.application)) {
        controllers.application[appId].remove(socket)
    }
}

const executionEnvironments = {
    masterChrome: 'master-chrome',
    masterFirefox: 'master-firefox',
    user: 'user'
}

function availableControllers(applicationId, functionSettings) {
    const availableExecutionEnvs = functionSettings['execution-environments']
    let count = 0

    if (availableExecutionEnvs.includes(executionEnvironments.masterChrome)) {
        count += controllers.masterChrome.controllerCount()
    }

    if (availableExecutionEnvs.includes(executionEnvironments.masterFirefox)) {
        count += controllers.masterFirefox.controllerCount()
    }

    if (availableExecutionEnvs.includes(executionEnvironments.user)) {
        if (controllers.application[applicationId]) {
            count += controllers.application[applicationId].controllerCount()
        }
    }
    return count
}

function getNextExecutionController(applicationId, functionSettings) {
    const executionEnvsWithControllers = []
    logger.debug("Getting next execution controller")
    logger.debug("User has the following environments selected: " + JSON.stringify(functionSettings['execution-environments']))

    for (let executionEnvironment of functionSettings['execution-environments']) {
        switch (executionEnvironment) {
            case executionEnvironments.masterChrome:
                if (controllers.masterChrome.controllerCount() > 0) {
                    executionEnvsWithControllers.push(executionEnvironment)
                }
                logger.debug(`Found ${controllers.masterChrome.controllerCount()} controllers in ${executionEnvironment}`)
                break
            case executionEnvironments.masterFirefox:
                if (controllers.masterFirefox.controllerCount() > 0) {
                    executionEnvsWithControllers.push(executionEnvironment)
                }
                logger.debug(`Found ${controllers.masterFirefox.controllerCount()} controllers in ${executionEnvironment}`)
                break
            case executionEnvironments.user:
                if (controllers.application[applicationId]) {
                    if (controllers.application[applicationId].controllerCount() > 0) {
                        executionEnvsWithControllers.push(executionEnvironment)
                    }
                    logger.debug(`Found ${controllers.application[applicationId].controllerCount()} controllers in ${executionEnvironment}`)
                } else {
                    logger.debug(`No controllers for AppId: ${applicationId}`)
                }
        }
    }

    if (executionEnvsWithControllers.length === 1) {
        logger.debug(`Using execution environment: ${executionEnvsWithControllers[0]}`)
        return getControllerForExecutionEnvironment(applicationId, executionEnvsWithControllers[0])
    } else {
        const randomExecutionEnv = executionEnvsWithControllers[Math.floor(Math.random() * executionEnvsWithControllers.length)]
        logger.debug(`Using execution environment: ${randomExecutionEnv}`)
        return getControllerForExecutionEnvironment(applicationId, randomExecutionEnv)
    }
}

function getControllerForExecutionEnvironment(applicationId, executionEnvironment) {
    switch (executionEnvironment) {
        case executionEnvironments.masterChrome:
            return controllers.masterChrome.getNextController()
        case executionEnvironments.masterFirefox:
            return controllers.masterFirefox.getNextController()
        case executionEnvironments.user:
            return controllers.application[applicationId].getNextController()
    }

    throw new Error(`Unable to find controller. AppId: ${applicationId} ExecutionEnv: ${executionEnvironment}`)
}

function allControllers() {
    let allControllers = []

    allControllers.push(...controllers.masterChrome.sockets)
    allControllers.push(...controllers.masterFirefox.sockets)

    for (let appId of Object.keys(controllers.application)) {
        const app = controllers.application[appId]
        allControllers.push(...app.sockets)
    }

    return allControllers
}

module.exports = {
    addMasterController,
    addApplicationController,
    removeController,
    availableControllers,
    getNextExecutionController,
    allControllers
}
