; // SPDX-FileCopyrightText: 2021 Gary Wang <toblumia@outlook.com>
; // SPDX-License-Identifier: MIT
class ProgressBar extends HTMLElement {

    static get observedAttributes() {
        return ['value', 'buffer', 'data-chapters'];
    }
    
    constructor() {
        super(); // always call super() first in the constructor.
        const shadow = this.attachShadow({mode: 'open'});
        
        const container = document.createElement('div');
        container.setAttribute('class', 'container');
        
        const bufferBar = document.createElement('div');
        bufferBar.setAttribute('id', 'bufferbar');
        
        const timeBar = document.createElement('div');
        timeBar.setAttribute('id', 'timebar');
        
        const chapterContainer = document.createElement('div');
        chapterContainer.setAttribute('id', 'chapter-container');
        
        const style = document.createElement('style');
        style.textContent = `
            .container {
                height: 1.5em;
                position: relative;
                background-color: #f1f1f1;
            }
            .container > div {
                height: 100%;
                position: absolute;
            }
            #timebar {
                background-color: #2196F3;
            }
            #bufferbar {
                background-color: #AAA;
            }
            .container, #chapter-container {
                width: 100%;
            }
            .chapter {
                height: 100%;
                width: stretch; width: -moz-available; width: -webkit-fill-available;
                border-left: .15em solid #0045F340;
                position: absolute;
            }
        `;
        
        shadow.appendChild(container);
        shadow.appendChild(style);
        container.appendChild(bufferBar);
        container.appendChild(timeBar);
        container.appendChild(chapterContainer);
    }
    
    connectedCallback() {
        spawnChapters(this);
        updateStyle(this);
    };
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "data-chapters") {
            spawnChapters(this);
        } 
        updateStyle(this);
    }
}

function spawnChapters(elem) {
    const shadow = elem.shadowRoot;
    let chapterContainer = shadow.querySelector('#chapter-container');
    let chapters = elem.dataset.chapters ? JSON.parse(elem.dataset.chapters) : [];

    if (!Array.isArray(chapters)) return;
    chapterContainer.textContent = '';
    chapters.forEach((chapter) => {
        let chapterElem = document.createElement('div');
        chapterElem.setAttribute('class', 'chapter');
        chapterElem.setAttribute('title', `${chapter.title}`);
        chapterElem.setAttribute('style', `left: ${chapter.start}%`);
        chapterContainer.appendChild(chapterElem);
    });
}

function updateStyle(elem) {
    const shadow = elem.shadowRoot;
    let timebar = shadow.querySelector('#timebar');
    timebar.setAttribute('style', `width: ${elem.getAttribute('value')}%`);
    let bufferbar = shadow.querySelector('#bufferbar');
    bufferbar.setAttribute('style', `width: ${elem.getAttribute('buffer')}%`);
}

customElements.define('pcm-progress', ProgressBar);
