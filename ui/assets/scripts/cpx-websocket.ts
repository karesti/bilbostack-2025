export class CPXWebSocket extends HTMLElement {
    template;

    _url = '';
    get url() { return this._url; }
    set url(val) {
        if (this._url === val) return;
        this._url = val;
        this.setAttribute('url',this._url);
    }
    _ready:boolean;
    get ready() { return this._ready; }
    set ready(val) {
        if (this._ready === val) return;
	this._ready = val;
	this.setAttribute('ready',this._ready.toString());
	this.dispatchEvent(new CustomEvent('cpx-socket-ready',{ bubbles:true,composed:true}));
	}

    get state() { return ['connecting','open','closing','closed'][this.socket.readyState]}

    _socket:WebSocket;
    get socket() { return this._socket; }
    set socket(val) {
        if (this._socket === val) return;
        this._socket = val;
    }

    _data:Map<string,any>;
    get data() { return this._data; }
    set data(val) {
        if (this._data === val) return;
        this._data = val;
        this.render();
    }

    constructor(url:string) {
        super();
        this.attachShadow({ mode: "open" });
        this.template = this.querySelector('template').cloneNode(true);
        this.prepTemplate();
        //document.createElement('template');

        this.logState = this.logState.bind(this);
        this.logMessage = this.logMessage.bind(this);
        this.logError = this.logError.bind(this);
    }

    connectedCallback() {
        //this.template.innerHTML = this.querySelector('template').innerText;
        // this.shadowRoot.appendChild(this.cssStyles);
        this.socket = new WebSocket(this.url);
        this.socket.addEventListener('open', this.logState);
        this.socket.addEventListener('message', this.logMessage);
        this.socket.addEventListener('close', this.logState);
        this.socket.addEventListener('error', this.logError);
    }

    static get observedAttributes() {
        return ['url']
    }

    attributeChangedCallback(name:string, oldVal, newVal:any) {
        this[name] = newVal;
    }

    prepTemplate() {
        let repeatEls = this.template.content.querySelectorAll('[data-repeat]');
        if (repeatEls.length > 0) {
            repeatEls.forEach(el=> {
                let dr = el.getAttribute('data-repeat');
                if (dr.length === 0) {
                    let drtxt = btoa(el.innerHTML.trim());
                    el.setAttribute('data-repeat',drtxt);
                    while (el.firstChild) { el.removeChild(el.firstChild); }
                } 
            });
        }
        this.template.innerHTML = this.template.innerHTML.replaceAll(/\${([^{]+[^}])}/g,'<var data-val="$1"></var>');
	}

    renderTemplate(data, ele?) {
        let eltmpl;
        if (ele.getAttribute) {
            eltmpl = ele.getAttribute('data-repeat');
        }
        data.forEach((v,k)=> {
            let els = isNaN(k) ? ele.querySelectorAll(`var[data-val=${k}]`) : [];
            let attrNodes = isNaN(k) ? ele.querySelectorAll(`[data-attr=${k}]`):[];
            switch (typeof v) {
                case 'object':
                    if (eltmpl) {
                        let tmpl = atob(eltmpl)
                        for (const [key,val] of Object.entries(v)) {
                            tmpl = tmpl.replaceAll('${'+key+'}',val);
                        };
                        ele.innerHTML += tmpl;
                    }
                    break;
                default:
                    // See if any instances of the string exist
                    if (els.length !== 0) {
                        els.forEach(el=> {
                            el.innerHTML = v;
                        });
                    } 
                    if (attrNodes.length !== 0) {
                        attrNodes.forEach(n=> {
                            if (n.getAttribute(`data-${k}`) !== v.toString()) {
                                n.setAttribute(`data-${k}`,v.toString());
                            }
                        });
                    }
                    //this.template.innerHTML = this.template.innerHTML.replaceAll('${'+k+'}',v);
                    break;
            }
            //this.template.innerHTML = this.template.innerHTML.replaceAll('${'+k+'}',v);
        })
    }

    render() {
        if(this.data) {
            let repeatEls = this.shadowRoot.querySelectorAll('[data-repeat]');
            if (repeatEls.length >0) {
                repeatEls.forEach(el=>{
                    while (el.firstChild) { el.removeChild(el.firstChild); }
                    this.renderTemplate(this.data, el);
                });                
            } 
            this.renderTemplate(this.data, this.shadowRoot);
            
            if (!this.shadowRoot.firstChild) {
                //while (this.shadowRoot.firstChild) { this.shadowRoot.removeChild(this.shadowRoot.firstChild); }
		this.shadowRoot.appendChild(this.template.content.cloneNode(true));
		this.ready = true;
            }
            
        }
    }

    replaceData(el, data, tmpl) {

    }

    start() {
        if (this.state !== 'open' && this.state !== 'connecting') {
            this.socket = new WebSocket(this.url);
        }
    }

    stop() { this.socket.close(); }
    close() { this.socket.close(); }
    
    logState(e) {
        console.log('ReadyState:', ['connecting','open','closing','closed'][this.socket.readyState]);
    }

    logMessage(e) {
        const message = JSON.parse(e.data);
        const msgData = new Map<string, any>(Object.entries(message));
        if (typeof message.length === 'number') { msgData.set('length',message.length); }
        this.data = msgData;
        //console.log(e.data);
    }

    logError(e) {
        console.log('Error:', e);
    }
}
window.customElements.define('cpx-websocket', CPXWebSocket);
