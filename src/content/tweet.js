
const bodyNode = document.querySelector('body');
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
let tweetBtn = null;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("On New Tweet Message", data);
  if (data.confidence < 0.5) {
    tweetBtn.click();
  } else {
    alert("Bully Tweet");
  }
}


const cloneTweetButton = () => {
  tweetBtn = document.querySelector('div[data-testid="tweetButton"]');
  console.log("New Tweet", tweetBtn);
  if (tweetBtn) {
    tweetBtnExists = true;
    const clonedBtn = tweetBtn.cloneNode(true);
    const oberveTweetBtn = new MutationObserver((mutationsList, _) => {
      mutationsList.forEach((mutation) => {
        console.log(mutation.attributeName);
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          clonedBtn.className = mutation.target.className;
        }
      })
    });
    tweetBtn.style.visibility = "hidden";
    tweetBtn.parentNode.appendChild(clonedBtn);
    clonedBtn.addEventListener('click', () => {
      const tweetTextArea = document.querySelector('div[aria-label="Tweet text"]');
      const spanTags = tweetTextArea.getElementsByTagName('span');
      let text = "";
      for (let i = 0; i < spanTags.length; i++) {
        if (spanTags[i].children.length === 0) {
          text += spanTags[i].innerHTML;
        }

      }
      // console.log(text);
      ws.send(text);
    })
    oberveTweetBtn.observe(tweetBtn, { attributes: true });
  }
};


let tweetBtnExists = false;

const targetObserver = new MutationObserver((mutationsList, _) => {
  if (window.location.href === "https://twitter.com/compose/tweet") {
    mutationsList.forEach((_) => {
      if (!tweetBtnExists)
        cloneTweetButton();
    });
  } else {
    tweetBtnExists = false;
  }
});


targetObserver.observe(bodyNode, { childList: true, subtree: true });
