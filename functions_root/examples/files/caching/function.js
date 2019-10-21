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

// cache function output to localStorage (memoize)
async function cache(cacheName, func) {
  if (localStorage && localStorage.getItem(cacheName)) {
    return localStorage.getItem(cacheName);
  }

  let ret = await func.apply(this);

  if (localStorage) {
    localStorage.setItem(cacheName, ret);
  }

  return ret;
}

// Example of caching to browser local storage
async function main(args, md) {
  let greetee = args.name || "world";

  return cache(greetee, async () => {
    // artificial slow-down, should be fast if coming from cache
    await sleep(2000);
    return "Hello, " + greetee;
  });
}
