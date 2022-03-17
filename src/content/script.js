const config = { childList: true };



let isExtensionOn = true;
const bodyNode = document.querySelector('body');
const allTweets = new Set();
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
const map = {};



// Get current setting of user
chrome.storage.local.get(['isOn'], (key) => {
	isExtensionOn = key.isOn;
});

const revealTweet = (e) => {
    e.target.classList.add("hidden"); // remove the button
    e.target.previousSibling.classList.remove("blur"); // remove blur effect
};

const addBlur = (node) => {
	let parent = node.children[0].children[0];
	let revealButton = document.createElement('button');
	revealButton.addEventListener('click', (e) => revealTweet(e));
	revealButton.innerText = `Reveal Tweet`;
	revealButton.classList.add("btn", "btn-primary", "revealTweet");
	revealButton.setAttribute("type", "button");
    
	parent.classList.add("blur");
    parent.parentElement.appendChild(revealButton);
}

const addLabel = (node) => {
	let topDiv = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[0].children[0];
	// add div to children to topDiv at the end
	let divTag = document.createElement('div');
	divTag.innerText = `Bully`;
	divTag.className = 's-label';
	topDiv.appendChild(divTag);
}

let selectedAction = addBlur;

chrome.storage.sync.get(['action'], function (result) {
	switch (result.action) {
		case 'blur':
			selectedAction = addBlur;
			break;
		case 'label':
			selectedAction = addLabel;
			break;
		case 'remove':
			selectedAction = addBlur;
			break;
		default:
			selectedAction = addBlur;
			break;
	}
});


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
	if (data.confidence > 0) {
		selectedAction(map[data.text]);
	}
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
	  if(key === 'isOn' || key === 'action'){ // Whenever isOn key is changed reload the page
		  location.reload();
	  }
  }
});




const extractTweets = (obs) => {
	const baseNode = document.querySelectorAll('.css-1dbjc4n[aria-label^="Timeline"]');
	if (baseNode.length > 0 && !found) {
		found = true;
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
							if (!allTweets.has(mutation.addedNodes[i])) {
								extractText(mutation.addedNodes[i]);
								allTweets.add(mutation.addedNodes[i]);
							}
						}
					}
				}
			};

			const observer = new MutationObserver(callback);

			// Start observing the target node for configured mutations
			observer.observe(targetNode, config);
		// setTimeout(()=> {
		// },1000)
		// obs.disconnect();
	};
};

let oldHref = "";
let found = false;

const targetObserver = new MutationObserver((mutationsList, obs) => {
	mutationsList.forEach((_) => {
		if (oldHref != document.location.href) {
			oldHref = document.location.href;
			found = false;
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


