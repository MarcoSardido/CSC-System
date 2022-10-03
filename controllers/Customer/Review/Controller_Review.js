import userData from '../_PartialFunctions/userData.js';

import { firebase } from '../../../firebase.js';
import { getFirestore, doc, setDoc, query, where, getDoc, collection, getDocs } from 'firebase/firestore';
const db = getFirestore(firebase);

//? Hexadecimal colors to Named colors
import ntc from '@yatiac/name-that-color';

const review = async (req, res) => {
    const uid = req.body.uid;

    const deliveredOrderIDs = [], toBeCreatedReview = [], checkReviewIDs = [];

    try {
        //* CUSTOMERS -> SUB-COLLECTION: Reviews
        const reviewsSubColRef = collection(db, `Customers/${uid}/Reviews`);
        const reviewsSubCollection = await getDocs(reviewsSubColRef);
        reviewsSubCollection.forEach(doc => {
            checkReviewIDs.push(doc.data().orderID)
        })

        //* CUSTOMERS -> SUB-COLLECTION: Orders
        const ordersSubColRef = collection(db, `Customers/${uid}/Orders`);
        const ordersQuery = query(ordersSubColRef, where('deliveredOn', '!=', ''))
        const ordersSubCollection = await getDocs(ordersQuery);
        ordersSubCollection.forEach(doc => {
            deliveredOrderIDs.push(doc.id);
            toBeCreatedReview.push({
                id: generateId(),
                deliveredOn: doc.data().deliveredOn,
                orderID: doc.id,
                seller: {
                    uid: doc.data().seller.uid,
                    storeName: doc.data().seller.storeName,
                    product: 'add this'
                },
                rate: 0,
                feedBack: '',
                added: true
            })

        })

        if (deliveredOrderIDs.length > 0) {
            for (const [orderIdIndex, orderValue] of deliveredOrderIDs.entries()) {
                let productsContainer = [];

                //* CUSTOMERS -> SUB-COLLECTION: Orders
                const ordersDocRef = doc(db, `Customers/${uid}/Orders/${orderValue}`);
                const orderDocument = await getDoc(ordersDocRef);
                const orderItems = orderDocument.data().items;

                for (const itemIndex of orderItems) {
                    productsContainer.push(itemIndex.productID);
                }

                toBeCreatedReview[orderIdIndex].seller.product = productsContainer;
            }

            for (const createIndex of toBeCreatedReview) {
                if (!checkReviewIDs.includes(createIndex.orderID)) {
                    const reviewDocRef = doc(db, `Customers/${uid}/Reviews/reviewID_${createIndex.id}`);
                    await setDoc(reviewDocRef, createIndex)
                }
            }
        }

        userData(uid).then(result => {
            res.render('customer/review', {
                layout: 'layouts/customerLayout',
                displayAccountInfo: result.accountArray,
                displayCustomerInfo: result.customerArray,
                messageCode: '',
                infoMessage: '',
                onLive: false,
            });
        })

    } catch (error) {
        console.error(`Review Controller Error -> @reviewPage: ${error.message}`)
    }
}


const getAllReview = async (req, res) => {
    const { uid } = req.params;

    const reviewArray = [];

    try {
        //* CUSTOMERS -> SUB-COLLECTION: Reviews
        const reviewSubColRef = collection(db, `Customers/${uid}/Reviews`);
        const reviewSubCollection = await getDocs(reviewSubColRef);
        reviewSubCollection.forEach(doc => {
            reviewArray.push({
                reviewID: doc.id,
                orderID: doc.data().orderID,
                feedBack: doc.data().feedBack,
                rate: doc.data().rate,
                storeName: doc.data().seller.storeName,
                deliveredOn: convertStringDateToNumDate(doc.data().deliveredOn),
            })
        })

        for (const reviewIndex of reviewArray) {
            let partialArr = [];

            //* CUSTOMERS -> SUB-COLLECTION: Orders
            const orderDocRef = doc(db, `Customers/${uid}/Orders/${reviewIndex.orderID}`);
            const orderDocument = await getDoc(orderDocRef);

            const orderItems = orderDocument.data().items;
            for (const itemIndex of orderItems) {
                let getComponent = itemIndex.color.substring(4, itemIndex.color.length - 1).replace(/ /g, '').split(',');
                let hexValue = rgbToHex(getComponent[0], getComponent[1], getComponent[2]);
                let colorName = ntc(`#${hexValue}`).colorName;

                partialArr.push({
                    image: itemIndex.image,
                    name: itemIndex.name,
                    description: itemIndex.description,
                    color: colorName,
                    size: itemIndex.size,
                    quantity: itemIndex.quantity,
                    subTotal: itemIndex.subTotal
                })
            }

            reviewIndex.products = partialArr;
        }

        return res.json(reviewArray);
    } catch (error) {
        console.error(`Review Controller Error -> @getAllReview: ${error.message}`)
    }
}


const addReview = async (req, res) => {
    const { uid, reviewData } = req.body;
    let resStatus;

    try {
        //* CUSTOMERS -> SUB-COLLECTION: Reviews.
        const reviewDocRef = doc(db, `Customers/${uid}/Reviews/${reviewData.reviewID}`);
        await setDoc(reviewDocRef, {
            feedBack: reviewData.feedBack,
            rate: reviewData.rate
        }, { merge: true })

        resStatus = 200;
    } catch (error) {
        console.error(`Firestore Error -> @addReview: ${error.message}`);
        resStatus = 500;
    }

    res.sendStatus(resStatus);
}

//? 3 Oct 2022 -> 10/03/2022 
const convertStringDateToNumDate = (strDate) => {
    let stringDate = strDate.split(" ");
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let j = 0; j < months.length; j++) {
        if (stringDate[1] == months[j]) {
            stringDate[1] = months.indexOf(months[j]) + 1;
        }
    }
    if (stringDate[1] < 10) {
        stringDate[1] = '0' + stringDate[1];
    }
    if (stringDate[0] < 10) {
        stringDate[0] = '0' + stringDate[0];
    }
    let result = `${stringDate[1]}/${stringDate[0]}/${stringDate[2]}`;
    return result;
}

const rgbToHex = (r, g, b) => {
    let rgb = b | (g << 8) | (r << 16);
    return (0x1000000 | rgb).toString(16).substring(1);
}

const generateId = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 15; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


export {
    review,
    getAllReview,
    addReview
}