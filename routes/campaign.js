const express = require('express');

const router = express.Router();
const campaignCtrl = require('../controllers/campaign');
const auth = require('../utils/auth');

router.get('/', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.list(req, res);
});

router.post('/campaignList', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.campaignList(req, res);
});

router.get('/addCampaign', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  res.render('admin/components/campaign/add_campaign');
});

router.post('/addCampaign', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.createCampaign(req, res);
});

router.get('/view/:id', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.viewCampaignDetails(req, res);
});

router.get('/edit/:id', [auth.isLoggedin, auth.authenticate('campaigns', 'edit')], (req, res) => {
  campaignCtrl.editCampaignDetails(req, res);
});

router.post('/edit/:id', [auth.isLoggedin, auth.authenticate('campaigns', 'edit')], (req, res) => {
  campaignCtrl.updateCampaignDetails(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('campaigns', 'delete')], (req, res) => {
  campaignCtrl.deleteCampaign(req, res);
});

router.post('/campaignLeads', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.campaignLeads(req, res);
});

router.post('/campaignTelecallers', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.campaignTelecallers(req, res);
});

router.post('/campaignAddTelecallers', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.campaignAddTelecallers(req, res);
});

router.get('/view/lead/view/:loanAccountNo', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.viewCampaignDetailsLeads(req, res);
});

router.post('/addToTelecaller', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.addToTelecaller(req, res);
});

router.post('/allocateTelecaller', [auth.isLoggedin, auth.authenticate('campaigns', 'view')], (req, res) => {
  campaignCtrl.allocateTelecaller(req, res);
});

router.post('/closeCampaign', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.closeCampaign(req, res);
});

router.post('/addToAnotherCampaign', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.addToAnotherCampaign(req, res);
});

router.post('/removeFromCampaign', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.removeFromCampaign(req, res);
});

router.post('/reassignLead', [auth.isLoggedin, auth.authenticate('campaigns', 'add')], (req, res) => {
  campaignCtrl.reassignLead(req, res);
});

module.exports = router;
