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
    <script type="text/javascript" src="/assets/carbon-components@10.3.2/carbon-components.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/assets/carbon-components@10.3.2/carbon-components.min.css"/>
    <style>
        footer {
            background-color: #3f3f3f;
            color: white;
            padding: 1rem;
            display: flex;
            flex-direction: row;
        }
        
        a {
            text-decoration: none;
            color: inherit;
            margin: 0 1em;
        }
    </style>
    
<footer class="bx--website-footer">
    <a href="https://app.slack.com/client/T0D0Z6X2N/CMNM4Q9D4/" target="_blank">Community</a> |
    <a href="mailto:toby.kurien@za.ibm.com?subject=Browser%20Functions%20Feedback" target="_blank">Email us</a> |
    <a href="https://www.ibm.com/privacy/za/en/?lnk=flg-priv-zaen" target="_blank">Privacy Policy</a> | 
    <a href="https://www.ibm.com/legal/za/en/?lnk=flg-tous-zaen" target="_blank">Terms of Use</a>
</footer>
`

class PageFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

window.customElements.define('page-footer', PageFooter);
