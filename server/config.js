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

const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'browserfunctions.test',
    functionDomain: process.env.DOMAIN || process.env.HOST || 'browserfunctions.test',
    functionsRoot: process.env.FUNCTIONS_ROOT || __dirname + '/../functions_root/',
    masterAccessKey: process.env.MASTER_ACCESS_KEY || 'MASTER_ACCESS_KEY',
    level: process.env.LOG_LEVEL || 'debug',
    protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
    isDev: process.env.NODE_ENV !== 'production',
    portInfo: process.env.NODE_ENV === 'production' ? '' : `:${process.env.PORT || 3000}`,
    chromeTabCount: 100,
    firefoxTabCount: 20
}

if (!config.isDev && !process.env.MASTER_ACCESS_KEY) {
    throw new Error('You must set an environment variable named MASTER_ACCESS_KEY in production mode.')
}

if (!config.isDev && !process.env.HOST) {
    throw new Error('You must set an environment variable named HOST in production mode.')
}

module.exports = config
