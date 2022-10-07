const express=require('express');
const router=express.Router();
const customerCtrl = require('../controllers/customer');
const auth = require('../utils/auth');

router.get('/',[auth.isLoggedin, auth.authenticate('customers', 'view')],(req,res)=>{
  customerCtrl.list(req,res);
});

router.post('/customerlist', [auth.isLoggedin, auth.authenticate('customers', 'view')], (req, res) => {
  customerCtrl.customerlist(req, res);
});

router.get('/addCustomer', [auth.isLoggedin, auth.authenticate('customers', 'add')], (req, res) => {
  customerCtrl.addCustomer(req, res);
});

router.post('/addCustomer', [auth.isLoggedin, auth.authenticate('customers', 'add')], (req, res) => {
  customerCtrl.createCustomer(req, res);
});

router.get('/view/:id', [auth.isLoggedin, auth.authenticate('customers', 'view')], (req, res) => {
  customerCtrl.viewCustomerDetails(req, res);
});

router.post('/customerHistory', [auth.isLoggedin, auth.authenticate('customers', 'view')], (req, res) => {
  customerCtrl.customerHistoryData(req, res);
});

router.get('/edit/:id',[auth.isLoggedin, auth.authenticate('customers', 'edit')], (req, res) => {
  customerCtrl.editCustomerDetails(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('customers', 'edit')], (req, res) => {
  customerCtrl.updateCustomerDetails(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('customers', 'delete')], (req, res) => {
  customerCtrl.deleteCustomer(req, res);
});

module.exports = router;
