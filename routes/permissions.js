const express = require('express');

const router = express.Router();
const { check } = require('express-validator');
const permissionsCtrl = require('../controllers/permissions');
const auth = require('../utils/auth');

router.get('/',[auth.isLoggedin, auth.authenticate('permissions', 'view')], (req, res) => {
  permissionsCtrl.list(req, res);
});

router.post('/permissionsList',[auth.isLoggedin, auth.authenticate('permissions', 'view')], (req, res) => {
  permissionsCtrl.permissionsList(req, res);
});

router.get('/addRoles', [auth.isLoggedin, auth.authenticate('permissions', 'add')], (req, res) => {
  res.render('admin/components/permissions/roles/add_roles');
});


router.post('/addRoles', [
  check('name', 'Role name is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('permissions', 'add')], (req, res) => {
  permissionsCtrl.createPermissions(req, res);
});

router.get('/roles/view/:id', [auth.isLoggedin, auth.authenticate('permissions', 'view')], (req, res) => {
  permissionsCtrl.viewPermissionsDetails(req, res);
});

router.post('/roles/view/:id', [auth.isLoggedin, auth.authenticate('permissions', 'view')], (req, res) => {
  permissionsCtrl.updatePermissionsModules(req, res);
});

router.get('/roles/edit/:id',[auth.isLoggedin, auth.authenticate('permissions', 'edit')], (req, res) => {
  permissionsCtrl.editPermissionsRoles(req, res);
});

router.post('/roles/edit/:id',[auth.isLoggedin, auth.authenticate('permissions', 'edit')], (req, res) => {
  permissionsCtrl.updatePermissionsRoles(req, res);
});

router.post('/roles/delete', [auth.isLoggedin, auth.authenticate('permissions', 'delete')], (req, res) => {
  permissionsCtrl.deletePermissionsRoles(req, res);
});
router.post('/roles/status', [auth.isLoggedin, auth.authenticate('permissions', 'delete')], (req, res) => {
  permissionsCtrl.permissionRoleStatus(req, res);
});
router.get('/roles/addPermissionsAll', [auth.isLoggedin, auth.authenticate('permissions', 'add')], (req, res) => {
  res.render('admin/components/permissions/add_permission');
});

router.post('/rolePermissions',[auth.isLoggedin, auth.authenticate('permissions', 'view')], (req, res) => {
  permissionsCtrl.rolePermissions(req, res);
});

module.exports = router;