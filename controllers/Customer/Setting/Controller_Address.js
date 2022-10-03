import { firebase, firebaseAdmin } from '../../../firebase.js';
import { getFirestore, doc, setDoc, updateDoc, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const adminAuth = firebaseAdmin.auth();
const db = getFirestore(firebase);

const getAddress = async (req, res) => {
    const { uid, id } = req.params;
    const addressArray = [];

    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressDocRef = doc(db, `Customers/${uid}/AddressBook/${id}`);
        const addressDocument = await getDoc(addressDocRef);
        addressArray.push({
            id: addressDocument.id,
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

const updateAddress = async (req, res) => {
    const { uid, addressData } = req.body;
    let resStatus;

    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressDocRef = doc(db, `Customers/${uid}/AddressBook/${addressData.id}`);
        await updateDoc(addressDocRef, {
            name: addressData.name,
            phone: addressData.phone,
            barangay: addressData.barangay,
            city: addressData.city,
            street: addressData.street,
            province: addressData.province,
            postal: addressData.postal,
            type: addressData.type
        })

        resStatus = 200;
    } catch (error) {
        console.error(`Firestore Error -> @addNewAddress: ${error.message}`);
        resStatus = 500;
    }

    res.sendStatus(resStatus);
}

const deleteAddress = async (req, res) => {
    const { uid, id } = req.params;
    let resStatus;
    
    try {
        //* CUSTOMERS COLLECTION -> SUB-COLLECTION: AddressBook
        const addressDocRef = doc(db, `Customers/${uid}/AddressBook/${id}`);
        await deleteDoc(addressDocRef);
        
        resStatus = 200;
    } catch (error) {
        console.error(`Firestore Error -> @deleteAddress: ${error.message}`);
        resStatus = 500;
    }

    res.sendStatus(resStatus);
}

export {
    addNewAddress,
    getAddress,
    updateAddress,
    deleteAddress
}