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

/*
* Adapted from https://github.com/alexbbt/read-last-lines (MIT licenced)
* */

const fs = require('fs')
const fsPromises = fs.promises

const NEW_LINE_CHARACTERS = ["\n", "\r"];
const encoding = "utf8";

const readPreviousChar = function (stat, file, currentCharacterCount) {
    return new Promise((resolve, reject) => {
        fs.read(file.fd, Buffer.alloc(1), 0, 1, stat.size - 1 - currentCharacterCount,
            (err, bytesRead, buffer) => {
            resolve(buffer.toString('utf8', 0, 1));
        })
    })
};

async function readLastLines(input_file_path, maxLineCount) {
    // check that we can read the file
    await fsPromises.access(input_file_path, fs.constants.R_OK)

    const stat = await fsPromises.stat(input_file_path)
    const file = await fsPromises.open(input_file_path, "r")

    let chars = 0;
    let lineCount = 0;
    let lines = "";

    const readNextLine = async function () {
        if (lines.length > stat.size) {
            lines = lines.substring(lines.length - stat.size);
        }

        if (lines.length >= stat.size || lineCount >= maxLineCount) {
            if (NEW_LINE_CHARACTERS.includes(lines.substring(0, 1))) {
                lines = lines.substring(1);
            }

            console.log('closing', file)
            await file.close()
            return Buffer.from(lines, "binary").toString(encoding);
        }

        const nextCharacter = await readPreviousChar(stat, file, chars)

        lines = nextCharacter + lines;
        if (NEW_LINE_CHARACTERS.includes(nextCharacter) && lines.length > 1) {
            lineCount++;
        }
        chars++;

        return readNextLine()
    }

    return readNextLine()

}

module.exports = {
    readLastLines
};
