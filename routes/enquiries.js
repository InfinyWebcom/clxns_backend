/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-multi-spaces */
/* eslint-disable linebreak-style */
const express = require('express');

const router = express.Router();
const enquiriesCtrl = require('../controllers/enquiries');
const auth = require('../utils/auth');

router.get('/', [auth.isLoggedin, auth.authenticate('enquiries', 'view')], (req, res) => {
  enquiriesCtrl.list(req, res);
});

router.post('/enquirieslist', [auth.isLoggedin, auth.authenticate('enquiries', 'view')], (req, res) => {
  enquiriesCtrl.enquirieslist(req, res);
});

router.get('/view/:id',[auth.isLoggedin, auth.authenticate('enquiries', 'view')], (req, res) => {
  enquiriesCtrl.viewEnquiriesDetails(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('enquiries', 'edit')], (req, res) => {
  enquiriesCtrl.updateById(req, res);
});

router.post('/delete',[auth.isLoggedin, auth.authenticate('enquiries', 'delete')], (req, res) => {
  enquiriesCtrl.deleteById(req, res);
});
module.exports = router;
