
// draggable overlay window

class DragWin extends HTMLElement {
    constructor() {
        super();
    
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            :host {
            display: block;
            position: absolute;
            z-index: 1000;
            background-color: transparent;
            border: 1px solid lightgray;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            cursor: move;
            }
        </style>
        <div style="display: flex; margin: 0px;">
        <slot></slot>
        </div>
        `;
    }
    
    connectedCallback() {
        this.addEventListener('mousedown', this.startDrag);
    }
    
    disconnectedCallback() {
        this.removeEventListener('mousedown', this.startDrag);
    }
    
    startDrag(e) {
        // e.preventDefault();
    
        const rect = this.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
    
        const move = (e) => {
        this.style.left = e.clientX - offsetX + 'px';
        this.style.top = e.clientY - offsetY + 'px';
        };
    
        const stop = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', stop);
        };
    
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
    }

}

window.customElements.define('drag-win', DragWin);

