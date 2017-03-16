var express = require('express');
var router = express.Router();


/* GET mockups. */

router.get('/', function(req, res, next){
    res.render('mockup-home');
});

router.get('/student', function(req, res, next){
    res.render('mockup-student');
});

router.get('/admin', function(req, res, next){
    res.render('mockup-admin');
});

router.get('/stats', function(req, res, next){
    res.render('mockup-stats');
});

module.exports = router;
