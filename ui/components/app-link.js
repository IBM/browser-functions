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

import {withUtils} from "../utils/utils.js";

const template = document.createElement('template');
template.innerHTML = `
    <style>
    
        :host: {
            display: block;
            padding: 0;
        }
        a {
            text-decoration: none;
            color: white;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        a:hover {
            background-color: white;
            color: black;
        }
    </style>
    
    <a href="#">
        <slot></slot>
    </a>
`
class AppLink extends withUtils(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const url = new URL(window.location)
        let hostnameParts = url.hostname.split('.');
        this.baseDomain = hostnameParts.slice(hostnameParts.length - 2, hostnameParts.length).join('.')
        this.application = this.getAttribute('application')

        url.pathname = ''

        if (this.hasAttribute('application')) {
            url.hostname = `${this.application}.${this.baseDomain}`
        } else {
            url.hostname = this.baseDomain

        }

        if (this.hasAttribute('access-key')) {
            url.search = `?access-key=${this.getAttribute('access-key')}`
        } else {
            url.search = ''
        }

        this.$('a').href = url.toString()
    }
}

window.customElements.define('app-link', AppLink);
