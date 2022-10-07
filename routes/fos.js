const express = require('express');
const { check, validationResult, body } = require('express-validator');

const router = express.Router();
const auth = require('../utils/mobileAuth');

const fosCtrl = require('../controllers/fos');

router.post('/login', [
    check('password', 'Password is required').notEmpty(),
    check('email', 'Email is required').notEmpty()
    ], (req, res, next) => {
    fosCtrl.login(req, res);
});

router.post('/logout', [auth.authenticateUser], (req, res) => {
    fosCtrl.logout(req, res);
});

router.post('/forgotPassword', [
    check('email', 'Email is required').notEmpty()
    ], (req, res) => {
    fosCtrl.forgotPassword(req, res);
});

router.post('/verifyOTP', [
    check('token', 'Token is required').notEmpty(),
    check('verifyOtp', 'Verification otp is required').notEmpty(),
    check('email', 'Email is required').notEmpty()
    ], (req, res) => {
    fosCtrl.verifyPassword(req, res);
});

router.post('/getUserDetails', [auth.authenticateUser], (req, res) => {
    fosCtrl.getUserDetails(req, res);
});

router.post('/getCasesList', [auth.authenticateUser], (req, res) => {
    fosCtrl.getCasesList(req, res);
});

router.post('/addToPlan', [
    check('leadId', 'Lead id is required').notEmpty(),
    check('planDate', 'Plan date id is required').notEmpty()
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.addToPlan(req, res);
});

router.post('/listMyPlan', [auth.authenticateUser], (req, res) => {
    fosCtrl.listMyPlan(req, res);
});

router.post('/getCaseDetails', [
    check('loanAccountNo', 'Loan AccountNo is required').notEmpty()
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.getCaseDetails(req, res);
});

router.post('/notificationListing', [auth.authenticateUser], (req, res) => {
    fosCtrl.notificationListing(req, res);
});

router.post('/getStatisticsData', [auth.authenticateUser], (req, res) => {
    fosCtrl.getStatisticsData(req, res);
});

router.post('/caseHistory', [
    check('loanAccountNo', 'Loan no is required').notEmpty()
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.caseHistory(req, res);
});

router.post('/listFosDis', (req, res) => {
    fosCtrl.listFosDis(req, res);
});

router.post('/changePassword', [
    check('password', 'Password is required').notEmpty(),
    check('confirmPassword', 'Confirm Password field is required').notEmpty()
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.changePassword(req, res);
});

router.post('/saveCheckinData', [
    check('loanAccountNo', 'Loan No is required').notEmpty(),
    check('location', 'Location is required').notEmpty(),
    check('dispositionId', 'Disposition Id is required').notEmpty(),
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.saveCheckinData(req, res);
});

router.post('/listBank', [auth.authenticateUser], (req, res) => {
    fosCtrl.listBank(req, res);
});

router.post('/deletePlan', [
    check('leadId', 'Lead id is required').notEmpty().escape(),
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.deletePlan(req, res);
});

router.post('/leadContactUpdate', [
    check('leadId', 'Lead id is required').notEmpty().escape(),
    check('type', 'Type is required').escape(),
    check('content', 'Content is required').escape(),
    ], [auth.authenticateUser], (req, res) => {
    fosCtrl.leadContactUpdate(req, res);
});

// router.post('/addPayment', [
//     check('leadId', 'Lead id is required').notEmpty(),
//     check('loanNo', 'Loan no is required').notEmpty(),
//     check('amtType', 'Amt type is required').notEmpty(),
//     check('paymentMode', 'Payment mode is required').notEmpty(),
//     check('recoveryDate', 'Recovery date is required').notEmpty()
//     ], [auth.authenticateUser], (req, res) => {
//     fosCtrl.addPayment(req, res);
// });

router.get('/generateReceipt', (req, res) => {
    fosCtrl.generateReceipt(req, res);
});

module.exports = router;