import { firebase } from './firebaseConfig.js';
import { getAuth, setPersistence, inMemoryPersistence, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

$(document).ready(() => {

    const sign_in_btn = document.querySelector('#sign-in-btn');
    const sign_up_btn = document.querySelector('#sign-up-btn');
    const auth_cont = document.querySelector('.auth-cont');

    sign_up_btn.addEventListener('click', () => {
        auth_cont.classList.add("sign-up-mode");
    });

    sign_in_btn.addEventListener('click', () => {
        auth_cont.classList.remove("sign-up-mode");
    });

    const auth = getAuth(firebase);
    setPersistence(auth, inMemoryPersistence);

    onAuthStateChanged(auth, (loggedUser) =>  {

        if (loggedUser) {
            if (loggedUser.emailVerified) {
                console.log('Customer is already verified');
            } else {
                sendEmailVerification(loggedUser).then(() => {
                    Alert('Email verification sent');
                });
            }
            console.log(loggedUser);
        } else {
            console.log('No user');
        }
    });


    $("#signinForm").submit(e => {
        e.preventDefault();
        let email = $("#email").val();
        let password = $("#password").val();

        signInWithEmailAndPassword(auth, email, password).then((user) => {
            user.user.getIdToken().then(idToken => {
                window.location.assign('auth/sessionLogin?token='+idToken);
            });
        }).then(() => {
            return signOut(auth).then(() => {
            }).catch(error => {
                console.log(error.message);
            })
        }).catch(error => {
            alert(errorHandler(error.code))
            $("#email").val('');
            $("#password").val('');
        });
    });


    $("#signInWithGoogle").click(() => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider).then((user) => {
            const credential = GoogleAuthProvider.credentialFromResult(user);
            const token = credential.accessToken;

            user.user.getIdToken().then(idToken => {
                window.location.assign('auth/sessionLogin?token='+idToken);
            });
        }).catch(error => {
            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(errorHandler(credential || error.code))
        })
    })


    $("#signInWithFacebook").click(() => {
        const provider = new FacebookAuthProvider();

        signInWithPopup(auth, provider).then((user) => {
            const credential = FacebookAuthProvider.credentialFromResult(user);
            const token = credential.accessToken;

            user.user.getIdToken().then(idToken => {
                window.location.assign('auth/sessionLogin?token='+idToken);
            });
        }).catch(error => {
            const credential = FacebookAuthProvider.credentialFromError(error);
            alert(errorHandler(credential || error.code))
        })
    })

    const errorHandler = (code) => {
        let errMessage = '';

        if (code === 'auth/invalid-email') {
            errMessage = `You've entered an invalid email address!`;
        } else if (code === 'auth/wrong-password') {
            errMessage = `You've entered an invalid password!`;
        } else if (code === 'auth/user-not-found') {
            errMessage = `There are no users matching that email!`;
        } else {
            errMessage = code;
        }

        return errMessage
    }
});