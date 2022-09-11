import { firebase } from '../../../firebase.js';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

import date from 'date-and-time';
const db = getFirestore(firebase);

const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];

const now = new Date();

export const updateProfile = async (req, res) => {
    const { user, profilePhoto, displayName, fullName, email, contactNo, birthday, gender } = req.body;
    const parsedImg = JSON.parse(profilePhoto);

    if (parsedImg != null && imageMimeTypes.includes(parsedImg.type)) {
        const convertedImg = parsedImg.data;
        const imgType = parsedImg.type;

        try {
            await setDoc(doc(db, 'Accounts', `customer_${user}`), {
                displayName: displayName,
                email: email,
                imgType: imgType,
                profileUpdatedAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                userPhoto: convertedImg
            }, { merge: true });

            await setDoc(doc(db, 'Customers', user), {
                birthday: birthday,
                contactNo: contactNo,
                displayName: displayName,
                email: email,
                fullName: fullName,
                gender: gender,
            }, { merge: true });

            const customerArray = [];
            const accountArray = [];

            const accountRef = doc(db, 'Accounts', `customer_${user}`);
            const accountData = await getDoc(accountRef);

            const account = new Account(
                accountData.data().id,
                accountData.data().accRole,
                accountData.data().accStatus,
                accountData.data().createdAt,
                accountData.data().displayName,
                accountData.data().email,
                accountData.data().imgType,
                accountData.data().isVerified,
                accountData.data().profileUpdatedAt,
                accountData.data().signedInAt,
                accountData.data().userPhoto
            );
            accountArray.push(account);

            const customerRef = doc(db, 'Customers', user);
            const customerData = await getDoc(customerRef);

            const customer = new Customer(
                customerData.id,
                customerData.data().birthday,
                customerData.data().contactNo,
                customerData.data().displayName,
                customerData.data().email,
                customerData.data().fullName,
                customerData.data().gender,
                customerData.data().isAnonymous
            );
            customerArray.push(customer);

            console.log(`---Profile successfully updated!---\ncustomerID: ${user}`)

            res.render('customer/settings', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: accountArray,
                displayCustomerInfo: customerArray,
                messageCode: '',
                infoMessage: '',
            })

        } catch (error) {
            console.error('@AccountUpdate:', error);
        }
    };
};