const config = { childList: true };

const bodyNode = document.querySelector('body');
const set = new Set();

const extractText = (node) => {
    const spanTags = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[1].children[1].children[1].children[0].getElementsByTagName('span');
    let text = "";
    for (let i = 0; i < spanTags.length; i++) {
        text += spanTags[i].innerText;
    }
    console.log(text);
    // Faking Prediction
    if (Math.random() > 0.5) {
        node.style.backgroundColor = "red";
    }
}

const targetObserver = new MutationObserver((mutationsList, obs) => {
    const baseNode = document.querySelectorAll('.css-1dbjc4n[aria-label^="Timeline: "]');
    if (baseNode.length > 0) {
        console.log(baseNode);
        const targetNode = baseNode[0].children[0];
        const callback = function (mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
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
        obs.disconnect();
    };
});


targetObserver.observe(bodyNode, config);


