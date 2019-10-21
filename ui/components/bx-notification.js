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

    
    <div id="notification" data-notification class="bx--inline-notification" role="alert">
        <div class="bx--inline-notification__details">
            <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--inline-notification__icon" width="20" height="20" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 5a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 16 7zm4 17.12h-8v-2.24h2.88v-6.76H13v-2.24h4.13v9H20z"></path></svg>
            <div class="bx--inline-notification__text-wrapper">
                <p id="title" class="bx--inline-notification__title">Notification title</p>
                <p id="subtitle" class="bx--inline-notification__subtitle">Subtitle text goes here.</p>
            </div>
        </div>
        <button data-notification-btn class="bx--inline-notification__close-button" type="button" aria-label="close">
            <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--inline-notification__close-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
        </button>
    </div>
`;

const typeClasses = {
    error: "bx--inline-notification--error",
    info: "bx--inline-notification--info",
    success: "bx--inline-notification--success",
    warning: "bx--inline-notification--warning",
}

class BxNotification extends withUtils(HTMLElement) {
    static get observedAttributes() {
        return ['subtitle', 'title'];
    }

    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const type = this.getAttribute("type") || 'info'
        const title = this.getAttribute("title") || ''
        const subtitle = this.getAttribute("subtitle") || ''

        this.$('#title').innerHTML = title
        this.$('#subtitle').innerHTML = subtitle
        this.$('#notification').classList.add(typeClasses[type])

        this.onAttributeChanged('subtitle',(newValue) => {
            this.$('#subtitle').innerHTML = newValue
        })

        this.onAttributeChanged('title',(newValue) => {
            this.$('#title').innerHTML = newValue
        })
    }
}

window.customElements.define('bx-notification', BxNotification);
