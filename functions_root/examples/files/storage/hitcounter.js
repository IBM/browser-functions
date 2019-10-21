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
 * Persistent storage demo - visitor hit counter.
 * This example makes use of CouchDb/CloudantDb to store persistent data
 */

function loadDocument(env, documentId) {
  return fetch(env.db_url + "/" + documentId, {
    headers: {
      'Authorization': 'Basic ' + btoa(env.db_key + ":" + env.db_token)
    }
  }).then(function (response) {
    return response.json();
  })
}

function saveDocument(env, documentId, data) {
  return fetch(env.db_url + "/" + documentId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(env.db_key + ":" + env.db_token)
    },
    body: JSON.stringify(data)
  }).then(function (response) {
    return response.json();
  })
}

async function main(args, md) {
  // load the latest hit count
  const documentId = 'd96f7b3877d64f73afaf4f22a44ae737';
  let data = await loadDocument(md.env, documentId)

  // increment hit count
  hits = data['hits'] || 0;
  data['hits'] = ++hits;

  // send result back right away
  jobStream(hits)

  // sync the hit count back to storage
  let ret = await saveDocument(md.env, documentId, data);

  return;
}