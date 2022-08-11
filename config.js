import dotenv from 'dotenv';
dotenv.config();

const{
    API_KEY,
    AUTH_DOMAIN,
    DATABASE_URL,
    PROJECT_ID,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    APP_ID,
    FIREBASE_SERVICE_ACCOUNT_KEY,
    SERVER_URL,
    STRIPE_PRIVATE_KEY,
    STRIPE_PUBLIC_KEY,
} = process.env;

const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID
}
export { 
    firebaseConfig,
    FIREBASE_SERVICE_ACCOUNT_KEY,
    DATABASE_URL,
    SERVER_URL,
    STRIPE_PRIVATE_KEY,
    STRIPE_PUBLIC_KEY
};
