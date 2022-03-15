const config = { childList: true };

const bodyNode = document.querySelector('body');
const set = new Set();


// $(
//     "<button type='button' class='btn btn-outline-primary revealTweet'>Reveal Tweet</button>"
// ).click((e) => revealTweet(e));

const extractText = (node) => {
    const spanTags = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[1].children[1].children[1].children[0].getElementsByTagName('span');
    let text = "";
    for (let i = 0; i < spanTags.length; i++) {
        text += spanTags[i].innerText;
    }
    console.log(text);

    let revealButton = document.createElement('button');
    revealButton.addEventListener('click', (e) => revealTweet(e));
    revealButton.innerText = "Reveal Tweet";
    revealButton.classList.add("btn", "btn-outline-primary", "revealTweet");
    revealButton.setAttribute("type", "button");

    let blurParent = node.children[0].children[0];
    console.log("blurParent", blurParent);
    addBlur(blurParent, revealButton);

    // // Faking Prediction
    // node.style.backgroundColor = "red";
    // if (Math.random() > 0.5) {
    //     node.style.backgroundColor = "red";
    // }


}

const revealTweet = (e) => {
    console.log("Reveal Tweet");
    console.log(e.target);
    // e.target.previousElementSibling.classList.add("hidden");
    // remove the button
    e.target.classList.add("hidden");
    // remove blur effect
    e.target.previousSibling.classList.remove("blur");
};

const addBlur = (parent, revealButton) => {
    console.log("Add blur");
    console.log(parent);

    parent.classList.add("blur");
    parent.parentElement.appendChild(revealButton);
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


