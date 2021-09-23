'use strict';

import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import cookieParser from "cookie-parser";
// import csrf from "csurf";
import path from 'path';

import * as landingPage from './routes/Router_LandingPage.js';
import * as authPage from './routes/Router_Auth.js';
import * as sellerPage from './routes/Router_Seller.js';
import * as customerPage from './routes/Router_Customer.js';

const app = express();
const __dirname = path.resolve();
// const csrfMiddleware = csrf({ cookie: true });

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(csrfMiddleware);

// app.all("*", (req, res, next) => {
//     res.cookie("XSRF-TOKEN", req.csrfToken());
//     next();
// });

app.use('/', landingPage.routes);
app.use('/auth', authPage.routes);
app.use('/sellercenter', sellerPage.routes);
app.use('/customercenter', customerPage.routes);

app.listen(process.env.PORT || 3000, () => console.log('Server up and running...'));





// const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
// const methodOverride = require('method-override');

// const cookieParser = require("cookie-parser");
// const csrf = require("csurf");

// const csrfMiddleware = csrf({ cookie: true });

// const landingPage = require('./routes/Router_LandingPage');
// const loginPage = require('./routes/Router_Login');
// const sellerPage = require('./routes/Router_Seller');
// const customerPage = require('./routes/Router_Customer');
