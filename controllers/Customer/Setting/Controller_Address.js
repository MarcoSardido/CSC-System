import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

const getAddress = async (req, res) => {
    const { uid, id } = req.body;
    const addressArray = [];

    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressDocRef = doc(db, `Customers/${uid}/AddressBook/${id}`);
        const addressDocument = await getDoc(addressDocRef);
        addressArray.push({
            name: addressDocument.data().name,
            phone: addressDocument.data().phone,
            barangay: addressDocument.data().barangay,
            city: addressDocument.data().city,
            street: addressDocument.data().street,
            province: addressDocument.data().province,
            postal: addressDocument.data().postal,
            type: addressDocument.data().type
        })

        return res.json(addressArray);
    } catch (error) {
        console.error(`Firestore Error -> @getAllAddress: ${error.message}`);
    }
}

const addNewAddress = async (req, res) => {
    const { uid, addressData } = req.body;
    let totalAddress = 0, resStatus;

    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressSubColRef = collection(db, `Customers/${uid}/AddressBook`);
        const addressSubCollection = await getDocs(addressSubColRef);
        totalAddress = addressSubCollection.size;

        await setDoc(doc(db, `Customers/${uid}/AddressBook/address${totalAddress + 1}`), {
            name: addressData.name,
            phone: addressData.phone,
            barangay: addressData.barangay,
            city: addressData.city,
            street: addressData.street,
            province: addressData.province,
            postal: addressData.postal,
            type: addressData.type
        });

        resStatus = 200;
    } catch (error) {
        console.error(`Firestore Error -> @addNewAddress: ${error.message}`);
        resStatus = 500;
    }

    res.sendStatus(resStatus);
}

export {
    addNewAddress,
    getAddress
}