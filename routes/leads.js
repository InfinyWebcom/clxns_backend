const express = require('express');
const { check, validationResult, body } = require('express-validator');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// const multer = require('multer');
const leadsCtrl = require('../controllers/leads');
const auth = require('../utils/auth');

// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({ storage });

router.get('/assignLeads',[auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.listAllAssign(req, res);
});

router.get('/newLeads',[auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.listNewAssign(req, res);
});

router.get('/archiveLeads',[auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.listArchiveLead(req, res);
});

router.post('/leadslistNew', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.leadslistNew(req, res);
});

router.post('/leadslistAll', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.leadslistAll(req, res);
});

router.post('/leadslistArchive', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.leadslistArchive(req, res);
});

router.get('/uploadLeads', (req, res) => {
  leadsCtrl.uploadLeads(req, res);
});

router.post('/uploadLeads', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.uploadFile(req, res);
});

router.get('/newLeads/getuploadLeads', (req, res) => {
  leadsCtrl.getuploadLeads(req, res);
});

router.get('/newLeads/view/:loanAccountNo', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.viewLeadsDetails(req, res);
});

router.get('/assignLeads/view/:loanAccountNo', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.viewLeadsDetails(req, res);
});

router.get('/view/receipt/:eventId', (req, res) => {
  leadsCtrl.viewReceipt(req, res);
});

router.get('/archiveLeads/view/:loanAccountNo', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.viewLeadsDetails(req, res);
});

router.get('/view/:loanAccountNo', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.viewLeadsDetails(req, res);
});

router.get('/newLeads/edit/:loanAccountNo',[auth.isLoggedin, auth.authenticate('leads', 'edit')], (req, res) => {
  leadsCtrl.editLeadsDetails(req, res);
});

router.post('/leadHistory',[auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.leadHistory(req, res);
});

router.get('/newLeads/download/:id', (req, res) => {
  leadsCtrl.downloadSupporting(req, res);
});

router.post('/newLeads/edit/:loanAccountNo',[auth.isLoggedin, auth.authenticate('leads', 'edit')], (req, res) => {
  leadsCtrl.updateLeadsDetails(req, res);
});

router.post('/newLeads/delete', [auth.isLoggedin, auth.authenticate('leads', 'delete')], (req, res) => {
  leadsCtrl.deleteLeads(req, res);
});

router.post('/newLeads/assignLeadToTeam', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.assignLeadToTeam(req, res);
});

router.post('/newLeads/reassignLeadToTeam', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.reassignLeadToTeam(req, res);
});

router.post('/getcampaignDetails', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.getcampaignDetails(req, res);
});

router.post('/leadsAddTelecallers', [auth.isLoggedin, auth.authenticate('leads', 'view')], (req, res) => {
  leadsCtrl.leadsAddTelecallers(req, res);
});

router.post('/saveCaseEvents',/* [auth.isLoggedin, auth.authenticate('leads', 'view')],*/ (req, res) => {
  leadsCtrl.saveCaseEvents(req, res);
});

router.post('/findSubDisposition', (req, res) => {
  leadsCtrl.findSubDisposition(req, res);
});

router.post('/filterApiData', (req, res) => {
  leadsCtrl.filterApiData(req, res);
});

router.post('/leadContactUpdate', [
  check('leadId', 'Lead id is required').notEmpty().escape(),
  check('type', 'Type is required').escape(),
  check('content', 'Content is required').escape(),
  ],(req, res) => {
    leadsCtrl.leadContactUpdate(req, res);
});

router.post('/leadReport/download', (req, res) => {
  leadsCtrl.leadReport(req, res);
});

module.exports = router;
