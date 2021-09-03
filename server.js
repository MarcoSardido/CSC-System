'use strict';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const landingPage = require('./routes/landingPage');
const loginPage = require('./routes/login');
const sellerPage = require('./routes/seller');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', landingPage.routes);
app.use('/login', loginPage.routes);
app.use('/sellercenter', sellerPage.routes);


app.listen(process.env.PORT || 3000, () => console.log('Server up and running...'));