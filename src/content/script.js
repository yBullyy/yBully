const config = { childList: true };

const bodyNode = document.querySelector('body');
const set = new Set();
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
const map = {};


const revealTweet = (e) => {
    e.target.classList.add("hidden"); // remove the button
    e.target.previousSibling.classList.remove("blur"); // remove blur effect
};

const addBlur = (parent, revealButton) => {
    parent.classList.add("blur");
    parent.parentElement.appendChild(revealButton);
}

const extractText = (node) => {
	try {
		const spanTags = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[1].children[1].children[1].children[0].getElementsByTagName('span');
		let text = "";
		for (let i = 0; i < spanTags.length; i++) {
			text += spanTags[i].innerText;
		}
		map[text] = node;
		ws.send(text);
	} catch (e) {
		console.log("Failed to extract text");
	}
}


ws.onmessage = (event) => {
	const data = JSON.parse(event.data);
	// const divTag = document.createElement('div');
	// divTag.innerText = `Confidence - ${data.confidence}`;
	// divTag.style.padding = '20px';
	// map[data.text].children[0].appendChild(divTag);
	if (data.confidence > 0) {
		let revealButton = document.createElement('button');
		revealButton.addEventListener('click', (e) => revealTweet(e));
		revealButton.innerText = `Reveal Tweet`;
		revealButton.classList.add("btn", "btn-primary", "revealTweet");
		revealButton.setAttribute("type", "button");

		let blurParent = map[data.text].children[0].children[0];
		addBlur(blurParent, revealButton);
		// map[data.text].style.backgroundColor = 'red';
	}
}



const extractTweets = (obs) => {
	const baseNode = document.querySelectorAll('.css-1dbjc4n[aria-label^="Timeline"]');
	if (baseNode.length > 0) {
		found = 1;
			const targetNode = baseNode[0].children[0];
			const childrenNodes = targetNode.children;
			for (let i = 0; i < childrenNodes.length; i++) {
				extractText(childrenNodes[i]);
			}
			const callback = function (mutationsList, observer) {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						// Fix sending requests to api
						for (let i = 0; i < mutation.addedNodes.length; i++) {
							if (!set.has(mutation.addedNodes[i])) {
								extractText(mutation.addedNodes[i]);
								set.add(mutation.addedNodes[i]);
							}
						}
					}
				}
			};

			const observer = new MutationObserver(callback);

			// Start observing the target node for configured mutations
			observer.observe(targetNode, config);
		// obs.disconnect();
	};
};

let oldHref = "";
let found = 0;

const targetObserver = new MutationObserver((mutationsList, obs) => {
	mutationsList.forEach((_) => {
		if (oldHref != document.location.href) {
			oldHref = document.location.href;
			found = 0;
			setTimeout(() => {
				extractTweets();
			}, 1000);
		} else if (!found) {
			setTimeout(() => {
				extractTweets();
			}, 1000);
		}
	})
	// extractTweets(obs);
});


targetObserver.observe(bodyNode, { childList: true, subtree: true });


