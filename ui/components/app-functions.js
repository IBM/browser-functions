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
import {directory, file, functionIcon, search} from "./icons.js";
import "./icon-button.js"
import "./bx-button.js"

const tableTemplate = document.createElement('template');
tableTemplate.innerHTML = `
    <link rel="stylesheet" type="text/css" href="../assets/carbon-components@10.3.2/carbon-components.min.css"/>
    <script type="text/javascript" src="../assets/carbon-components@10.3.2/carbon-components.min.js"></script>

    <style>
        tr.bx--parent-row:not(.bx--expandable-row)+tr[data-child-row] {
            display: none;
        }     
        
        .bx--expandable-row {
            font-weight: bold;
        }
        
        .file-icon {
            width: 2rem !important;
        }
        
        .edit, .delete {
            width: 6rem;
        }
        
        bx-button {
            width: 180px;
            min-width: 180px;
        }
        
        a {
            text-decoration: none;
            color: #565656;
        }
    </style>
    
    <div class="bx--data-table-container " data-table>
        <div class="bx--data-table-header">
            <h4 class="bx--data-table-header__title" id="app-name">Table title</h4>
            <p class="bx--data-table-header__description"></p>
        </div>
        
        <section class="bx--table-toolbar ">
            <div class="bx--toolbar-content">
            
                <div class="bx--toolbar-search-container-persistent">
                    <div data-search class="bx--search bx--search--sm" role="search" id="search">
                        <div class="bx--search-magnifier"> ${search} </div>
                        <label id="search-input-label-1" class="bx--label" for="search__input-2">Search</label>
                        <input class="bx--search-input" type="text" id="search-input" role="search" placeholder="Search" aria-labelledby="search-input-label-1">
                        <button class="bx--search-close bx--search-close--hidden" title="Clear search input" aria-label="Clear search input">
                            <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"></path></svg>
                        </button>
                    </div>
                </div>

            
                <bx-button type="tertiary" id="logs-button" icon="list">View Logs</bx-button>
                <bx-button type="secondary" id="create-button" icon="plus">Create Function</bx-button>  
            </div>
        
        </section>
        
        <table id="data-table" class="bx--data-table">
          <thead>
            <tr>
                <th></th> <!--expander-->
                <th class="file-icon"></th> <!--icon-->
                <th>
                    <span class="bx--table-header-label">Name</span>
                </th>
                <th>
                </th>
                <th class="edit"></th><!--edit-->
    
                <th class="delete"></th><!--delete-->
    
            </tr>
          </thead>
          <tbody>
              
          </tbody>
        </table>
    </div>
`;

const fileRowTemplate = document.createElement('template');
fileRowTemplate.innerHTML = `
<tr>
      <td></td>
      <td class="file-icon"></td>
      <td class="fncName">
        <a class="fncNameLink" target="_blank"></a>
      </td>
      <td class="fncUrl"></td>     
      <td class="edit"><icon-button id="edit-button" icon="editIcon"></icon-button></td>     
      <td class="delete"><icon-button id="delete-button" icon="deleteIcon"></icon-button></td>     
</tr>
`

const folderRowTemplate = document.createElement('template');
folderRowTemplate.innerHTML = `
<tr class="bx--parent-row" data-parent-row>
    <td class="bx--table-expand" data-event="expand">
        <button class="bx--table-expand__button">
            <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--table-expand__svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 8l-5 5-.7-.7L9.6 8 5.3 3.7 6 3z"></path></svg>
        </button>
    </td>
    <td class="file-icon" data-event="expand"></td>
    <td class="fncName fncNameLink" data-event="expand">
    </td>
    <td class="fncUrl"></td>     
    <td class="edit"><icon-button id="edit-button" icon="editIcon"></icon-button></td>     
    <td class="delete"><icon-button id="delete-button" icon="deleteIcon"></icon-button></td>     
</tr>
<tr class="bx--expandable-row bx--expandable-row--hidden" data-child-row>

    <td colspan="20" style="padding: 0; padding-left: 2em; background-color: #dcdcdc">
        <table style="width: 100%">
              <tbody class="child-content">
                  
              </tbody>
        </table>
    </td>
</tr>
`

function makeLink(url) {
    return `<a href="${url}" target="_blank">${url}</a>`
}

class AppFunctions extends withUtils(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({'mode': 'open'});
        this.shadowRoot.appendChild(tableTemplate.content.cloneNode(true));

        this.$tBody = this.$('tbody');

        this.$('#create-button').addEventListener('click', () => {
            window.location.href = '/create' + window.location.search
        })

        this.$('#logs-button').addEventListener('click', () => {
            window.location.href = '/logs' + window.location.search
        })

        this.render()
    }

    set functions(val) {
        this._functions = val
        this.render()
    }

    set appName(val) {
        this.$('#app-name').innerText = val
    }

    set readOnly(val) {
        this._readonly = val
    }

    get functions() {
        return this._functions
    }

    get readOnly() {
        return this._readonly || false
    }

    getIconForFileType(fileType) {
        switch (fileType) {
            case 'directory':
                return directory
            case 'file':
                return file
        }
    }

    populateRow(rowNode, fileName , fileDetails) {
        if (fileDetails.runtime) {
            rowNode.querySelector('.file-icon').innerHTML = functionIcon
        } else {
            rowNode.querySelector('.file-icon').innerHTML = this.getIconForFileType(fileDetails._type)
        }

        let fncNameLink = rowNode.querySelector('.fncNameLink');
        fncNameLink.innerHTML = fileName
        if (fileDetails.staticUrl) {
            fncNameLink.href = fileDetails.staticUrl

        } else {
            fncNameLink.href = '#'

        }
        rowNode.querySelector('.fncUrl').innerHTML = fileDetails.executeUrl ?  makeLink(fileDetails.executeUrl) : ''

        let filePath = fileName;
        if (fileDetails.executeUrl) {
            filePath = new URL(fileDetails.executeUrl).pathname.substring(9); // strip out /execute/
        }

        rowNode.getElementById('delete-button').addEventListener('click', () => {
            const deleteEvent = new CustomEvent('delete', {
                bubbles: true,
                composed: true,
                detail: {functionName: filePath}
            })
            this.dispatchEvent(deleteEvent);
        })

        if (!fileDetails.executeUrl) {
            rowNode.getElementById('edit-button').style.display = 'none'
        } else {
            rowNode.getElementById('edit-button').addEventListener('click', () => {
                const editEvent = new CustomEvent('edit', {
                    bubbles: true,
                    composed: true,
                    detail: {functionName: filePath}
                })
                this.dispatchEvent(editEvent);
            })
        }
    }

    renderFileItem(fileName , fileDetails, parentNode) {
        let rowNode = fileRowTemplate.content.cloneNode(true)
        this.populateRow(rowNode, fileName, fileDetails)
        if (this.readOnly) {
            rowNode.getElementById('delete-button').style.display = 'none';
        }
        parentNode.appendChild(rowNode)
    }

    renderFolderItem(fileName , fileDetails, parentNode) {
        let rowNode = folderRowTemplate.content.cloneNode(true)
        this.populateRow(rowNode, fileName, fileDetails)
        if (this.readOnly) {
            rowNode.getElementById('delete-button').style.display = 'none';
        }

        this.renderItems(fileDetails, rowNode.querySelector('.child-content'))
        parentNode.appendChild(rowNode)
    }

    renderItems(items, nodeToRenderInto) {
        if (!items) {
            return
        }

        for (let fileName of Object.keys(items)) {
            if (fileName.startsWith('_')) {
                continue
            }
            const fileDetails = items[fileName]

            if (fileDetails._type === 'directory') {
                this.renderFolderItem(fileName, fileDetails, nodeToRenderInto)

            } else {
                this.renderFileItem(fileName, fileDetails, nodeToRenderInto)
            }
        }
    }

    render() {
        if (!this.functions) {
            return
        }

        this.renderItems(this.functions, this.$tBody)
        if (this.readOnly) {
            this.shadowRoot.getElementById('create-button').style.display = 'none';
        }

        // initialize the table
        CarbonComponents.DataTable.create(this.$('#data-table'));
        CarbonComponents.Search.create(this.$('#search'));
    }
}

window.customElements.define('app-functions', AppFunctions);
