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

import { withUtils } from "../utils/utils.js";

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="/assets/carbon-components@10.3.2/carbon-components.min.css"/>
    <script defer type="text/javascript" src="/assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    
    <style>

    </style>
    
    <header class="bx--header">
        <a class="bx--header__name" id="header-link" href="/"><slot name="title">Cloud Code by Aspen</slot></a>
        <slot name="menuItems" class="menu-items">
        </slot>
        <div class="bx--header__global">
            <slot name="menuItemsRight" class="menu-items">
            </slot>
        
            <button aria-label="Help" class="bx--header__action" type="button" id="help-button">
            <svg width="20px" height="20px" viewBox="2 2 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Help4---1px" stroke="none" stroke-width="1" fill-rule="evenodd">
                    <path d="M10,17 C13.8659932,17 17,13.8659932 17,10 C17,6.13400675 13.8659932,3 10,3 C6.13400675,3 3,6.13400675 3,10 C3,13.8659932 6.13400675,17 10,17 Z M10,18 C5.581722,18 2,14.418278 2,10 C2,5.581722 5.581722,2 10,2 C14.418278,2 18,5.581722 18,10 C18,14.418278 14.418278,18 10,18 Z" id="Oval"  fill-rule="nonzero"></path>
                    <circle id="Oval-3" cx="10" cy="14" r="1"></circle>
                    <path d="M10.5,10.5 L10.5,12 L9.5,12 L9.5,10 L9.5,9.5 L10.5,9.5 C11.3284271,9.5 12,8.82842712 12,8 C12,7.17157288 11.3284271,6.5 10.5,6.5 L9.5,6.5 C8.67157288,6.5 8,7.17157288 8,8 L7,8 C7,6.61928813 8.11928813,5.5 9.5,5.5 L10.5,5.5 C11.8807119,5.5 13,6.61928813 13,8 C13,9.38071187 11.8807119,10.5 10.5,10.5 Z" id="Combined-Shape" ></path>
                </g>
            </svg>
            </button>
        </div>
    </header>
`;

class PageHeader extends withUtils(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({ 'mode': 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.querySelector('#help-button').addEventListener('click', () => {
            window.location.href = "/docs"
        })

        const url = new URL(window.location)
        let hostnameParts = url.hostname.split('.');
        url.hostname = hostnameParts.slice(hostnameParts.length - 2, hostnameParts.length).join('.')
        url.pathname = ''
        url.search = ''
        this.$('#header-link').href = url.toString()
    }
}

window.customElements.define('page-header', PageHeader);
