import { collection, setDoc, doc, updateDoc } from 'firebase/firestore';
import db from '../../background';

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
            const user = await doc(db, 'users', userId).get();
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
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            const newBullyCount = data.bullyCount + bullyCount;
            const newNoBullyCount = data.noBullyCount + noBullyCount;
            await setDoc(docRef, { bullyCount: newBullyCount, noBullyCount: newNoBullyCount });
        } else {
            await setDoc(docRef, { bullyCount, noBullyCount });
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
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            const newReportCount = data.reportCount + reportCount;
            await setDoc(docRef, { reportCount: newReportCount });
        } else {
            await setDoc(docRef, { reportCount });
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}


export const addReportedTweet = async (tweetId, userId, text, correctLabel) => {
    const userDocRef = doc(db, 'users', userId);
    const tweetData = {
        tweetId,
        text,
        correctLabel,
        timestamp: new Date(),
        reportedBy: userDocRef,
    }
    try {
        await setDoc(doc(db, 'reportedTweets', tweetId), tweetData);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }

}