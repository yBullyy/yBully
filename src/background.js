import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as env from './env';
import { saveUserToFirestore, updateDailyScannedTweets, updateGeneralStats, updateUserStats, addReportedTweet, updateDailyReports } from './pages/helpers/firebase';

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  databaseURL: env.FIREBASE_DATABASE_URL,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


let bully = new Set();
let noBully = new Set();
let reportedCount = 0;
let twitterTabIds = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Recieved message", request);
  switch (request.type) {
    case 'saveUserToFirestore':
      console.log('saveUserToFirestore');
      saveUserToFirestore(request.user)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((err) => {
          console.log(err);
          sendResponse({ success: false });
        });
      break;
    case 'ScanTweets':
      console.log('ScanTweets => switch case');
      let tabId = sender.tab.id;
      if (!twitterTabIds.includes(tabId)) {
        twitterTabIds.push(tabId);
      }
      if (request.isBully) {
        bully.add(request.tweet);
      } else {
        noBully.add(request.tweet);
      }
      sendResponse({ success: true });
      break;
    case 'ReportTweet':
      console.log('addReportedTweet');
      chrome.storage.local.get(['user']).then(({ user }) => {
        return addReportedTweet(request.tweetId, user.uid, request.tweetText, request.correctLabel, request.tweetUsername);
      })
        .then((res) => {
          console.log("addReportedTweet", res);
          if (res)
            reportedCount++;
          sendResponse({ success: true });
        })
        .catch((err) => {
          console.log(err);
          sendResponse({ success: false });
        });
      sendResponse(true);
      break;
    default:
      break;
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log('tabId', tabId);
  console.log(twitterTabIds);

  if (twitterTabIds.includes(tabId)) {
    console.log('twitter tab is closed');
    twitterTabIds = twitterTabIds.filter(id => id !== tabId);
    console.log(twitterTabIds);

    let bullyCount = bully.size;
    let noBullyCount = noBully.size;
    let totalScannedTweets = bullyCount + noBullyCount;

    let { user } = await chrome.storage.local.get(['user']);
    let currUserId = user.uid;
    console.log(currUserId);

    let date = new Date();
    let dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    console.log('bullyCount', bullyCount);
    console.log('noBullyCount', noBullyCount);

    if (bullyCount > 0 || noBullyCount > 0) {
      bully.clear();
      noBully.clear();

      console.log('updating stats...');
      //
      await updateUserStats(currUserId, totalScannedTweets, bullyCount, reportedCount, 0);
      await updateDailyScannedTweets(dateString, bullyCount, noBullyCount);
      await updateGeneralStats(bullyCount, noBullyCount, reportedCount, 0);
      await updateDailyReports(dateString, reportedCount);
      console.log('updated stats');
      reportedCount = 0;
    }
  }

});

console.log('background script here...')
