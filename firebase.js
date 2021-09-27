import * as config from './config.js';

import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';

const firebase = initializeApp(config.firebaseConfig);

const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY);
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'http://citysalescloud.firebaseio.com'
});

export { 
    firebase,
    firebaseAdmin
}