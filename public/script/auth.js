import { firebase } from './firebaseConfig.js';
import { getAuth, setPersistence, inMemoryPersistence, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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

    const postIdTokenToSessionLogin = (url, idToken) => {
        return $.ajax({
            type: "POST",
            url: url,
            data: {
                idToken: idToken
            },
            success: function (data) {
                console.log('Success');
            }
        });
    };
    $("#signinForm").submit(e => {
        e.preventDefault();
        let email = $("#email").val();
        let password = $("#password").val();

        const auth = getAuth(firebase);
       
        setPersistence(auth, inMemoryPersistence);
        signInWithEmailAndPassword(auth, email, password).then((user) => {
            user.user.getIdToken().then(idToken => {
                window.location.assign('auth/sessionLogin?token='+idToken);
            });
        }).then(() => {
            return signOut(auth).then(() => {
            }).catch(error => {
                console.log(error.message);
            })
        });

    });


});


