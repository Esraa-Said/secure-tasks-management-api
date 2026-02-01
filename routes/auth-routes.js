const express = require("express");
const authControllers = require("../controllers/auth-controllers");


const router = express.Router();



router.post('/register', authControllers.register);
router.get('/verify-user/:code', authControllers.verifyAccount);


module.exports = router;