const express = require('express');
const router = express.Router();
const teamCtrl = require('../controllers/teams');
const auth = require('../utils/auth');
const { check } = require('express-validator');


router.get('/', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
  teamCtrl.list(req, res);
});

router.post('/teamList', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
  teamCtrl.teamList(req, res);
});

router.get('/addTeam', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  teamCtrl.addTeam(req, res);
});

router.post('/addTeam', [
  check('name', 'Team name is required').notEmpty(),
  check('description', 'Description name is required').notEmpty(),
  check('teamLeaderId', 'Team leader is required').notEmpty(),
], [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  teamCtrl.createTeam(req, res);
});

router.post('/deleteTeam', [auth.isLoggedin, auth.authenticate('teams', 'delete')], (req, res) => {
  teamCtrl.deleteTeam(req, res);
});

router.get('/edit/:id', [auth.isLoggedin, auth.authenticate('teams', 'edit')], (req, res) => {
  teamCtrl.editTeamDetails(req, res);
});
router.post('/edit/:id', [auth.isLoggedin, auth.authenticate('teams', 'edit')], (req, res) => {
  teamCtrl.updateTeamDetails(req, res);
});

router.get('/view/:id', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
  teamCtrl.viewTeamDetails(req, res);
});

router.post('/teamDetails', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
  teamCtrl.teamDetails(req, res);
});

router.post('/deleteFromTeam', [auth.isLoggedin, auth.authenticate('teams', 'delete')], (req, res) => {
  teamCtrl.deleteFromTeam(req, res);
});

router.get('/addNewMembers/:id', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  teamCtrl.addNewMembers(req, res);
});

router.post('/addNewMembersList', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  teamCtrl.addNewMembersList(req, res);
});

router.post('/addToTeam', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  teamCtrl.addToTeam(req, res);
});

router.post('/viewUserDetails', [auth.isLoggedin, auth.authenticate('teams', 'view')], (req, res) => {
  teamCtrl.viewUserDetails(req, res);
});

router.post('/getLeaderTeams', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  console.log('getLeaderTeams add ----');
  teamCtrl.getLeaderTeams(req, res);
});

router.post('/getTeamMembers', [auth.isLoggedin, auth.authenticate('teams', 'add')], (req, res) => {
  console.log('getTeamMembers add ----');
  teamCtrl.getTeamMembers(req, res);
});


module.exports = router;
