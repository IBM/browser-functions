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

/**
 * Demo of setting response headers, and getting environment information
 * @param {Object} args - arguments
 * @param {Object} metadata - request headers, environment variables from environment.json 
 */
function main(args, metadata) {
    setStatus(201)  // set a custom response status code
    setHeader('Content-Type', 'text/html') // set a custom header
  
    // data to return
    return `<li>Browser: ${navigator.userAgent}
            <li>Args: <pre>${JSON.stringify(args, null, 2)}</pre>
            <li>Metadata: <pre>${JSON.stringify(metadata, null, 2)}</pre>`;
}