import * as config from './config.js';

import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';

const firebase = initializeApp(config.firebaseConfig);

// const firebaseServiceAccountCreds = config.FIREBASE_SERVICE_ACCOUNT_KEY;
// console.log(typeof firebaseServiceAccountCreds)
// if (!firebaseServiceAccountCreds) throw new Error('The $FIREBASE_SERVICE_ACCOUNT_CREDS environment variable was not found!');
// const firebaseAdmin = admin.initializeApp({
//     credential: admin.credential.cert(JSON.parse(Buffer.from(firebaseServiceAccountCreds, 'base64').toString('ascii')))
// });

const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_KEY);
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'http://citysalescloud.firebaseio.com'
});

export { 
    firebase,
    firebaseAdmin
}