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

// https://github.com/auderer/stencil-styled-components/blob/master/lib/inject-styles.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
    :host {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background-color: #f3f3f3;
    }
    </style>
    <slot></slot>
`;



export function styled() {


    class CustomElement extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ 'mode': 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
        }

    }

    window.customElements.define('page-container', PageContainer);


}
