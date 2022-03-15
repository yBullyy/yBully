const config = {childList:true};

const bodyNode = document.querySelector('body');
const set = new Set();
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
const map = {};

const extractText = (node) => {
	try{
		const spanTags = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[1].children[1].children[1].children[0].getElementsByTagName('span');
		// console.log(spanTags);
		let text = "";
		for(let i =0;i<spanTags.length;i++){
			text += spanTags[i].innerText;
		}
		// console.log(text);
		map[text] = node;
		ws.send(text);
	}catch(e){
		console.log("failed");
	}
}


ws.onmessage = (event) => {
	const data = JSON.parse(event.data);
	const divTag = document.createElement('div');
	divTag.innerText = `Confidence - ${data.confidence}`;
	divTag.style.padding = '20px';
	map[data.text].children[0].appendChild(divTag);
	// console.log(typeof data.confidence);
	if(data.confidence > 0.5){
		map[data.text].style.backgroundColor = 'red';
	}
}

const extractTweets = (obs) => {
	const baseNode = document.querySelectorAll('.css-1dbjc4n[aria-label^="Timeline"]');
	// console.log(baseNode);
	if(baseNode.length > 0){
			found = 1;
			setTimeout(() => {
				const targetNode = baseNode[0].children[0];
				// console.log(targetNode);
				const childrenNodes = targetNode.children;
				// console.log(childrenNodes.length);
				for(let i=0;i<childrenNodes.length;i++){
					// console.log(childrenNodes[i]);
					extractText(childrenNodes[i]);
				}
				const callback = function(mutationsList, observer) {
				    for(const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						// Fix sending requests to api
						for(let i=0;i<mutation.addedNodes.length;i++){
							if(!set.has(mutation.addedNodes[i])){
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
			},1000);
			// obs.disconnect();
	};
};

let oldHref = "";
let found = 0;

const targetObserver = new MutationObserver((mutationsList,obs) => {
	mutationsList.forEach((_) => {
		// console.log(oldHref,document.location.href);
		if(oldHref != document.location.href){
			oldHref = document.location.href;
			found = 0;
			extractTweets();
		}else if(!found){
			extractTweets();
		}
	})
	// extractTweets(obs);
});


targetObserver.observe(bodyNode,{childList:true,subtree:true});


