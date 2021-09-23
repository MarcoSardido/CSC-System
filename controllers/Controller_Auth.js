'use strict';

import { firebase, firebaseAdmin } from '../firebase.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signOut} from  'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, getDocs, Timestamp } from 'firebase/firestore';

const adminAuth = firebaseAdmin.auth();
const auth = getAuth(firebase);
const db = getFirestore(firebase);

// Route for the Sign in and Sign up
const signInAndSignUpRoute = (req, res) => {
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {

        res.render('authentication/auth', {
            layout: 'layouts/authLayout',
            messageCode: '',
            infoMessage: ''
        });

    } else {

        res.render('customer/dashboard', { 
            title: 'Customer Center',
            layout: 'layouts/customerLayout',
            messageCode: 'alert-info',
            infoMessage: 'Please logout first'
        });

    }
    
};

/**
 * Sign In
 */

    // const signIn = (req, res) => {
        
    //     const { email, password } = req.body;

    //     signInWithEmailAndPassword(auth, email, password).then((result) => {

    //         console.log('userInfo', result);
    //         res.redirect('customer/dashboard');

    //     }).catch((error) => {
    //         const errorMess = error.message;
    //         console.error(errorMess);

    //         res.redirect('/auth');

    //     });
    // };

    const sessionLogin = (req, res) => {
        const idToken = req.query.token.toString();

        const expiresIn = 60 * 60 * 5 * 1000;

        adminAuth.createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
           const options = { maxAge: expiresIn, httpOnly: true, secure: true };
            res.cookie('session', sessionCookie, options);

            res.redirect('/customercenter')

        }).catch((error) => {
            console.error(error);
            res.status(404).send('UNAUTHORIZED REQUEST!');
        });
    };

/**
 * End of Sign In
 */




/**
 * Sign Up
 */

    const signUp = (req, res) => {
        const { email, password, confirmPassword } = req.body;

        if (password === confirmPassword) {
            adminAuth.createUser({

                email: email,
                password: password

            }).then(userRecord => {
                console.log('Successfully created new user:', userRecord.uid);
                
                res.render('authentication/auth', {
                    layout: 'layouts/authLayout',
                    messageCode: 'alert-info',
                    infoMessage: 'Login with same credentials'
                });

            }).catch((error) => {
                console.error(error);
                const errorMessage = error.message;

                res.render('authentication/auth', {
                    layout: 'layouts/authLayout',
                    messageCode: 'alert-danger',
                    infoMessage: errorMessage
                });

            });

        } else {
            res.render('authentication/auth', {
                layout: 'layouts/authLayout',
                messageCode: 'alert-warning',
                infoMessage: "Password doesn't match"
            });
        }
    }

/**
 * End of Sign Up


/**
 * Password reset
 */

    const passwordResetRoute = (req, res) => {
        res.render('auth/reset', {
            errorMessage: ''
        });
    };

    const passwordReset = (req, res) => {
        const email = req.body.email;

        sendPasswordResetEmail(auth, email).then(() => {
            res.render('auth/reset', {
                message: 'Password Reset Email Sent!'
            });
        }).catch((error) => {
            const errorMess = error.message;
            console.error(errorMess);
        })
    };

/**
 * End of Password reset
 */


/**
 * Logout
 */

    const logout = (req, res) => {
       
        res.clearCookie('session');
        res.redirect('/auth')
        console.log('Successfully Logged out');
        
    };

/**
 * End of Logout
 */



//  function isLoggedIn() {
//     onAuthStateChanged(auth, (user) => {

//         if(user) {
//             console.log('There is a user');
//         } else {
//             console.log('There is no user');
//         }
//     });
// }

function verifyCookie(req, res, next) {
    try {
        const sessionCookie = req.cookies.session;

        adminAuth.verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
            
            req.body.uid = decodedClaims.uid;
            return next();
            
        }).catch((error) => {
            
            console.error(error);
        });

    } catch (error) {
        return res.status(401).render('authentication/auth', {
            layout: 'layouts/authLayout',
            messageCode: 'alert-danger',
            infoMessage: 'Token expired or tampered'
        });
    }
};



export { 
    signInAndSignUpRoute,
    signUp,
    sessionLogin,
    verifyCookie,
    logout
};