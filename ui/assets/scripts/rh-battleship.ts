/*
    Colors
*/

// SHADERS

const vertexShader2D = `
attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}`

const fragmentShader2D = `
precision mediump float;

void main() {
    gl_FragColor = vec4(0.153,0.584,0.961,1.0);
}
`;

class RHBattleship extends HTMLElement {
    constructor(id,cols,rows) {
        super();
        this.attachShadow({ mode: "open" });
        //this.shadowRoot.innerHTML = "<style>:host { width: 100%; display:block; border: 3px dashed #151515;}</style><slot></slot>";
        //this.self_drop_handler = this.self_drop_handler.bind(this);
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('webgl');
        this.cells = [this.canvas.clientWidth/cols, this.canvas.clientHeight/rows];
        //this.size = (new Array(rows)).fill((new Array(cols).fill(this.getRandomColor())));
        this._frame = 0;
        this._width = 250;
        this._height = 250;
        this.shaders = [this.createShader(this.context.VERTEX_SHADER, vertexShader2D), this.createShader(this.context.FRAGMENT_SHADER, fragmentShader2D)];
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.cssStyles);
        this.shadowRoot.appendChild(this.canvas);
        this.program = this.createProgram(this.shaders[0],this.shaders[1]);
        this.positionAttributeLocation = this.context.getAttribLocation(this.program, "a_position");
        this.positionBuffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionBuffer);
        this.render();
    }

    static get observedAttributes() {
        return ['width','height','frame']
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this[name] = newVal;
    }
    get cssStyles() {
        let css = document.createElement('style');
        css.type = 'text/css';
        let styles = `
            :host {
                --boardHeight: ${this.height};
                --boardWidth: ${this.width};
                display:block;
                /* border: 2px solid black; */
                height: var(--boardHeight, ${this.height}px);
                width: var(--boardWidth, ${this.width}px);
            }
        `;
        if (css.styleSheet) css.styleSheet.cssText = styles;
        else css.appendChild(document.createTextNode(styles))
        return css;
    }
    get size() { return [this.width,this.height]; }
    set size(val) {
        if(val.length === 2) {
            this.width = parseInt(val[0]);
            this.height = parseInt(val[1]);
        } else {
            this.width = parseInt(val);
            this.height = parseInt(val);
        }
        
    }
    get width() { return this._width; }
    set width(val) {
        if (this.width.toString() === val.toString()) return;
        this._width = parseInt(val);
        this.setAttribute('width',val.toString())
        this.canvas.width = val;
        this.render();
    }
    get height() { return this._height; }
    set height(val) {
        if (this.height.toString() === val.toString()) return;
        this._height = parseInt(val);
        this.setAttribute('height',val.toString())
        this.canvas.height = val;
        this.render();
    }
    get frame() {
        return this._frame;
    }
    set frame(val) {
        if (this.frame.toString() === val.toString()) return;
        this._frame = parseInt(val);
        this.setAttribute('frame', val.toString());
    }

    get data() {

    }
    set data(val) {
        console.log(val);
    }
    render() {
        this.style.setProperty('--boardHeight', this.height+'px');
        this.style.setProperty('--boardWidth', this.width+'px');
        this.canvas.setAttribute('width',this.width);
        this.canvas.setAttribute('height', this.height);
        console.log("Rendering:",this.frame);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([0,0,0,0.5,0.7,0,]), this.context.STATIC_DRAW);
        this.context.clearColor(0.153,0.584,0.961,1.0);
        this.context.clear(this.context.COLOR_BUFFER_BIT);
        this.context.userProgram(this.program);
        this.context.endableVertexAttribArray(this.positionAttributeLocation);
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionBuffer);
        this.context.vertexAttribPointer(this.positionAttributeLocation, 2, this.context.FLOAT, false, 0, 0);
        // this.size.forEach((row,r) => {
        //     row.forEach((col,c) => {
        //         // this.context.fillStyle = col;
        //         // this.context.fillRect(c*this.cells[0],r*this.cells[1],this.cells[0],this.cells[1]);
        //     });
        // });
    }
    getRandomColor() {
        return `rgb(${Math.floor(100*Math.random())},${Math.floor(100*Math.random())},${Math.floor(100*Math.random())})`;
    }
    createShader(type, source, gl=this.context) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        gl.deleteShader(shader);
    }
    createProgram(vertexShader, fragmentShader,gl=this.context) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}
window.customElements.define('rh-battleship',RHBattleship);