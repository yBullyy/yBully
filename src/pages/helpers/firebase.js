import { setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../background';

// =======================================================================
// User Specific Functions
// =======================================================================

export const saveUserToFirestore = async (user) => {
  const userData = {
    uid: user.uid,
    email: user.email,
    name: user.username,
    timestamp: new Date(),
    role: "user",
    totalScannedTweets: 0,
    totalBullyTweets: 0,
    totalReportedTweets: 0,
    totalApprovedTweets: 0,
    trustScore: 0,
  }
  console.log(userData);
  try {
    await setDoc(doc(db, 'users', user.uid), userData);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


export const updateUserStats = async (
  userId,
  totalScannedTweets = 0,
  totalBullyTweets = 0,
  totalReportedTweets = 0,
  totalApprovedTweets = 0,
  trustScore = 0) => {
  try {
    const user = await getDoc(doc(db, 'users', userId));
    const previousTotalScannedTweets = user.data().totalScannedTweets;
    const previousTotalBullyTweets = user.data().totalBullyTweets;
    const previousTotalReportedTweets = user.data().totalReportedTweets;
    const previousTotalApprovedTweets = user.data().totalApprovedTweets;
    const previousTrustScore = user.data().trustScore;

    const newTotalScannedTweets = previousTotalScannedTweets + totalScannedTweets;
    const newTotalBullyTweets = previousTotalBullyTweets + totalBullyTweets;
    const newTotalReportedTweets = previousTotalReportedTweets + totalReportedTweets;
    const newTotalApprovedTweets = previousTotalApprovedTweets + totalApprovedTweets;
    const newTrustScore = previousTrustScore + trustScore;

    const userData = {
      totalScannedTweets: newTotalScannedTweets,
      totalBullyTweets: newTotalBullyTweets,
      totalReportedTweets: newTotalReportedTweets,
      totalApprovedTweets: newTotalApprovedTweets,
      trustScore: newTrustScore,
    }
    await updateDoc(doc(db, 'users', userId), userData);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// =======================================================================
// =======================================================================

export const updateDailyScannedTweets = async (date, bullyCount, noBullyCount) => {
  try {
    const docRef = doc(db, 'dailyScans', date);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const newBullyCount = data.bullyCount + bullyCount;
      const newNoBullyCount = data.noBullyCount + noBullyCount;
      await updateDoc(docRef, { bullyCount: newBullyCount, noBullyCount: newNoBullyCount });
    } else {
      await setDoc(docRef, { bullyCount, noBullyCount, date });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const updateDailyReports = async (date, reportCount) => {
  try {
    const docRef = doc(db, 'dailyReports', date);
    const docSnapshot = getDoc(docRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const newReportCount = data.reportCount + reportCount;
      await updateDoc(docRef, { reportCount: newReportCount });
    } else {
      await setDoc(docRef, { reportCount, date });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


export const addReportedTweet = async (tweetId, userId, text, correctLabel) => {
  console.log(tweetId, userId, text, correctLabel);
  const docRef = doc(db, 'reportedTweets', tweetId);
  // Check if doc exists and userId exists in reportedBy array
  const docSnapshot = await getDoc(docRef);
  if (docSnapshot.exists()) {
    // If doc exists, increment reportCount by 1 and add userId to reportedBy array
    const data = docSnapshot.data();
    // Check if userId already exists in reportedBy array if present then return
    if (data.reportedBy.includes(userId)) {
      return true;
    } else {
      const newReportCount = data.reportCount + 1;
      const newReportedBy = data.reportedBy.concat(userId);
      await updateDoc(docRef, { reportCount: newReportCount, reportedBy: newReportedBy });
    }

  } else {
    const tweetData = {
      tweetId,
      tweetText: text,
      correctLabel,
      reportCount: 1,
      reportedBy: [userId],
    }
    try {
      await setDoc(doc(db, 'reportedTweets', tweetId), tweetData);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

}

export const updateGeneralStats = async (bullyCount = 0, noBullyCount = 0, reportCount = 0, userCount = 0) => {
  try {
    const total_bully_predictions_ref = doc(db, 'stats', 'total_bully_predictions');
    const total_predictions_ref = doc(db, 'stats', 'total_predictions');
    const total_reports_ref = doc(db, 'stats', 'total_reports');
    const total_users_ref = doc(db, 'stats', 'total_users');

    const total_bully_predictions = await getDoc(total_bully_predictions_ref);
    const total_predictions = await getDoc(total_predictions_ref);
    const total_reports = await getDoc(total_reports_ref);
    const total_users = await getDoc(total_users_ref);

    const newTotalBullyPredictions = total_bully_predictions.data()['count'] + bullyCount;
    const newTotalPredictions = total_predictions.data()['count'] + bullyCount + noBullyCount;
    const newTotalReports = total_reports.data()['count'] + reportCount;
    const newTotalUsers = total_users.data()['count'] + userCount;

    await updateDoc(total_bully_predictions_ref, { count: newTotalBullyPredictions });
    await updateDoc(total_predictions_ref, { count: newTotalPredictions });
    await updateDoc(total_reports_ref, { count: newTotalReports });
    await updateDoc(total_users_ref, { count: newTotalUsers });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// daily scans
// stats
// users
