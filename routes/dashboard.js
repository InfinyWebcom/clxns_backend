const express = require('express');

const router = express.Router();
const dashboardCtrl = require('../controllers/dashboard');
const auth = require('../utils/auth');

router.get('/', [auth.isLoggedin], (req, res) => {
  dashboardCtrl.index(req, res);
});

router.post('/filterData', [auth.isLoggedin], (req, res) => {
  dashboardCtrl.filterData(req, res);
});

router.post('/getRecoveredAmt', [auth.isLoggedin], (req, res) => {
  dashboardCtrl.getRecoveredAmt(req, res);
});

module.exports = router;
