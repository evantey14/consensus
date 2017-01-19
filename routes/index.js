var express = require('express')
var router = express.Router();

var authController = require('../controllers/auth-controller'),
    authenticate = authController.authenticateUser;




/* GET home page. */
router.get('/', function(req, res, next){
    res.render('index');
});


/////////////////////////////////////////////////////////////////////
//                    UPLOAD ROUTES                                //
/////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
//                    AUTHENTICATION ROUTES                        //
/////////////////////////////////////////////////////////////////////
router.post('/register', authController.register);
router.get('/register', function(req, res, next){ return res.render('register');});

router.post('/login', authController.login);
router.get('/login', function(req, res, next){ return res.render('login');});

router.post("/logout", authController.logout);

router.get('/logout', authenticate, authController.logout);

module.exports = router;
