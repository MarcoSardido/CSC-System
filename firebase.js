import * as config from './config.js';

import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';

const firebase = initializeApp(config.firebaseConfig);
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(config.SERVICE_ACCOUNT_KEY),
    databaseURL: 'http://citysalescloud.firebaseio.com'
});

export { 
    firebase,
    firebaseAdmin
}