const express =require('express');
const router=express.Router();

const disCtrl = require('../controllers/dispositions');
const auth = require('../utils/auth');
const { check } = require('express-validator');

router.get('/',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  disCtrl.list(req, res);
});

router.post('/dispositionList',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  disCtrl.dispositionList(req, res);
});

router.get('/addDisposition', [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  disCtrl.addDisposition(req, res);
});


router.post('/addDisposition', [
  check('name', 'Disposition name is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  disCtrl.createDis(req, res);
});

router.get('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  disCtrl.editDisposition(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  disCtrl.updateDisposition(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('masterdata', 'delete')], (req, res) => {
  disCtrl.deleteDisposition(req, res);
});

router.post('/loadDispositions', (req, res) => {
  disCtrl.loadDispositions(req, res);
});

module.exports = router;