const config = { childList: true };


const bodyNode = document.querySelector('body');
const allTweets = new Set();
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
const map = new Map();
const BULLY_THRESHOLD = 0.5;


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

chrome.storage.sync.get(['action'], function(result) {
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


const getText = (node) => {
  const spanParentNode = node.getElementsByTagName('article')[0].querySelector('div[lang]');
  const spanTags = spanParentNode.getElementsByTagName('span') || [];
  let text = "";
  for (let i = 0; i < spanTags.length; i++) {
    text += spanTags[i].innerText;
  }
  return text;
}


const extractText = (node) => {
  try {
    const text = getText(node);
    const { tweetId, tweetUsername } = getTweetId(node);
    console.log(node, text);
    if (text !== "") {
      map.set(text, { node, tweetId, tweetUsername });
      ws.send(text);
    }
  } catch (e) {
    console.log(e);
    console.log("Failed to extract text", node);
  }
}


ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  let isBully = data.confidence > BULLY_THRESHOLD;
  chrome.runtime.sendMessage({ type: "ScanTweets", tweet: data.text, isBully: isBully }, (resp) => {
    console.log("ScanTweets", resp);
  });
  const tweetObj = map.get(data.text);
  addReportButton(tweetObj.node);
  if (isBully) {
    selectedAction(tweetObj.node);
  }
  map.get(data.text)['bully'] = isBully;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'isOn' || key === 'action') { // Whenever isOn key is changed reload the page
      location.reload();
    }
  }
});

const blacklistedClasses = ['Timeline: Trending now'];


const getTweetId = (node) => {
  const tweetLink = node.querySelector('time').parentElement.href;
  const tweetUsername = tweetLink.split('/')[3];
  const tweetId = tweetLink.split('/')[5];
  return { tweetUsername, tweetId };
}

const onReportClick = (event) => {
  event.stopPropagation();
  const tweetText = event.target.getAttribute('data-tweet-text');
  const { bully, tweetId, tweetUsername } = map.get(tweetText);
  const correctLabel = bully ? "not_bully" : "bully";
  console.log(tweetId, tweetText, correctLabel);
  chrome.runtime.sendMessage({ type: "ReportTweet", tweetId, tweetText, correctLabel, tweetUsername }, (resp) => {
    event.target.style.backgroundColor = "green";
    event.target.innerText = "Reported";
  });
}

const addReportButton = (node) => {
  try {
    console.log("Adding report button", node);
    let topDiv = node.getElementsByTagName('article')[0].children[0].children[0].children[0].children[0].children[0];
    const tweetText = getText(node);
    // add div to children to topDiv at the end
    let divTag = document.createElement('div');
    divTag.innerText = `Report`;
    divTag.className = 's-label-report hide';
    divTag.setAttribute('data-tweet-text', tweetText);
    divTag.addEventListener('click', onReportClick);
    topDiv.appendChild(divTag);
    node.classList.add("tweet");

  } catch (e) {
    console.log("Failed to add report button", node);
    console.log(e);
  }
}


const extractTweets = (obs) => {
  const baseNode = document.querySelectorAll('.css-1dbjc4n[aria-label^="Timeline"][aria-label]');
  const ariaLabelText = baseNode[0]?.getAttribute('aria-label');
  const isNodeBlackListed = blacklistedClasses.includes(ariaLabelText);
  if (baseNode.length > 0 && !found && !isNodeBlackListed) {
    console.log(baseNode);
    const targetNode = baseNode[0].children[0];
    if (targetNode.children[0].getAttribute('role') !== 'progressbar')
      found = true;
    if (targetNode.getAttribute('data-mutated') === 'true') {
      return;
    } else {
      targetNode.setAttribute('data-mutated', 'true');
    }
    const childrenNodes = targetNode.children;
    for (let i = 0; i < childrenNodes.length; i++) {
      extractText(childrenNodes[i]);
    }
    const callback = function(mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            extractText(mutation.addedNodes[i]);
            if (!allTweets.has(mutation.addedNodes[i])) {
              allTweets.add(mutation.addedNodes[i]);
            }
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  };
};

let oldHref = "";
let found = false;

const targetObserver = new MutationObserver((mutationsList, obs) => {
  mutationsList.forEach((_) => {
    if (oldHref != document.location.href) {
      oldHref = document.location.href;
      found = false;
      map.clear();
      setTimeout(() => {
        extractTweets();
      }, 1000);
    } else if (!found) {
      setTimeout(() => {
        extractTweets();
      }, 1000);
    }
  })
});


targetObserver.observe(bodyNode, { childList: true, subtree: true });

