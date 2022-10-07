const express = require('express');
const router = express.Router();
const auditCtrl = require('../controllers/auditTrails');
const auth = require('../utils/auth');
const { check } = require('express-validator');


router.get('/', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
    auditCtrl.list(req, res);
});

router.post('/auditList', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
    auditCtrl.auditList(req, res);
});

module.exports = router;