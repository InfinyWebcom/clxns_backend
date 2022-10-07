const express =require('express');
const router=express.Router();

const locationCtrl = require('../controllers/location');
const auth = require('../utils/auth');
const { check } = require('express-validator');

router.get('/',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  locationCtrl.list(req, res);
});

router.post('/locationList',[auth.isLoggedin, auth.authenticate('masterdata', 'view')], (req, res) => {
  locationCtrl.locationList(req, res);
});

router.get('/addLocation', [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  res.render('admin/components/masterData/location/add_location');
});


router.post('/addLocation', [
  check('name', 'location name is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('masterdata', 'add')], (req, res) => {
  locationCtrl.createLocation(req, res);
});

router.get('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  locationCtrl.editLocation(req, res);
});

router.post('/edit/:id',[auth.isLoggedin, auth.authenticate('masterdata', 'edit')], (req, res) => {
  locationCtrl.updateLocation(req, res);
});

router.post('/delete', [auth.isLoggedin, auth.authenticate('masterdata', 'delete')], (req, res) => {
  locationCtrl.deleteLocation(req, res);
});
module.exports = router;