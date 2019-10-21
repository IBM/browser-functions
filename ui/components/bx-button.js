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
    <script type="text/javascript" src="/assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/assets/carbon-components@10.3.2/carbon-components.min.css"/>

    <style>
        :host {
            display: block;
        }
        
        .bx--btn--tertiary {
            border-color: black;
            color: black;
        }
        
        .bx--btn--tertiary .bx--btn__icon path {
            fill: black;
        }
                
        .bx--btn--tertiary:hover {
            background-color: #e5e5e5;
            color: black;
        }
        
        button {
            width: 100%;
        }
    </style>
    
    <button class="bx--btn" type="button">
        <slot></slot>
    </button>
`;

const typeClassnames = {
    primary: "bx--btn--primary",
    secondary: "bx--btn--secondary",
    tertiary: "bx--btn--tertiary",
}

class BxButton extends withUtils(HTMLElement) {
    static get observedAttributes() {
        return ['disabled'];
    }

    constructor() {
        super();
        this.attachShadow({ 'mode': 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const iconString = this.getAttribute("icon")

        if (iconString) {
           this.insertIcon(iconString)
        }
        const type = this.getAttribute("type") || 'primary'
        const size = this.getAttribute("size")

        if (size === 'small') {
            this.$('button').classList.add('bx--btn--sm')
        }

        this.$('button').classList.add(typeClassnames[type])


        this.setDisabledState()
        this.onAttributeChanged('disabled', () => this.setDisabledState())
    }

    setDisabledState() {
        const disabled = this.hasAttribute("disabled")
        if (disabled) {
            this.$('button').setAttribute("disabled", "")
        } else {
            this.$('button').removeAttribute("disabled")
        }
    }

    async insertIcon(iconString) {
        const icons = await import("./icons.js")
        const svg = document.createElement('svg');
        this.$("button").appendChild(svg)
        svg.outerHTML = icons[iconString]
    }
}
window.customElements.define('bx-button', BxButton);
