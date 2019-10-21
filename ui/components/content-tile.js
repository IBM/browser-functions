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
            width: 100%;
            display: block;
            flex-basis: 33.33%;
            padding: 10px;
        }
        
        #tile {  
            height: 100%;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2rem;
        }
        
        #header {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #61d4d1;
        }
        
        #content {
            font-size: 1rem;
            line-height: 1.4em;
        }

        #link {
            display: inline-block;
            border: 1px solid #56d3d0;
            color: #56d3d0;
            padding: 8px 20px;
            margin: 2vw 0 0 0;
            font-weight: 600;
            text-decoration: none;
        }

        #link:hover {
            background: #56d3d0;
            color: #000;
        }
    </style>
    <div id="tile">
        <h2 id="header"></h2>
        <div id="content"><slot></slot></div>
        <a id="link" href="/docs">Learn more <span>»</span></a>
    </div>
`

class ContentTile extends withUtils(HTMLElement) {

    static get observedAttributes() {
        return ['header']
    }

    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.bindAttribute('header', (value) => {
            this.$('#header').innerText = value
        })

    }
}

window.customElements.define('content-tile', ContentTile);
