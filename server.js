import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import cookieParser from "cookie-parser";
import csrf from "csurf";
import path from 'path';
import cors from 'cors';

import landingPage from './routes/Router_LandingPage.js';
import pageNotFound from './routes/Router_404.js';
import * as sellerPage from './routes/Router_Seller.js';
import * as customerPage from './routes/Router_Customer.js';

const app = express();
const __dirname = path.resolve();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout'); //default layout

app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.SERVER_URL,
}))

// app.use(csrf({ cookie: true }));

// app.use("/", (req, res, next) => {
//     res.cookie("XSRF-TOKEN", req.csrfToken());
//     next();
// });

app.use('/', landingPage); //FrontPage
app.use('/sellercenter', sellerPage.routes); //Access Seller Resource
app.use('/customercenter', customerPage.routes); //Access Customer Resource
app.use((pageNotFound)); //404 Page

app.listen(process.env.PORT || 3000, () => console.log('Server up and running...'));