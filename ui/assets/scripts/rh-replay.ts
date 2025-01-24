const template = `
<style>
	:host { display:block; width: 100%; animation: .5s ease-in blipIn; }
	@keyframes blipIn { 
		from { transform: scaleY(0); }
		to { transform: scaleY(1); }
	}
</style>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 410">
	<defs>
		<style>
			.boardcell { fill: var(--ocean); stroke: #fff; stroke-width: 2px; }
			.boardcont { stroke: #fff; stroke-width: 2px;}
		</style>
		<pattern id="p1board" width="40" height="40" patternUnits="userSpaceOnUse">
			<rect class="boardcell" width="40" height="40"></rect>
		</pattern>
		<pattern id="p2board" width="40" height="40" y="2" patternUnits="userSpaceOnUse">
			<rect class="boardcell" width="40" height="40"></rect>
		</pattern>
	</defs>
	<rect class="boardcont" x="0" y="0" width="200" height="200" fill="url(#p1board)"></rect>
	<line x1="0" y1="201" x2="200" y2="201" stroke="white" stroke-width="2"></line>
	<rect class="boardcont" x="0" y="202" width="200" height="200" fill="url(#p2board)"></rect>
	<g id="turns">
	</g>
</svg>`;

export class RHReplay extends HTMLElement {
	turn = 0;
	turns = [];
	players = [];
	startTime;
	timer;

	_loop = true;
	get loop() { return this._loop; }
	set loop(val) { 
		if (typeof val === 'string') val = true;
		if (this._loop === val) return;
		this._loop = val;
		if (this._loop) {
			this.setAttribute('loop','');
		} else {
			this.removeAttribute('loop');
		}
	}

	_interval = 1;
	get interval() { return this._interval; }
	set interval(val) {
		val = parseFloat(val);
		if (this._interval === val) return;
		this._interval = val;
		this.setAttribute('interval',this._interval.toString());
		if (this.timer) {
			this.stop();
			this.start();
		}
	}

	set data(val) {
		this.players = [...val.reduce((a,c)=>a.add(c.attacker),new Set())];
		this.turns = val.map(v=> {
			let boardIdx = this.players.indexOf(v.attacker);
			let img = document.createElementNS('http://www.w3.org/2000/svg','image');
			img.setAttributeNS(null,'x',String((v.origin[0]*40)+5));
			img.setAttributeNS(null,'y', String((v.origin[1]*40)+5+(boardIdx*202)));
			img.setAttributeNS(null,'width', '30');
			img.setAttributeNS(null,'height','30');
			img.setAttributeNS('http://www.w3.org/1999/xlink','href', v.hit ? '/img/hit-peg.png':'/img/miss-peg.png');
			return img;
		});
	}

	[Symbol.iterator]() {
		return this;
	}
	next() {
		let turnsCont = this.shadowRoot.querySelector('#turns');
		if (this.turn >= this.turns.length && this.loop) {
			while (turnsCont.firstChild) { turnsCont.removeChild(turnsCont.firstChild); }
			this.turn = 0;
		}
		if (this.turn >= this.turns.length && !this.loop) {
			return { done: true };
		}

		turnsCont.appendChild(this.turns[this.turn]);
		return {
			value: this.turns[this.turn++],
			done: false
		}
	}

	start() { this.timer = setInterval(e => this.next(), this.interval*1000); }
	stop() { clearInterval(this.timer); this.timer = undefined; }
	reset() { 
		this.stop(); 
		let turnsCont = this.shadowRoot.querySelector('#turns');
		if (this.turn >= this.turns.length && this.loop) {
			while (turnsCont.firstChild) { turnsCont.removeChild(turnsCont.firstChild); }
			this.turn = 0;
		}
	}

	constructor() {
		super();
		this.attachShadow({mode:"open"});
		let tmpl = document.createElement('template');
		tmpl.innerHTML = template;
		this.shadowRoot.appendChild(tmpl.content.cloneNode(true));
	}

	connectedCallback() {
		top.addEventListener('start-replay', e => { this.start(); });
		top.addEventListener('stop-replay', e => { this.stop(); });
	}

	static get observedAttributes() { return ['loop','interval'] }

	attributeChangedCallback(attr, old, val) { this[attr] = val; }
}

window.customElements.define('rh-replay', RHReplay);
