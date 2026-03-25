const express = require('express');
const hostRouter = express.Router();

hostRouter.get('/host/add-home', (req, res, next) => {
    res.render('addHome');  // ✅ was sendFile
});

const registerHome = [];

hostRouter.post('/host/add-home', (req, res, next) => {
    console.log("Home registered successfully : ", req.body, req.body.houseName);
    registerHome.push({ houseName: req.body.houseName });
    res.redirect('/');  // ✅ was res.render — redirect back to listings
});

module.exports = hostRouter;
module.exports.registerHome = registerHome;