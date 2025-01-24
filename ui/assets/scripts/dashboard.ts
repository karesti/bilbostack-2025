document.addEventListener('cpx-socket-ready', e=>{
	if (e.target.id==='stats') {
		let dashboard = document.querySelector('#dashboard');
		let statusCont = document.querySelector('#status');
		let replayCont = document.querySelector('#replay');
        let targetDoc = e.target.shadowRoot;
		let gameState =  targetDoc.querySelector('[data-attr="game-state"]');
		let gameId;
        let mutConfig = {attributes:true};
		const callback = (mutationList, observer) => {
            for(const mutation of mutationList) {
                if (mutation.type === 'attributes') {
					switch (mutation.target.getAttribute('data-game-state')) {
						case 'replay':
							gameId = targetDoc.querySelector('[data-attr="game-id"]').getAttribute('data-game-id');
							dashboard.className = 'hidden';
							replayCont.className = '';
							if (!replayCont.querySelectorAll('rh-replay').length) {
								fetch(`/replay/${gameId}`)
								.then(resp=>resp.json())
								.then(data=>{
									data.map(replay=> {
										let replayNode = document.createElement('rh-replay');
										replayNode['data'] = replay;
										replayNode['interval'] = 0.75;
										replayNode['loop'] = false;
										replayCont.appendChild(replayNode);
									});
								})
								.then(() => {
									dispatchEvent(new CustomEvent('start-replay', { bubbles: true}));	
								});
							} else {
								dispatchEvent(new CustomEvent('start-replay', { bubbles: true}));	
							}
						break;
						case 'lobby':
							dashboard.className = '';
							replayCont.className = 'hidden';
							dispatchEvent(new CustomEvent('stop-replay', { bubbles: true}));	
							break;
						case 'paused':
							dashboard.className = '';
							replayCont.className = 'hidden';
							dispatchEvent(new CustomEvent('stop-replay', { bubbles: true}));	
							break;
						case 'stopped':
							dashboard.className = '';
							replayCont.className = 'hidden';
							statusCont.innerHTML = `<strong>** CLAIM YOUR PRIZE**</strong>
                    		<p>Winners can claim their prize on the Game Over screen.</p>`;
							dispatchEvent(new CustomEvent('stop-replay', { bubbles: true}));	
							break;
						default:
							dashboard.className = '';
							replayCont.className = 'hidden';
							dispatchEvent(new CustomEvent('stop-replay', { bubbles: true}));	
							break;
					}
                }
            }
        };

        const observer = new MutationObserver(callback);
		observer.observe(gameState,mutConfig);
	}
});