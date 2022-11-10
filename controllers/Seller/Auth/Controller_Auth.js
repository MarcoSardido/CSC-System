import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getAuth, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

import date from 'date-and-time';
const now = new Date();

const currentLoggedInUID = [];

//? Image type should be included here
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG'];

//* Method: GET -> Login / Registration Page
const signInAndSignUpRoute = (req, res) => {
    res.render('authentication/seller', {
        title: 'City Sales Cloud',
        layout: 'layouts/seller_authLayout',
        messageCode: '',
        infoMessage: ''
    })
}

//* Method: GET -> Logout
const logout = async (req, res) => {
    const currentDate = new Date();

    try {
        //* COLLECTION: Accounts
        const accountDocRef = doc(db, `Accounts/seller_${currentLoggedInUID[0]}`);
        await setDoc(accountDocRef, {
            signedOutAt: currentDate
        }, { merge: true })

        //* COLLECTION: Stripe Accounts
        const stripeAccRef = doc(db, 'Stripe Accounts', `seller_${currentLoggedInUID[0]}`);
        const stripeAccData = await getDoc(stripeAccRef);

        if (stripeAccData.data().isNew) {
            await setDoc(doc(db, 'Stripe Accounts', `seller_${currentLoggedInUID[0]}`), {
                isNew: false
            }, { merge: true });
        }
        res.clearCookie('session');
        res.redirect('/sellercenter/auth')

        console.log(`Successfully Logged out Seller ${currentLoggedInUID[0]}`);

    } catch (error) {
        console.error(error);
    }
};

//* Method: POST -> Register Seller
const signUp = (req, res) => {

    const { sellerType, businessName, businessDesc, filePersonalID, fileCitizenID, personalFName, personalLName, personalContact, personalBDay, gender, state, city, mailingStreet, mailingZIP, createSellerEmail, createSellerPassword } = req.body;

    const parsedPersonalID = JSON.parse(filePersonalID);
    const parsedCitizenshipID = JSON.parse(fileCitizenID);

    if (parsedPersonalID != null && imageMimeTypes.includes(parsedPersonalID.type) && parsedCitizenshipID != null && imageMimeTypes.includes(parsedCitizenshipID.type)) {

        const convertedImgPersonalID = parsedPersonalID.data;
        const imgTypePersonalID = parsedPersonalID.type;

        const convertedCitizenshipID = parsedCitizenshipID.data;
        const imgTypeCitizenshipID = parsedCitizenshipID.type;

        try {
            adminAuth.createUser({
                email: createSellerEmail,
                password: createSellerPassword

            }).then(async (userRecord) => {

                await setDoc(doc(db, 'Accounts', `seller_${userRecord.uid}`), {
                    id: userRecord.uid,
                    accRole: "Seller",
                    sellerType: sellerType,
                    accStatus: "Active",
                    createdAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                    displayName: '',
                    email: userRecord.email,
                    imgType: '',
                    isVerified: userRecord.emailVerified,
                    profileUpdatedAt: '',
                    signedInAt: date.format(now, 'MMM DD, YYYY hh:mm A [GMT]Z'),
                    signedOutAt: '',
                    userPhoto: ''
                });

                await setDoc(doc(db, 'Sellers', userRecord.uid), {
                    birthday: personalBDay,
                    contactNo: personalContact,
                    displayName: '',
                    email: userRecord.email,
                    fullName: `${personalFName} ${personalLName}`,
                    gender: gender,
                    city: city,
                    state: state,
                    streetAddress: mailingStreet,
                    ZIP: mailingZIP
                });

                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Information', businessName), {
                    Name: businessName,
                    Description: businessDesc,
                    Type: 'OEM'
                });

                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Documents', 'Personal ID'), {
                    imgType: imgTypePersonalID,
                    docPhoto: convertedImgPersonalID
                });

                await setDoc(doc(db, 'Sellers', userRecord.uid, 'Business Documents', 'Citizenship ID'), {
                    imgType: imgTypeCitizenshipID,
                    docPhoto: convertedCitizenshipID
                });

                await setDoc(doc(db, 'Stripe Accounts', `seller_${userRecord.uid}`), {
                    customerID: '',
                    subscriptionID: '',
                    isNew: true
                });

                await setDoc(doc(db, 'Stripe Accounts', `seller_${userRecord.uid}`, 'Services', 'Subscription'), {
                    sellerType: '',
                    subscriptionCreated: '',
                    currentSubscriptionBill: '',
                    nextSubscriptionBill: ''
                });

                console.log(`Successfully created new seller: ${userRecord.uid}`);

                res.redirect('/sellercenter');

            }).catch(error => {
                console.error(`Error creating seller: ${error.message}`);
            });

        } catch (error) {
            console.log(error);
        };
    };

};

//* Function -> Add Session Cookie When Logging In 
const sessionLogin = async (req, res) => {
    const { uid, token } = req.query;

    const uniqueID = generateId();
    try {
        //* COLLECTION: Sellers
        const sellerDocRef = doc(db, `Sellers/${uid}`);
        const sellerDocument = await getDoc(sellerDocRef)

        //* COLLECTION: Accounts -> SUB-COLLECTION: Activity Logs
        const activityLogDocRef = doc(db, `Accounts/seller_${uid}/Activity Logs/log_${uniqueID}`);
        await setDoc(activityLogDocRef, {
            name: sellerDocument.data().displayName !== '' ? sellerDocument.data().displayName : sellerDocument.data().fullName,
            dateAdded: new Date(),
            type: 'Login'
        })

        // get the idToken passed from client side.
        const idToken = token.toString();

        // session expires in 5hrs.
        const expiresIn = 60 * 60 * 5 * 1000;

        // create a new session if idToken is valid.
        adminAuth.createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {
            const options = { maxAge: expiresIn, httpOnly: true, secure: true };
            res.cookie('session', sessionCookie, options);
            res.redirect('/sellercenter')

        }).catch((error) => {
            // throw a error if idToken is not valid.
            console.error(`Firebase Auth: Error creating session cookie: ${error.message}`);
            res.status(401).send('UNAUTHORIZED REQUEST!');
        });

    } catch (error) {
        console.error(`Fire Auth Error: @sessionLogin -> ${error.message}`);
    }
};

//* Function -> Check Access Control
async function userAccessControl(uid) {
    let currentAccount;
    try {

        const accountColRef = collection(db, `Accounts`)
        const accountCollection = await getDocs(accountColRef)
        accountCollection.forEach(doc => {
            const colID = doc.id.split('_')[1];
            if (uid === colID) {
                currentAccount = doc.id;
            }
        })

        const accountDataRef = doc(db, `Accounts/${currentAccount}`)
        const accountData = await getDoc(accountDataRef)

        return accountData.data().accRole
    } catch (error) {
        console.error(`Firebase Auth: @userAccessControl -> ${error.message}`)
    }
}

//* Function -> Verify Session Cookie
function verifyCookie(req, res, next) {
    try {
        const sessionCookie = req.cookies.session;

        adminAuth.verifySessionCookie(sessionCookie, true)
            .then((decodedClaims) => {
                currentLoggedInUID.push(decodedClaims.uid)
                req.body.uid = decodedClaims.uid;
                req.body.user = decodedClaims.firebase;

                userAccessControl(decodedClaims.uid).then(accType => {
                    if (accType === 'Seller') {
                        console.log(`Seller Successfully SignedIn: ${decodedClaims.uid}`);
                        res.locals.uid = decodedClaims.uid;
                        return next();
                    } else {
                        console.info('Account used to login is for Customer only')
                        res.clearCookie('session');
                        res.redirect('/sellercenter/auth');
                    }
                })
            }).catch((error) => {
                console.error(error);
            });

    } catch (error) {
        res.redirect('/sellercenter/auth');
    }
};

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export {
    signInAndSignUpRoute,
    logout,
    signUp,
    sessionLogin,
    verifyCookie
};