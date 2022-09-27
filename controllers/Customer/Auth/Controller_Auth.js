import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getAuth, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

import date from 'date-and-time';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

//* Method: GET -> Login / Registration Page
const signInAndSignUpRoute = (req, res) => {
    const sessionCookie = req.cookies.session;


    // Check if session cookie is available.
    if (!sessionCookie) {
        //no sessionCookie available, user rendered to login page.
        res.render('authentication/auth', {
            title: 'City Sales Cloud',
            layout: 'layouts/customer_authLayout',
            messageCode: '',
            infoMessage: ''
        });

    } else {
        //sessionCookie available, user rendered to customer center page
        //to logout.
        res.render('customer/dashboard', {
            title: 'Customer Center',
            layout: 'layouts/customerLayout',
            displayAccountInfo: [],
            displayCustomerInfo: [],
            messageCode: 'alert-info',
            infoMessage: 'Please logout first'
        });
    }

};

//* Method: GET -> Logout
const logout = async (req, res) => {
    const uid = req.body.uid;
    const user = req.body.user;

    const currentDate = new Date();
    try {
        //* ACCOUNTS COLLECTION
        const accountColRef = doc(db, `Accounts/customer_${uid}`);
        await setDoc(accountColRef, {
            signedOutAt: date.format(currentDate, 'MMM DD, YYYY hh:mm A [GMT]Z')
        }, { merge: true })

        res.clearCookie('session');
        res.redirect('/customercenter/auth')

        console.log('Successfully Logged out');
    } catch (error) {
        console.error(`Authentication -> @logout: ${error.message}`);
    }
};

//* Method: POST -> Register Seller
const signUp = (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password === confirmPassword) {
        adminAuth.createUser({

            email: email,
            password: password

        }).then(userRecord => {
            console.log('Successfully created new user:', userRecord.uid);

            // res.redirect('/customercenter')

            res.render('authentication/auth', {
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout',
                messageCode: 'alert-info',
                infoMessage: 'Login with same credentials'
            });

        }).catch((error) => {
            console.error(error);
            const errorMessage = error.message;

            res.render('authentication/auth', { //views/authentication/auth.ejs
                title: 'City Sales Cloud',
                layout: 'layouts/customer_authLayout', //custom layout
                messageCode: 'alert-danger',
                infoMessage: errorMessage
            });
        });

    } else {
        res.render('authentication/auth', {
            title: 'City Sales Cloud',
            layout: 'layouts/customer_authLayout',
            messageCode: 'alert-warning',
            infoMessage: "Password doesn't match"
        });
    }
}

//* Function -> Add Session Cookie When Logging In 
const sessionLogin = (req, res) => {
    // get the idToken passed from client side.
    const idToken = req.query.token.toString();

    // session expires in 5hrs.
    const expiresIn = 60 * 60 * 5 * 1000;

    // create a new session if idToken is valid.
    adminAuth.createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);

        res.redirect('/customercenter')
    }).catch((error) => {
        // throw a error if idToken is not valid.
        console.error(error);
        res.status(404).send('UNAUTHORIZED REQUEST!');
    });
};

//* Function -> Check Access Control
async function userAccessControl(uid) {
    let existingAccRole;
    const allTrimmedAccountsArray = [], allOriginAccountsArray = [], accObj = {};

    try {
        //* ACCOUNTS COLLECTIONS 
        const accountColRef = collection(db, `Accounts`);
        const accountCollection = await getDocs(accountColRef);
        accountCollection.forEach(doc => {
            const colID = doc.id.split('_')[1];
            allTrimmedAccountsArray.push(colID); //I.E 123456
            allOriginAccountsArray.push(doc.id); //I.E customer_123456
        })

        //? If user found, check account role. Otherwise create account data;
        if (allTrimmedAccountsArray.includes(uid)) {
            for (const accountIndex of allOriginAccountsArray) {
                if (accountIndex.split('_')[1] === uid) {
                    accObj.existingAccID = accountIndex;
                    break;
                }
            }
        }

        if (Object.keys(accObj).length > 0) {
            const accountColRef = doc(db, `Accounts/${accObj.existingAccID}`);
            const accountColDoc = await getDoc(accountColRef)
            existingAccRole = accountColDoc.data().accRole;
        }

        return existingAccRole === undefined ? 'New' : existingAccRole;
    } catch (error) {
        console.error(`Firebase Auth: @userAccessControl -> ${error.message}`)
    }
}

//* Function -> Verify Session Cookie
function verifyCookie(req, res, next) {
    const sessionCookie = req.cookies.session;

    try {
        adminAuth.verifySessionCookie(sessionCookie, true)
            .then((decodedClaims) => {
                req.body.uid = decodedClaims.uid;
                req.body.user = decodedClaims.firebase;

                userAccessControl(decodedClaims.uid).then(resultData => {
                    if (resultData === 'New') {
                        console.log(`Customer Created Successfully: ${decodedClaims.uid}`);
                        res.locals.uid = decodedClaims.uid;
                        return next();
                    } else {
                        if (resultData === 'Customer') {
                            console.log(`Customer ID: ${decodedClaims.uid} Successfully Verified.`);
                            res.locals.uid = decodedClaims.uid;
                            return next();
                        } else {
                            console.info('Account used to login is for Seller only')
                            res.clearCookie('session');
                            res.redirect('/customercenter/auth');
                        }
                    }

                })

            }).catch((error) => {
                console.error(error);
            });

    } catch (error) {
        res.redirect('/customercenter/auth');
    }
};

export {
    signInAndSignUpRoute,
    logout,
    signUp,
    sessionLogin,
    verifyCookie
};