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

// Adapted from https://github.com/magnetikonline/markdown-toc-generate

const MARKDOWN_LINK_MATCH_REGEXP = /\[([^\]]+)\]\([^\)]+\)/g,
    MARKDOWN_INLINE_CODE_START_END_REGEXP = /^`[^`]+`$/,

    CODE_BLOCK_INDENT_REGEXP = /^ {4,}|\t/,
    CODE_BLOCK_FENCED_REGEXP = /^``` *([a-z]+)?$/,

    HEADER_HASH_REGEXP = /^(#{1,6})( +.+)$/,
    HEADER_UNDERLINE_REGEXP = /^(=+|-+)$/;

function $(id) {
    return document.getElementById(id);
}

function markdownStripMeta(text) {
    // attempt to strip out [links](#url) segments, leaving just [links]
    // note: very basic, won't handle repeated [] or () segments in link values well
    text = text.replace(
        MARKDOWN_LINK_MATCH_REGEXP,
        (match, linkLabel) => linkLabel
    );

    // if text starts and ends with a *single set* of inline code backticks, remove them
    if (MARKDOWN_INLINE_CODE_START_END_REGEXP.test(text)) {
        text = text.substring(1, text.length - 1);
    }

    return text;
}

function headerListFromMarkdown(markdown) {
    const markdownLineList = markdown.trim().split(/\r?\n/),
        headerList = [];

    let codeBlockFenceActive = false,
        lineItemPrevious;

    function addItem(level, text) {
        headerList.push({
            level: level,
            text: text
        });

        lineItemPrevious = undefined;
    }

    // work over each markdown line
    for (const lineItem of markdownLineList) {
        // indented code block line? if so, skip.
        if (CODE_BLOCK_INDENT_REGEXP.test(lineItem)) {
            continue;
        }

        const lineItemTrim = lineItem.trim();

        // fenced code block start/end?
        if (CODE_BLOCK_FENCED_REGEXP.test(lineItemTrim)) {
            codeBlockFenceActive = !codeBlockFenceActive;
            continue;
        }

        if (codeBlockFenceActive) {
            // skip all lines within a fenced code block
            continue;
        }

        // line match hash header style?
        const headerHashMatch = HEADER_HASH_REGEXP.exec(lineItemTrim);
        if (headerHashMatch) {
            addItem(
                headerHashMatch[1].length, // heading level
                markdownStripMeta(headerHashMatch[2].trim())
            );

            continue;
        }

        // line match underline header style?
        if (
            lineItemPrevious &&
            HEADER_UNDERLINE_REGEXP.test(lineItemTrim)
        ) {
            addItem(
                // '=' = level 1 header, '-' = level 2
                (lineItemTrim[0] == '=') ? 1 : 2,
                markdownStripMeta(lineItemPrevious)
            );

            continue;
        }

        lineItemPrevious = lineItemTrim;
    }

    return headerList;
}

function indentWith(style) {
    // tab mode
    if (style == 'tab') {
        return '\t';
    }

    // spaces mode
    const match = /^space-([0-9])$/.exec(style);
    return ' '.repeat((match) ? match[1] : 1);
}

function buildPageAnchor(text) {
    return stripPunctuation(text)
        .replace(/ /g, '-')
        .toLowerCase();
}

function buildTOCMarkdown(headerList, indentWith, skipFirst, maxLevel, generateLinkHref) {
    const pageAnchorSeenCollection = {};
    let currentHeaderLevel = -1,
        currentIndent = -1,
        markdownTOC = '';

    for (const headerItem of headerList) {
        // skip the first heading found?
        if (skipFirst) {
            skipFirst = false;
            continue;
        }

        if (headerItem.level > maxLevel) {
            continue;
        }

        // raise/lower indent level for next TOC item
        const headerLevel = headerItem.level;
        if (headerLevel > currentHeaderLevel) {
            currentIndent++;

        } else if (headerLevel < currentHeaderLevel) {
            currentIndent -= (currentHeaderLevel - headerLevel);
            currentIndent = Math.max(currentIndent, 0);
        }

        currentHeaderLevel = headerLevel;

        let pageAnchor = buildPageAnchor(headerItem.text);
        if (pageAnchorSeenCollection[pageAnchor] === undefined) {
            // new page anchor
            pageAnchorSeenCollection[pageAnchor] = 1;

        } else {
            // add increment to an already seen pageAnchor name
            pageAnchor = `${pageAnchor}-${pageAnchorSeenCollection[pageAnchor]++}`;
        }

        // build TOC line
        markdownTOC += (
            indentWith.repeat(currentIndent) +
            `- [${headerItem.text}](${generateLinkHref(pageAnchor)})\n`
        );
    }

    return markdownTOC;
}

function stripPunctuation(text) {
    let result = '';
    for (const char of text) {
        if ((char == '-') || (char == '_') || !isPunctuation(char.charCodeAt())) {
            result += char;
        }
    }

    return result;
}

function isPunctuation(charCode) {
    return (
        // simple characters
        ((charCode >= 33) && (charCode <= 47)) ||
        ((charCode >= 58) && (charCode <= 64)) ||
        ((charCode >= 91) && (charCode <= 96)) ||
        ((charCode >= 123) && (charCode <= 126)) ||

        // extended characters
        (charCode == 161) || (charCode == 167) || (charCode == 171) || (charCode == 182) ||
        (charCode == 183) || (charCode == 187) || (charCode == 191) || (charCode == 894) ||
        (charCode == 903) ||
        ((charCode >= 1370) && (charCode <= 1375)) ||
        (charCode == 1417) || (charCode == 1418) || (charCode == 1470) || (charCode == 1472) ||
        (charCode == 1475) || (charCode == 1478) || (charCode == 1523) || (charCode == 1524) ||
        (charCode == 1545) || (charCode == 1546) || (charCode == 1548) || (charCode == 1549) ||
        (charCode == 1563) || (charCode == 1566) || (charCode == 1567) ||
        ((charCode >= 1642) && (charCode <= 1645)) ||
        (charCode == 1748) ||
        ((charCode >= 1792) && (charCode <= 1805)) ||
        ((charCode >= 2039) && (charCode <= 2041)) ||
        ((charCode >= 2096) && (charCode <= 2110)) ||
        (charCode == 2142) || (charCode == 2404) || (charCode == 2405) || (charCode == 2416) ||
        (charCode == 2800) || (charCode == 3572) || (charCode == 3663) || (charCode == 3674) ||
        (charCode == 3675) ||
        ((charCode >= 3844) && (charCode <= 3858)) ||
        (charCode == 3860) ||
        ((charCode >= 3898) && (charCode <= 3901)) ||
        (charCode == 3973) ||
        ((charCode >= 4048) && (charCode <= 4052)) ||
        (charCode == 4057) || (charCode == 4058) ||
        ((charCode >= 4170) && (charCode <= 4175)) ||
        (charCode == 4347) ||
        ((charCode >= 4960) && (charCode <= 4968)) ||
        (charCode == 5120) || (charCode == 5741) || (charCode == 5742) || (charCode == 5787) ||
        (charCode == 5788) ||
        ((charCode >= 5867) && (charCode <= 5869)) ||
        (charCode == 5941) || (charCode == 5942) ||
        ((charCode >= 6100) && (charCode <= 6102)) ||
        ((charCode >= 6104) && (charCode <= 6106)) ||
        ((charCode >= 6144) && (charCode <= 6154)) ||
        (charCode == 6468) || (charCode == 6469) || (charCode == 6686) || (charCode == 6687) ||
        ((charCode >= 6816) && (charCode <= 6822)) ||
        ((charCode >= 6824) && (charCode <= 6829)) ||
        ((charCode >= 7002) && (charCode <= 7008)) ||
        ((charCode >= 7164) && (charCode <= 7167)) ||
        ((charCode >= 7227) && (charCode <= 7231)) ||
        (charCode == 7294) || (charCode == 7295) ||
        ((charCode >= 7360) && (charCode <= 7367)) ||
        (charCode == 7379) ||
        ((charCode >= 8208) && (charCode <= 8231)) ||
        ((charCode >= 8240) && (charCode <= 8259)) ||
        ((charCode >= 8261) && (charCode <= 8273)) ||
        ((charCode >= 8275) && (charCode <= 8286)) ||
        (charCode == 8317) || (charCode == 8318) || (charCode == 8333) || (charCode == 8334) ||
        ((charCode >= 8968) && (charCode <= 8971)) ||
        (charCode == 9001) || (charCode == 9002) ||
        ((charCode >= 10088) && (charCode <= 10101)) ||
        (charCode == 10181) || (charCode == 10182) ||
        ((charCode >= 10214) && (charCode <= 10223)) ||
        ((charCode >= 10627) && (charCode <= 10648)) ||
        ((charCode >= 10712) && (charCode <= 10715)) ||
        (charCode == 10748) || (charCode == 10749) ||
        ((charCode >= 11513) && (charCode <= 11516)) ||
        (charCode == 11518) || (charCode == 11519) || (charCode == 11632) ||
        ((charCode >= 11776) && (charCode <= 11822)) ||
        ((charCode >= 11824) && (charCode <= 11842)) ||
        ((charCode >= 12289) && (charCode <= 12291)) ||
        ((charCode >= 12296) && (charCode <= 12305)) ||
        ((charCode >= 12308) && (charCode <= 12319)) ||
        (charCode == 12336) || (charCode == 12349) || (charCode == 12448) || (charCode == 12539) ||
        (charCode == 42238) || (charCode == 42239) ||
        ((charCode >= 42509) && (charCode <= 42511)) ||
        (charCode == 42611) || (charCode == 42622) ||
        ((charCode >= 42738) && (charCode <= 42743)) ||
        ((charCode >= 43124) && (charCode <= 43127)) ||
        (charCode == 43214) || (charCode == 43215) ||
        ((charCode >= 43256) && (charCode <= 43258)) ||
        (charCode == 43310) || (charCode == 43311) ||
        (charCode == 43359) ||
        ((charCode >= 43457) && (charCode <= 43469)) ||
        (charCode == 43486) || (charCode == 43487) ||
        ((charCode >= 43612) && (charCode <= 43615)) ||
        (charCode == 43742) || (charCode == 43743) || (charCode == 43760) || (charCode == 43761) ||
        (charCode == 44011) || (charCode == 64830) || (charCode == 64831) ||
        ((charCode >= 65040) && (charCode <= 65049)) ||
        ((charCode >= 65072) && (charCode <= 65106)) ||
        ((charCode >= 65108) && (charCode <= 65121)) ||
        (charCode == 65123) || (charCode == 65128) || (charCode == 65130) || (charCode == 65131) ||
        ((charCode >= 65281) && (charCode <= 65283)) ||
        ((charCode >= 65285) && (charCode <= 65290)) ||
        ((charCode >= 65292) && (charCode <= 65295)) ||
        (charCode == 65306) || (charCode == 65307) || (charCode == 65311) || (charCode == 65312) ||
        ((charCode >= 65339) && (charCode <= 65341)) ||
        (charCode == 65343) || (charCode == 65371) || (charCode == 65373) ||
        ((charCode >= 65375) && (charCode <= 65381)) ||
        ((charCode >= 65792) && (charCode <= 65794)) ||
        (charCode == 66463) || (charCode == 66512) || (charCode == 66927) || (charCode == 67671) ||
        (charCode == 67871) || (charCode == 67903) ||
        ((charCode >= 68176) && (charCode <= 68184)) ||
        (charCode == 68223) ||
        ((charCode >= 68336) && (charCode <= 68342)) ||
        ((charCode >= 68409) && (charCode <= 68415)) ||
        ((charCode >= 68505) && (charCode <= 68508)) ||
        ((charCode >= 69703) && (charCode <= 69709)) ||
        (charCode == 69819) || (charCode == 69820) ||
        ((charCode >= 69822) && (charCode <= 69825)) ||
        ((charCode >= 69952) && (charCode <= 69955)) ||
        (charCode == 70004) || (charCode == 70005) ||
        ((charCode >= 70085) && (charCode <= 70088)) ||
        (charCode == 70093) ||
        ((charCode >= 70200) && (charCode <= 70205)) ||
        (charCode == 70854) ||
        ((charCode >= 71105) && (charCode <= 71113)) ||
        ((charCode >= 71233) && (charCode <= 71235)) ||
        ((charCode >= 74864) && (charCode <= 74868)) ||
        (charCode == 92782) || (charCode == 92783) || (charCode == 92917) ||
        ((charCode >= 92983) && (charCode <= 92987)) ||
        (charCode == 92996) || (charCode == 113823)
    );
}

function defaultGenerateLinkHref(anchorId) {
    return `#${anchorId}`
}

const defaultOptions = {
    generateTocLinkHref: defaultGenerateLinkHref,
    maxLevel: 3,
    skipFirst: false
}

export function generateToC(markdown, options = {}){
    const computedOptions = {...defaultOptions, ...options}

    return buildTOCMarkdown(
        headerListFromMarkdown(markdown),
        indentWith('tab'),
        computedOptions.skipFirst,
        computedOptions.maxLevel,
        computedOptions.generateTocLinkHref
    );
}


