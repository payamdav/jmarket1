import {pubsub} from '../lib/pubsub.js';

class PubCmd extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style>
            input {
                background-color: rgba(0, 0, 0, 1);
                border: 1px solid gray;
                border-radius: 5px;
                color: white;
                font-size: 16px;
                padding: 5px 10px;
                margin-left: 4px;
                margin-right: 4px;
                width: 800px;


            }
        </style>
        <input type="text" id="cmd" name="cmd">
        `;
    }

    connectedCallback() {
        this.addEventListener('keypress', this.publish);
    }

    disconnectedCallback() {
        this.removeEventListener('keypress', this.publish);
    }

    publish(ev) {
        if (ev.keyCode === 13) {
            let cmd = this.shadowRoot.getElementById('cmd').value;
            // console.log(`CMD: ${cmd}`);
            pubsub.publish('cmd', cmd);
            this.shadowRoot.getElementById('cmd').value = '';
        }

    }
}

window.customElements.define('pub-cmd', PubCmd);
