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

import './app-functions.js'
import {withUtils} from "../utils/utils.js";

const template = document.createElement('template');
template.innerHTML = `
    <script type="text/javascript" src="../assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../assets/carbon-components@10.3.2/carbon-components.min.css"/>

    <app-functions></app-functions>
    
`;

class UserApp extends withUtils(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.$appName = this.$('#appName');

        this.appName = this.getAttribute('app-name')
        this.$appFunctions = this.$('app-functions');

        this.render()

        this.onAttributeChanged('app-name', (newValue) => {
            this.appName = newValue;
            this.render()
        })
    }

    static get observedAttributes() {
        return ['app-name'];
    }

    set functions(val) {
        setTimeout(() => {
            this.$appFunctions.functions = val
        })
    }

    set readOnly(val) {
        setTimeout(() => {
            this.$appFunctions.readOnly = val
        })
    }

    render() {
        setTimeout(() => {
            this.$appFunctions.appName = this.appName
        })
    }
}

window.customElements.define('user-app', UserApp);
