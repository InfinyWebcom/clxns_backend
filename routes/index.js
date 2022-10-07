/* eslint-disable linebreak-style */
const express = require('express');

const router = express.Router();
const indexCtrl = require('../controllers/index');
const contactCtrl = require('../controllers/contactUs');
const { validate, body } = require('../validations');
const validations = require('../validations/contact_us')(body);

router.get('/', (req, res) => {
  indexCtrl.home(req, res);
});

router.get('/privacy_policy', (req, res) => {
  indexCtrl.privacy_policy(req, res);
});

router.get('/terms_of_use', (req, res) => {
  indexCtrl.terms_of_use(req, res);
});

router.post('/contactus', validate(validations), (req, res) => {
  contactCtrl.contactUs(req, res);
});

router.get('/contactus', (req, res) => {
  contactCtrl.findAll(req, res);
});

router.get('/contactus/:id', (req, res) => {
  contactCtrl.findOne(req, res);
});

router.get('/bad-request', (req, res) => {
  res.render('admin/bad_request');
});

router.patch('/contactus/:id', validate(validations), (req, res) => {
  contactCtrl.update(req, res);
});

router.delete('/contactus/:id', (req, res) => {
  contactCtrl.delete(req, res);
});

module.exports = router;
