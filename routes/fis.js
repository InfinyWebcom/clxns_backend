const express =require('express');
const router=express.Router();

const fisCtrl = require('../controllers/fis');
const auth = require('../utils/auth');
const { check } = require('express-validator');

router.get('/',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  fisCtrl.list(req, res);
});

router.post('/fisList',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  fisCtrl.fisList(req, res);
});

router.get('/addFis', [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  fisCtrl.addFis(req, res);
});


router.post('/addFis', [
  check('name', 'fis name is required').notEmpty().escape(),
], [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  fisCtrl.createFis(req, res);
});

router.get('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  fisCtrl.editFis(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  fisCtrl.updateFis(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('masterdata', 'delete')], (req, res) => {
  fisCtrl.deleteFis(req, res);
});

router.get('/login', (req, res) => {
  fisCtrl.login(req, res);
});

router.post('/login', [
  check('password', 'Password is required').notEmpty(),
  check('email', 'Email is required').notEmpty()
  ], (req, res, next) => {
  fisCtrl.login(req, res);
});

router.get('/logout', (req, res) => {
  fisCtrl.logout(req, res);
});

module.exports = router;