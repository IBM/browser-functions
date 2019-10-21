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
    <script type="text/javascript" src="./assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    <link rel="stylesheet" type="text/css" href="./assets/carbon-components@10.3.2/carbon-components.min.css"/>

    <style>
        .bx--btn {
            border-width: 0;
        }
    </style>
    
    <button class="bx--btn bx--btn--ghost bx--btn--sm" type="button">
        <slot></slot>
        <div id="icon-svg"></div>
    </button>
`;

class IconButton extends withUtils(HTMLElement) {
    static get observedAttributes() {
        return ['icon'];
    }

    constructor() {
        super();
        this.attachShadow({ 'mode': 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const iconString = this.getAttribute("icon")

        if (iconString) {
            this.insertIcon(iconString)
        }

        this.onAttributeChanged('icon', (newValue) => {
            this.insertIcon(newValue)
        })
    }

    async insertIcon(iconString) {
        const icons = await import("./icons.js")
        const svg = document.createElement('svg');
        const svgContainer = this.$("#icon-svg")
        svgContainer.clear()
        svgContainer.appendChild(svg)
        svg.outerHTML = icons[iconString]
    }
}
window.customElements.define('icon-button', IconButton);
