// an element that subscribe to the topic and displays the last value
// topic get from topic attribute
// title came from title attribute

import {pubsub} from '../lib/pubsub.js';

class PubSubInfo extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style>
            div {
                background-color: rgba(100, 100, 100, 0.5);
                border: 1px solid gray;
                border-radius: 5px;
                color: white;
                font-size: 16px;
                padding: 2px 10px;
                margin-left: 4px;
                margin-right: 4px;
                white-space: nowrap;
                text-height: 10rem;
            }
        </style>
        <div>${this.getAttribute('title')}: <span id="value">0</span></div>
        `;
    }

    connectedCallback() {
        this.sub = pubsub.subscribe(this.getAttribute('topic'), this.update.bind(this));
    }

    disconnectedCallback() {
        pubsub.unsubscribe(this.sub);
    }

    update(value) {
        this.shadowRoot.getElementById('value').innerText = value.info;
    }
}

window.customElements.define('pubsub-info', PubSubInfo);
