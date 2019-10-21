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

import "/assets/marked/marked.min.js"
import {generateToC} from "./toc.js";

export function withUtils(superclass) {
    class HtmlMixin extends superclass {

        constructor() {
            super()
            this.attributeChangedHandlers = {}
        }

        $(selector) {
            let element
            if (this.shadowRoot) {
                element = this.shadowRoot.querySelector(selector)
            } else {
                element = document.querySelector(selector)
            }
            if (element) {
                return enhanceElement(element)
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            const callback = this.attributeChangedHandlers[name]
            if (callback) {
                callback(newValue)
            }
        }

        onAttributeChanged(attribute, callback) {
            if(!this.constructor.observedAttributes || !this.constructor.observedAttributes.includes(attribute)) {
                throw new Error(`Attribute '${attribute}' must be added to the list of observedAttributes`)
            }
            this.attributeChangedHandlers[attribute] = callback
        }

        bindAttribute(attribute, callback) {
            if(!this.constructor.observedAttributes || !this.constructor.observedAttributes.includes(attribute)) {
                throw new Error(`Attribute '${attribute}' must be added to the list of observedAttributes`)
            }
            this.attributeChangedHandlers[attribute] = callback
            callback(this.getAttribute(attribute))
        }
    }

    return HtmlMixin
}

function enhanceElement(element) {
    element.clear = function () {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }

    element.show = function () {
        this.style.display = 'block'
    }

    element.hide = function () {
        this.style.display = 'none'
    }

    element.enable = function () {
        this.removeAttribute('disabled')
    }

    element.disable = function () {
        this.setAttribute('disabled', '')
    }

    element.remove = function () {
        this.parentElement.removeChild(this)
    }
    return element
}

export function formToJSON( elem ) {
    let output = {};
    new FormData( elem ).forEach(
        ( value, key ) => {
            // Check if property already exist
            if ( Object.prototype.hasOwnProperty.call( output, key ) ) {
                let current = output[ key ];
                if ( !Array.isArray( current ) ) {
                    // If it's not an array, convert it to an array.
                    current = output[ key ] = [ current ];
                }
                current.push( value ); // Add the new value to the array.
            } else {
                output[ key ] = value;
            }
        }
    );
    return output;
}

const tocLiteral = '[TOC]'

const generateTocLinkHref = (pageAnchor) => `javascript:document.querySelector('markdown-container').shadowRoot.getElementById('${pageAnchor}').scrollIntoView()`

export const fetchMarkdownAsHtml = async (fileName) => {
    let fileContent = await (await fetch(fileName)).text()

    marked.setOptions({
        highlight: function(code, lang) {
            try {
                return hljs.highlight(lang, code).value;
            } catch(e) {
                return code
            }
        },
    })
    let html = marked(fileContent)
    //html = html.replace(/href=\"(.*).md/g,'href=\"?$1.md') // ensure all links change the hash instead of navigating away

    if (fileContent.includes(tocLiteral)) {
        const remainingMarkdown = fileContent.substring(fileContent.indexOf(tocLiteral))
        const tocMarkdown = generateToC(remainingMarkdown, { generateTocLinkHref : generateTocLinkHref, maxLevel: 3 })
        const tocHtml = marked(tocMarkdown)
        html = html.replace(tocLiteral, tocHtml)
    }

    return html
}



export function $(selector) {
    return enhanceElement(document.querySelector(selector))
}

