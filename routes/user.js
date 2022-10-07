/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable linebreak-style */
const express = require('express');
const { check } = require('express-validator');
const { validate, body } = require('../validations');

const router = express.Router();
const validations = require('../validations/users')(body);
const auth = require('../utils/auth');

const userCtrl = require('../controllers/users');

router.get('/login', (req, res) => {
  userCtrl.login(req, res);
});

router.post('/login', (req, res) => {
  userCtrl.login(req, res);
});

router.get('/logout', (req, res) => {
  userCtrl.logout(req, res);
});

router.get('/forgotPassword', (req, res) => {
  userCtrl.forgotPassword(req, res);
});

router.post('/forgotPassword', (req, res) => {
  userCtrl.forgotPassword(req, res);
});

router.get('/resetPassword', (req, res) => {
  userCtrl.resetPassword(req, res);
});

router.post('/resetPassword', (req, res) => {
  userCtrl.resetPassword(req, res);
});

router.get('/', [auth.isLoggedin, auth.authenticate('users', 'view')], (req, res) => {
  userCtrl.list(req, res);
});

router.post('/userlist', [auth.isLoggedin, auth.authenticate('users', 'view')], (req, res) => {
  userCtrl.userlist(req, res);
});

router.get('/view/:id', [auth.isLoggedin, auth.authenticate('users', 'view')], (req, res) => {
  userCtrl.viewUserDetails(req, res);
});

router.get('/addUser', [auth.isLoggedin, auth.authenticate('users', 'add')], (req, res) => {
  userCtrl.addUser(req, res);
});

router.post('/addUser', [
  check('firstName', 'First name is required').notEmpty(),
  check('firstName', 'First name requires at least 3 characters.').isLength({ min: 3 }),
  // check('lastName', 'Last name is required').notEmpty(),
  check('email', 'Email is required').notEmpty(),
  check('email', 'Email is not valid').isEmail(),
  check('phone', 'Phone is required').notEmpty(),
  check('phone', 'Phone is required only digits').isNumeric(),
  // check('emergencyPhone', 'emergencyPhone is required').notEmpty(),
  // check('phone', 'Phone is required only digits').isNumber(),
  check('phone', 'Phone is required').notEmpty(),
  check('dob', 'DOB is required').notEmpty(),
  check('roleId', 'Role name is required').notEmpty(),
  check('location', 'Location is required').notEmpty(),
  // check('address', 'Address is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('users', 'add')], (req, res) => {
  userCtrl.createUser(req, res);
});

router.get('/edit/:id', [auth.isLoggedin, auth.authenticate('users', 'edit')], (req, res) => {
  userCtrl.editUserDetails(req, res);
});

router.post('/edit', [
  check('firstName', 'First name is required').notEmpty(),
  check('firstName', 'First name requires at least 3 characters.').isLength({ min: 3 }),
  // check('lastName', 'Last name is required').notEmpty(),
  check('email', 'Email is required').notEmpty(),
  check('phone', 'Phone is required').notEmpty(),
  check('phone', 'Phone is required only digits').isNumeric(),
  check('dob', 'DOB is required').notEmpty(),
  check('roleId', 'Role name is required').notEmpty(),
  check('location', 'Location is required').notEmpty(),
  // check('address', 'Address is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('users', 'edit')], (req, res) => {
  userCtrl.updateUserDetails(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('users', 'delete')], (req, res) => {
  userCtrl.deleteUser(req, res);
});


router.post('/validateFields', (req, res) => {
  userCtrl.validateFields(req, res);
});

router.post('/checkUserExit', (req, res) => {
  userCtrl.checkUserExit(req, res);
});

router.post('/addTeam', (req, res) => {
  userCtrl.addTeam(req, res);
});


router.post('/updateUserPassword', (req, res) => {
  userCtrl.updateUserPassword(req, res);
});

router.get('/verifiedEmail', (req, res) => {
  userCtrl.emailVerification(req, res);
});

router.post('/findLevel', (req, res) => {
  userCtrl.findLevel(req, res);
});

router.post('/findStateCity', (req, res) => {
  userCtrl.findStateCity(req, res);
});

router.post('/findCity', (req, res) => {
  userCtrl.findCity(req, res);
});

router.post('/findPincode', (req, res) => {
  userCtrl.findPincode(req, res);
});

router.get('/profile',[auth.isLoggedin], (req, res) => {
  userCtrl.profile(req, res);
});

module.exports = router;
