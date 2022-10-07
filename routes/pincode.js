const express =require('express');
const router=express.Router();

const pincodeCtrl = require('../controllers/pincode');
const auth = require('../utils/auth');
const { check } = require('express-validator');

router.get('/',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  pincodeCtrl.list(req, res);
});

router.post('/pincodeList',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  pincodeCtrl.pincodeList(req, res);
});

router.get('/addPincode', [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  res.render('admin/components/masterData/pincode/add_pincode');
});


router.post('/addPincode', [
  check('code', 'pincode number is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  pincodeCtrl.createPincode(req, res);
});

router.get('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  pincodeCtrl.editPincode(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  pincodeCtrl.updatePincode(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('masterdata', 'delete')], (req, res) => {
  pincodeCtrl.deletePincode(req, res);
});
module.exports = router;