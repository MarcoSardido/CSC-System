import { firebase } from '../../../firebase.js';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
const db = getFirestore(firebase);

import date from 'date-and-time';

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];
const now = new Date();

const updateProfileData = async (req, res) => {
    const { uid, userName, fullName, contactNum, gender, birthday } = req.body;

    try {
        await setDoc(doc(db, 'Accounts', `customer_${uid}`), {
            displayName: userName,
            profileUpdatedAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
        }, { merge: true });

        await setDoc(doc(db, 'Customers', uid), {
            birthday: birthday,
            contactNo: contactNum,
            displayName: userName,
            fullName: fullName,
            gender: gender,
        }, { merge: true });

        res.redirect('/customercenter/settings');
    } catch (error) {
        console.error(`Firestore Error -> @updateProfileData: ${error.message}`)
    }
};

const updateProfilePhoto = async (req, res) => {
    const { uid, updatePhoto } = req.body;

    try {
        const parsedImg = JSON.parse(updatePhoto);
        const convertedImg = parsedImg.data;
        const imgType = parsedImg.type;

        await setDoc(doc(db, 'Accounts', `customer_${uid}`), {
            imgType: imgType,
            profileUpdatedAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
            userPhoto: convertedImg
        }, { merge: true });

        res.redirect('/customercenter/settings');
    } catch (error) {
        console.error(`Firestore Error -> @updateProfileData: ${error.message}`)
    }
}

export {
    updateProfileData,
    updateProfilePhoto
}