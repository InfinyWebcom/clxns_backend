const express =require('express');
const router=express.Router();

const disCtrl = require('../controllers/sub_dispositions');
const auth = require('../utils/auth');
const { check } = require('express-validator');

router.post('/loadSubDispositions', (req, res) => {
  disCtrl.loadSubDispositions(req, res);
});

module.exports = router;