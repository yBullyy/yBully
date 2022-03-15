import { collection, setDoc, doc } from 'firebase/firestore';
import db from '../../background';

export const saveUserToFirestore = async (user) => {
    const userData = {
        uid: user.uid,
        email: user.email,
        name: user.username,
        timestamp: new Date(),
        role: "user"
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
