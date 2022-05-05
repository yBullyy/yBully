
console.log("Tweeting");
const tweetWS = new WebSocket('ws://127.0.0.1:8000/ws')
let tweetBtn = null;

tweetWS.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("On New Tweet Message", data);
  if (data.confidence < 0.5) {
    tweetBtn.click();
  } else {
    alert("You cannot post this tweet. It is likely a bully tweet. Please don't bully.");
  }
}


const cloneTweetButton = (tweetBtn) => {
  if (tweetBtn) {
    if (tweetBtn.getAttribute('data-mutated') === 'true') return;
    tweetBtn.setAttribute('data-mutated', 'true');
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
      tweetWS.send(text);
    })
    oberveTweetBtn.observe(tweetBtn, { attributes: true });
  }
};


let tweetBtnExists = false;
let oldUrl = "";

const tweetObserver = new MutationObserver((mutationsList, _) => {
  if (window.location.href !== oldUrl) {
    tweetBtnExists = false;
    oldUrl = window.location.href;
  }
  if (window.location.href === "https://twitter.com/compose/tweet") {
    mutationsList.forEach((_) => {
      if (!tweetBtnExists) {
        tweetBtn = document.querySelector('div[data-testid="tweetButton"]');
        cloneTweetButton(tweetBtn);
      }
    });
  } else if (window.location.href === 'https://twitter.com/home') {
    mutationsList.forEach((_) => {
      if (!tweetBtnExists) {
        tweetBtn = document.querySelector('div[data-testid="tweetButtonInline"]');
        cloneTweetButton(tweetBtn);
      }
    });
  }
});


tweetObserver.observe(bodyNode, { childList: true, subtree: true });

