// button that publish a message to pubsub
// display name get from name attribute
// publish topic get from topic attribute
// publish message get from message attribute
// button background color must have 50% opacity

import {pubsub} from '../lib/pubsub.js';

class PubButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style>
            button {
                background-color: rgba(100, 100, 100, 0.5);
                border: 1px solid gray;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-size: 16px;
                padding: 5px 10px;
                margin-left: 4px;
                margin-right: 4px;


            }
        </style>
        <button>${this.getAttribute('name')}</button>
        `;
    }

    connectedCallback() {
        this.addEventListener('click', this.publish);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.publish);
    }

    publish() {
        // console.log(`publishing ${this.getAttribute('message')} to ${this.getAttribute('topic')}`);
        pubsub.publish(this.getAttribute('topic'), this.getAttribute('message'));
    }
}

window.customElements.define('pub-button', PubButton);
