import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTXtqunUY2z-y7xJJv5X-17-BOYem1M1Y",
    authDomain: "citysalescloud.firebaseapp.com",
    projectId: "citysalescloud",
    storageBucket: "citysalescloud.appspot.com",
    messagingSenderId: "337915595205",
    appId: "1:337915595205:web:d97839fd650723a73623ac"
};

export const firebase = initializeApp(firebaseConfig);