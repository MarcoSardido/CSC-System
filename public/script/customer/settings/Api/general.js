import { firebase } from '../../../firebaseConfig.js';
import { getAuth, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

const auth = getAuth(firebase);

const demo = () => {
    console.log(user);
}

export {
    demo
}