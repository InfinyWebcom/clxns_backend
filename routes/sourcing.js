const express = require('express');

const router = express.Router();
const fs = require('fs');
const path = require('path');
// const multer = require('multer');
const sourcingCtrl = require('../controllers/sourcing');
const leadsCtrl = require('../controllers/leads');
const auth = require('../utils/auth');
// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({ storage });

router.get('/uploadLeads', (req, res) => {
  sourcingCtrl.uploadLeads(req, res);
});

router.post('/uploadLeads', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
   leadsCtrl.uploadFile(req, res);
});

router.get('/',[auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.listSourcing(req, res);
});

router.post('/leadSourcingSuccess', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.leadSourcingSuccess(req, res);
});

router.post('/leadSourcingFailed', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.leadSourcingFailed(req, res);
});

router.get('/delete',[auth.isLoggedin, auth.authenticate('sourcing', 'delete')], (req, res) => {
  sourcingCtrl.deleteLeadsSourcing(req, res);
});

router.get('/download/:id', (req, res) => {
  sourcingCtrl.downloadLeads(req, res);
});

router.get('/downloadTemplate', (req, res) => {
  sourcingCtrl.downloadLeadTemplate(req, res);
});

router.get('/successLeads/view/:id', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.successLeads(req, res);
});

router.post('/leadSuccessTable', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.leadSuccessTable(req, res);
});

router.get('/failedLeads/view/:id', [auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.failedLeads(req, res);
});

router.get('/failedLeads/download/:id', (req, res) => {
  sourcingCtrl.failedLeadReport(req, res);
});

router.post('/getSourcingDetails',[auth.isLoggedin, auth.authenticate('sourcing', 'view')], (req, res) => {
  sourcingCtrl.getSourcingDetails(req, res);
});


module.exports = router;