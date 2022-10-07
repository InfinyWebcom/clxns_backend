const express = require('express');

const router = express.Router();
const reportCtrl = require('../controllers/report');
const auth = require('../utils/auth');

router.get('/', [auth.isLoggedin], (req, res) => {
  reportCtrl.index(req, res);
});

router.post('/customerList', [auth.isLoggedin], (req, res) => {
  reportCtrl.customerList(req, res);
});

router.post('/customerReportDownload', [auth.isLoggedin], (req, res) => {
  reportCtrl.customerReportDownload(req, res);
});

router.post('/misReportList', [auth.isLoggedin], (req, res) => {
  reportCtrl.misReportList(req, res);
});

router.post('/misAgentReport', [auth.isLoggedin], (req, res) => {
  reportCtrl.misAgentReport(req, res);
});

router.post('/misCaseReport', [auth.isLoggedin], (req, res) => {
  reportCtrl.customerCaseReport(req, res);
});

router.post('/misLeadReport', [auth.isLoggedin], (req, res) => {
  reportCtrl.misLeadReport(req, res);
});

router.post('/filterData', [auth.isLoggedin], (req, res) => {
  reportCtrl.filterData(req, res);
});


router.post('/getFICount', (req, res) => {
  reportCtrl.getFICount(req, res);
});

router.post('/fisCountReport', (req, res) => {
  reportCtrl.fisCountReport(req, res);
});

router.post('/getPortfolioAnalysis', (req, res) => {
  reportCtrl.getPortfolioAnalysis(req, res);
});

router.post('/portfolioReport', (req, res) => {
  reportCtrl.portfolioReport(req, res);
});

router.post('/getOverallCollection', (req, res) => {
  reportCtrl.getOverallCollection(req, res);
});

router.post('/overallReportDownload', (req, res) => {
  reportCtrl.overallReportDownload(req, res);
});

router.post('/getAgentProductivity', (req, res) => {
  reportCtrl.getAgentProductivity(req, res);
});

router.post('/agentProductReport', (req, res) => {
  reportCtrl.agentProductReport(req, res);
});

router.post('/getAgent', (req, res) => {
  reportCtrl.getAgent(req, res);
});

router.post('/getCollectionEfficiency', (req, res) => {
  reportCtrl.getCollectionEfficiency(req, res);
});

router.post('/collectionEfficiencyReport', (req, res) => {
  reportCtrl.collectionEfficiencyReport(req, res);
});

router.post('/getTeamMembers', (req, res) => {
  reportCtrl.getTeamMembers(req, res);
});

router.post('/getMembers', (req, res) => {
  reportCtrl.getMembers(req, res);
});

router.post('/getPoolName', (req, res) => {
  reportCtrl.getPoolName(req, res);
});

router.post('/getPool', (req, res) => {
  reportCtrl.getPool(req, res);
});

module.exports = router;
