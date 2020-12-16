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

const urlParams = new URLSearchParams(window.location.search);
let jobId = urlParams.get('jobId')
const response = {
    'status': 200,
    'headers': {},
    'modified': false,
    'body': undefined
}
let headersSent = false;

watchdogReset()
const wdTimer = setInterval(() => { watchdogReset() }, 500);

window.onerror = function (messageOrEvent, source, lineno, colno, error) {
    jobError({
        'event': messageOrEvent,
        'source': source,
        'line': lineno,
        'column': colno,
        'error': error
    })

    return true;
}

window.addEventListener('message', (evt) => {
    onMessage(evt);
}, false)

window.onload = () => {
    if (isBackend()) {
        // get job data from controller
        window.opener.postMessage({
            event: 'GET_JOB_DATA', tabName: window.name, jobId: jobId
        }, "*")
    } else {
        args = {}
        urlParams.forEach((v, k) => {
            args[k] = v
        })

        let jobData = {
            'args': args,
            'metadata': window.metadata
        }

        // simulate a postMessage with jobdata
        onMessage({
            'data': {
                'event': 'JOB_DATA',
                'jobData': jobData
            }
        })
    }
}

async function onMessage(event) {
    try {

        if (event.data.event === 'JOB_DATA') {
            let jobData = event.data.jobData;
            jobId = jobData.jobId;
            const result = await main(jobData.args, jobData.metadata);
            if (result && result.next) {
                // stream iterator results back
                let res = await result.next()
                while (!res.done) {
                    jobStream(res.value)
                    res = await result.next()
                }
                jobCompleted()
            } else {
                jobCompleted(result)
            }
        }
    } catch (err) {
        jobError(err)
    }
}

// Test for if this is loaded locally or via server
function isBackend() {
    return window.opener ? true : false
}

function setStatus(code) {
    response.status = code;
    response.modified = true;
}

function setHeader(key, value) {
    response.headers[key] = value;
    response.modified = true;
}

function jobCompleted(obj) {
    clearInterval(wdTimer)
    console.log('Job Completed')
    const res = buildResponse(obj)
    showResult(res)
    if (isBackend()) {
        // if response headers/status set, then send those
        window.opener.postMessage({ event: 'JOB_COMPLETED', result: res, jobId: jobId }, "*")
    }
}

function jobError(err) {
    clearInterval(wdTimer)
    const serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err))
    console.error('Job Failed')
    showError(serializedError)

    if (isBackend()) {
        window.opener.postMessage({ event: 'JOB_FAILED', error: serializedError, jobId: jobId }, "*")
    }
}

function jobStream(obj) {
    console.log('Job stream')
    const res = buildResponse(obj)
    showResult(res)
    if (isBackend()) {
        window.opener.postMessage({ event: 'JOB_STREAM', result: res, jobId: jobId }, "*")
    }
}

function buildResponse(obj) {
    if (!headersSent && response.modified) {
        headersSent = true; // don't send headers more than once

        // headers or status was set, so wrap into a response type object
        response.body = obj;
        return response;
    }

    return obj;
}

function watchdogReset() {
    if (isBackend()) {
        window.opener.postMessage({ event: 'JOB_WATCHDOG_RESET', tabName: window.name, jobId: jobId }, "*")
    }
}

function showResult(obj) {
    console.log("Result:")
    if (typeof obj === 'object') {
        console.log(JSON.stringify(obj))
    } else {
        console.log(obj)
    }
}

function showError(obj) {
    console.error("Error:")
    console.error(obj)
}

// Add a delay without triggerring the watchdog
const sleep = milliseconds => {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    });
};

function doSetup() {
    if (isBackend()) {
        // disallow certain things on the server
        window.alert = function (obj) { console.log(obj) }
        window.prompt = function () { return true }
        window.confirm = function () { return true }
        window.open = function () { return null }
    }
}

doSetup();
