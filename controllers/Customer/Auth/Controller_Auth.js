import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getAuth, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

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
const logout = (req, res) => {
    res.clearCookie('session');
    res.redirect('/customercenter/auth')
    console.log('Successfully Logged out');
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
    const sessionCookie = req.cookies.session;

    try {
        adminAuth.verifySessionCookie(sessionCookie, true)
            .then((decodedClaims) => {
                req.body.uid = decodedClaims.uid;
                req.body.user = decodedClaims.firebase;

                userAccessControl(decodedClaims.uid).then(accType => {
                    if (accType === 'Customer') {
                        console.log(`Customer Successfully SignedIn: ${decodedClaims.uid}`);
                        res.locals.uid = decodedClaims.uid;
                        return next();
                    } else {
                        console.info('Account used to login is for Seller only')
                        res.clearCookie('session');
                        res.redirect('/customercenter/auth');
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