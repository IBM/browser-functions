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

const template = document.createElement('template');
template.innerHTML = `
    <style>
    :host {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        background-color: white;
    }
    
    .markdown-body {
        width: 100%;
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
    }
    </style>
    <link rel="stylesheet" type="text/css" href="/assets/marked/github-markdown.min.css"/>
    <link rel="stylesheet" href="/assets/highlightjs/default.min.css">
    
    <div class="markdown-body">
    
    </div>
`;

class MarkdownContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    set value(newValue) {
        this.shadowRoot.querySelector('.markdown-body').innerHTML = newValue
    }

}

window.customElements.define('markdown-container', MarkdownContainer);
