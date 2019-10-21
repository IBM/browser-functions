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
    <script type="text/javascript" src="./assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    <link rel="stylesheet" type="text/css" href="./assets/carbon-components@10.3.2/carbon-components.min.css"/>
    
    <style>
        :host {
            width: 100%;
        }
        
        .bx--text-input__field-wrapper {
            width: 100%;
        }
    </style>

    
    <div class="bx--form-item bx--text-input-wrapper">
        <label for="text-input" class="bx--label">Text Input label</label>
        <div id="helper-text" class="bx--form__helper-text">
            Optional helper text goes here
        </div>
        <div class="bx--text-input__field-wrapper">
            <input id="text-input" type="text" class="bx--text-input" name="test" placeholder="Placeholder text" >
        </div>
    </div>

`;

class BxInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const placeholder = this.getAttribute("placeholder") || ''
        const label = this.getAttribute("label") || ''
        const helperText = this.getAttribute("helper-text") || ''
        const name = this.getAttribute("name") || ''

        this.shadowRoot.querySelector('#helper-text').innerHTML = helperText
        this.shadowRoot.querySelector('label').innerHTML = label
        this.shadowRoot.querySelector('#text-input').setAttribute('placeholder', placeholder)
        this.shadowRoot.querySelector('#text-input').setAttribute('name', name)
    }
}

window.customElements.define('bx-input', BxInput);
