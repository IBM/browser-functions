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

'use strict';

/*
*  Fast UUID generator for node
*  Adapted from https://gist.github.com/coolaj86/7e5ebb9a6708d0ebfc78
* */

var crypto = require('crypto');
var pool = 31 * 128; // 36 chars minus 4 dashes and 1 four
var r = crypto.randomBytes(pool);
var j = 0;
var str = "10000000-1000-4000-8000-100000000000";
var len = str.length; // 36
var strs = [];

strs.length = len;
strs[8] = '-';
strs[13] = '-';
strs[18] = '-';
strs[23] = '-';

function uuid(){
    var ch;
    var chi;

    for (chi = 0; chi < len; chi++) {
        ch = str[chi];
        if ('-' === ch || '4' === ch) {
            strs[chi] = ch;
            continue;
        }

        // no idea why, but this is almost 4x slow if either
        // the increment is moved below or the >= is changed to >
        j++;
        if (j >= r.length) {
            r = crypto.randomBytes(pool);
            j = 0;
        }

        if ('8' === ch) {
            strs[chi] = (8 + r[j] % 4).toString(16);
            continue;
        }

        strs[chi] = (r[j] % 16).toString(16);
    }

    return strs.join('');
}

module.exports = { v4: uuid };