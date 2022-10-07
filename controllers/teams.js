/* eslint-disable */
// NODE MODULES
const { validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const helper = require('../helper/helper');
const auditMsgs = require('../helper/auditMsgs');
const moment = require('moment');

// DATABASE
const db = require('../models');
const { use } = require('../routes/auditTrail');
const Op = db.Sequelize.Op;
const Teams = db.teams;
const TeamMember = db.teamMembers;
const Users = db.users;
const Roles = db.roles;
const Location = db.locations;
const Leads = db.leads;
const RoleModules = db.rolesModules;
const Modules = db.modules;
const CampaignMembers = db.campaignMembers;
const Campaign = db.campaign;
const OperatingLocation = db.operatingLocations;
const UserExperience=db.userExperience;
const ProductType = db.productType;
const Language = db.language;

// CONTROLLERS
const userCrtl = require('./users');

// List Teams - Page
const list = async (req, res) => {

  const teams = await Teams.findAndCountAll({ where: { isDeleted: 0 } });

  const AjaxColumns = [
    // { 'title': '', 'data': 'checkbox' },
    { 'title': 'Name', 'data': 'name' },
    { 'title': 'Location', 'data': 'location.name' },
    { 'title': 'No of Telecallers', 'data': 'teleCount' },
    { 'title': 'No of FOS', 'data': 'fosCount' },
    { 'title': 'Description', 'data': 'description' },
    { 'title': 'Actions', 'data': 'actions' },
  ];

  const apiUrl = 'team/teamList';

  let payload = {};

  payload.url = 'team';
  payload.pageHeading = 'Teams';
  payload.totalCount = `Total Teams: ${teams.count}`;
  payload.addUrl = 'team/addTeam';
  payload.addButtonName = 'Create a team';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to change status of this team?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  const locations = await Location.findAll({});

  payload.datatable = {
    url : 'teams',
    columns: AjaxColumns,
    apiUrl: apiUrl,
    locations: locations
  };

  res.render('admin/main_list', payload);

};

// List Teams
const teamList = async (req, res) => {
  const user = req.session.user;
  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = { isDeleted: 0 };
  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  //save trail
  var data = {
    userName: user.firstName + ' ' + user.lastName,
    userId: user.id,
    moduleName: "Teams",
    tableName: "Teams",
    action: "List",
    objectId: user.id,
  }
  data.description = auditMsgs.getAuditMessage("teamList", data)
  
  if (user.roleId == roles[LeaderIndex].id) {
    searchQuery = (req.body.filterObj && req.body.filterObj.searchValue) ? { isDeleted: 0, teamLeaderId: user.id, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } } : { isDeleted: 0, teamLeaderId: user.id};
    searchQuery = (req.body.filterObj && req.body.filterObj.searchValue) ? (('deactivated'.includes(req.body.filterObj.searchValue) == true) ? { [Op.or]: [{teamLeaderId: user.id, isDeleted: 1 }, { isDeleted: 0, teamLeaderId: user.id, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } } ]} : { isDeleted: 0, teamLeaderId: user.id, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } } ) : { isDeleted: 0, teamLeaderId: user.id }
  }
  else if (user.roleId == roles[AdminIndex].id) {
    searchQuery = (req.body.filterObj && req.body.filterObj.searchValue) ? {  isDeleted: 0, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } } : { isDeleted: 0 };
    searchQuery = (req.body.filterObj && req.body.filterObj.searchValue) ? (('deactivated'.includes(req.body.filterObj.searchValue) == true) ? { [Op.or]: [ { isDeleted: 1 }, {  isDeleted: 0, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } }] } : {  isDeleted: 0, name: { [Op.like]: `%${req.body.filterObj.searchValue}%` } }): {  isDeleted: 0 }
  }
  if (req.body.filterObj && req.body.filterObj.locationId) {
    searchQuery.locationId = req.body.filterObj.locationId
  }

  // console.log('\n\nTeams - teamList - searchQuery :-', searchQuery);

  let include = user.role == 'team_leader' ? [{ model: Users, as: 'teamLeader' }] : null;

  const teams = await Teams.findAndCountAll({ limit: length, offset: start, where: searchQuery, include: [{ model: Location, as: 'location' }] });

  for (const team of teams.rows) {
    // console.log('\n\nTeams for team :-', team);

    const members = await TeamMember.findAll({ where: { teamId: team.id }, include: [{ model: Users, as: 'user' }] });

    // console.log('\n\nteam of team members:-', members);
    const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
    // console.log('\n\nteam of team teleIndex:-', teleTeam.length);

    const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
    // console.log('\n\nteam of team fosTeam:-', fosTeam.length);

    team.dataValues.teleCount = teleTeam.length
    team.dataValues.fosCount = fosTeam.length

    let actions = '';

    if (req.permissionsList.includes('view')) {
      actions = `<a class='dt-action text-capitalize' href='/team/view/${team.id}'><b>View</b></a>`;
    }
    if (req.permissionsList.includes('edit')) {
  //    actions = actions + `<a class='dt-action text-capitalize' href='/team/edit/${team.id}'><b>Edit</b></a>`;
    }
    if (req.permissionsList.includes('delete')) {
      // console.log('teamList teams--- ', team.isDeleted);
      if (team.isDeleted == 0) {
        actions = actions + `<a href="#confirmModal" class='modal-trigger dt-action text-capitalize pointer' data-msg="Are you sure you want to deactivate this team?" onclick="action('team/deleteTeam', '', '${team.id}')"><b>Deactivate</b></a>`;
      }
      else {
        actions = actions + `<a href="#confirmModal" class='modal-trigger dt-action text-capitalize pointer' data-msg="Are you sure you want to activate this team?" onclick="action('team/deleteTeam', '', '${team.id}')"><b>Activate</b></a>`;   
      }
    }
    team.dataValues.actions = actions;
    team.dataValues.checkbox = `<label><input type='checkbox' onchange='checkboxFunc(${user.id})'/><span></span></label>`
  }
  

  let forLog = JSON.parse(JSON.stringify(teams, null, 2));
  // console.log('\n\nTeams - teamList - forLog :-', forLog);

  

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: teams.rows,
    recordsFiltered: teams.count,
    recordsTotal: teams.count
  });

}

// Add Teams - Page
const addTeam = async (req, res) => {

  // console.log('\n\nTeams - addTeam - Session :-', req.session);

  const user = req.session.user;
  let query = {};

  const locations = await Location.findAll({});
  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const FieldCoordinatorIndex = roles.findIndex((e) => e.name === 'field_coordinator');

  //get team list of selected team leader
  const teams = await Teams.findAll({ });
  let LeaderQuery={};
  LeaderQuery.isDeleted=0;
  if (user.roleId == roles[AdminIndex].id) {
    LeaderQuery[Op.or]= [ { roleId: roles[LeaderIndex].id },{ roleId: roles[FieldCoordinatorIndex].id }]
    query = { attributes: ['id', 'firstName','lastName','roleId','employeeId'],where: LeaderQuery, raw: true }
  }
  else if (user.roleId == roles[LeaderIndex].id) {
    LeaderQuery[Op.or]= [ { roleId: roles[LeaderIndex].id },{ roleId: roles[FieldCoordinatorIndex].id }]
    LeaderQuery.id=user.id;
    query = { attributes: ['id', 'firstName','lastName','roleId','employeeId'],where: LeaderQuery, raw: true }
  }

  StrQuery = "SELECT u.id as id, u.firstName, u.employeeId FROM `users` as u WHERE u.id NOT IN (SELECT u.id FROM `users` as u RIGHT JOIN `teams` t ON u.id = t.teamLeaderId ) AND (u.roleId=3 OR u.roleId=6)";
  const users = await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });


  for (const userdata of users) {
    const operLocations = await OperatingLocation.findAll({ where: { userId: userdata.id}, include: [{ model: Location, as: 'location' }] } );
    var operArr = []
    for (const operLocation of operLocations) {
      operArr.push(operLocation.dataValues)
    }
    userdata.operLocations = operArr
  }
  const payload = {};
  payload.users = users;
  payload.error = false;
  payload.locations = locations;
  payload.form = '';
  payload.teams = teams
  return res.render('admin/components/team/add_team', payload);

};

// Create/Add Team
const createTeam = async (req, res) => {

  const result = validationResult(req);

  // console.log('\n\ncreateTeam - req.body :-', req.body);

  const user = req.session.user;
  if (result.errors.length > 0) {    
    let query = {};

    const roles = await Roles.findAll();

    // console.log('\n\nTeams - addTeam - Roles :-', roles);

    const AdminIndex = roles.findIndex((e) => e.name === 'admin');
    const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');

    if (user.roleId == roles[AdminIndex].id) {
      query = { where: { roleId: roles[LeaderIndex].id }, raw: true }
    }
    else if (user.roleId == roles[LeaderIndex].id) {
      query = { where: { roleId: roles[LeaderIndex].id, id: user.id }, raw: true }
    }

    const users = await Users.findAll(query);

    const payload = {};
    payload.users = users;
    payload.error = false;
    payload.error = result.errors[0].msg;

    return res.render('admin/components/team/add_team', payload);

  }

  const newTeam = {
    name: req.body.name,
    locationId: req.body.location,
    description: req.body.description,
    teamLeaderId: req.body.teamLeaderId,
  };

  const createTeam = await Teams.create(newTeam);
  let id = createTeam.dataValues.id;

  const productTypes = await ProductType.findAll({});
  // console.log('\n\n createTeam - productTypes :-', productTypes);  

  const languages = await Language.findAll({});
  // console.log('\n\n createTeam - languages :-', languages);    

  //save trail
  var data = {
    userName: user.firstName + ' ' + user.lastName,
    userId: user.id,
    moduleName: "Teams",
    tableName: "Teams",
    action: "Add",
    objectId: id,
    teamName: createTeam.dataValues.name
  }
  data.description = auditMsgs.getAuditMessage("createTeam", data)
  helper.saveAuditTrail(data, req);

  Teams.findByPk(id, {
    include: [
      {
        model: Users,
        as: 'teamLeader'
      },
      {
        model: Users,
        as: 'users',
        attributes: [],
      },
      { model: Location, as: 'location' }
    ],
  }).then((team) => {

    const AjaxColumns = [
      { 'title': 'First Name', 'data': 'firstName' },
      { 'title': 'Last Name', 'data': 'lastName' },
      { 'title': 'Role', 'data': 'role' },
      { 'title': 'Location', 'data': 'location' },
      { 'title': 'Address', 'data': 'address' },
      { 'title': 'Actions', 'data': 'actions' },
    ];

    const apiUrl = 'team/teamDetails';

    team.teleCount = 0
    team.fosCount = 0

    let payload = {};

    payload.url = 'team';
    payload.permissionsList = req.permissionsList;
    payload.team = team;
    payload.deleteText = 'Are you sure you want to remove this member?';

    payload.toast = true
    payload.toastColor = 'green'
    payload.toastText = 'Team created successfully'

    payload.productTypes = productTypes
    payload.languages = languages

    payload.datatable = {
      columns: AjaxColumns,
      apiUrl: apiUrl,
      id: id
    };
    req.session.toastTxt='Team created successfully';
    res.redirect('/team/view/'+id);
    // res.render('admin/components/team/view_team_details', payload);
  })

};

// View Team Details - Page
const viewTeamDetails = async (req, res) => {

  const { id } = req.params;
  const user = await Users.findOne({ where: { id: req.session.user.id } });
  if(req.session.toastTxt!=undefined && req.session.toastTxt!=null && req.session.toastTxt!=''){
    payload.toast = true
    payload.toastColor = 'green'
    payload.toastText = req.session.toastTxt;
    req.session.toastTxt=null;
  }

  Teams.findByPk(id, {
    include: [
      {
        model: Users,
        as: 'teamLeader',
        attributes: {exclude: ['password','address']},
      },
      {
        model: Users,
        as: 'users',
        attributes: [],
      },
      { model: Location, as: 'location' }
    ],
  }).then(async(team) => {

    //save trail
    var data = {
      userName: req.session.user.firstName + ' ' + req.session.user.lastName,
      userId: req.session.user.id,
      moduleName: "Teams",
      tableName: "Team Details",
      action: "View",
      objectId: id,
      teamName: team.name
    }
    data.description = auditMsgs.getAuditMessage("viewTeamDetails", data)
    helper.saveAuditTrail(data, req);

    const roles = await Roles.findAll();
    const AdminIndex = roles.findIndex((e) => e.name === 'admin');
    const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
    const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
    const FOSIndex = roles.findIndex((e) => e.name === 'fos');
  
    const members = await TeamMember.findAll({ where: { teamId: id }, include: [{ model: Users, as: 'user' ,where: { isDeleted: 0 }}] });

    console.log('\n\viewTeamDetails of team members:-', members);
    const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
    // console.log('\n\viewTeamDetails of team teleIndex:-', teleTeam.length);

    const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
    // console.log('\n\viewTeamDetails of team fosTeam:-', fosTeam.length);

    team.teleCount = teleTeam.length
    team.fosCount = fosTeam.length

    console.log('\n\nviewTeamDetails of team team:-', team);
    console.log('\n\nviewTeamDetails of team team2:-', team.dataValues.teamLeader);

    const AjaxColumns = [
      { 'title': 'First Name', 'data': 'firstName' },
      { 'title': 'Last Name', 'data': 'lastName' },
      { 'title': 'Role', 'data': 'role' },
      { 'title': 'Location', 'data': 'location' },
      { 'title': 'Employee Id', 'data': 'employeeId' },
      // { 'title': 'No. of leads assigned', 'data': 'leadsAssigned' },
      { 'title': 'Actions', 'data': 'actions' },
    ];

    const apiUrl = 'team/teamDetails';

    //to get user details
    const Module = await Modules.findAll({
      attributes: ['id', 'name', 'actions'],
      raw: true,
    });
    const ModulesArray = [];
  
    await Promise.all(Module.map(async (module) => {
      let checkAction = false;
      const PermissionCheck = await RoleModules.findOne({
        where: { roleId: user.roleId, moduleId: module.id },
        raw: true,
      });
      // console.log('\n\nModules - PermissionCheck :-', PermissionCheck);
      if (PermissionCheck && PermissionCheck !== null) {
        checkAction = true;
      }
      let contains = false;
      if (ModulesArray.length === 0) {
        ModulesArray.push({
          module: module.name,
          actions: [
            {
              id: module.id,
              name: module.actions,
              isCheck: checkAction,
            },
          ],
        });
      } else {
        ModulesArray.map((val) => {
          if (val.module === module.name) {
            contains = true;
            val.actions.push({
              id: module.id,
              name: module.actions,
              isCheck: checkAction,
            });
          }
        });
        if (!contains) {
          ModulesArray.push({
            module: module.name,
            actions: [
              {
                id: module.id,
                name: module.actions,
                isCheck: checkAction,
              },
            ],
          });
        }
      }
    }));
  
    const ModulesArrayData = ModulesArray;
    // console.log('\n\viewTeamDetails - viewTeamDetails :-', JSON.stringify(ModulesArrayData));
    //end user details

    let payload = {};

    payload.url = 'teams';
    payload.permissionsList = req.permissionsList;
    payload.team = team;
    payload.deleteText = 'Are you sure you want to remove this member?';

    payload.toast = false
    payload.toastColor = 'green'
    payload.toastText = ''

    payload.permissionModules = ModulesArrayData;

    const productTypes = await ProductType.findAll({});
    // console.log('\n\nTeams - viewTeamDetails - productTypes :-', productTypes);
    payload.productTypes = productTypes

    const languages = await Language.findAll({});
    // console.log('\n\nTeams - viewTeamDetails - languages :-', languages);
    payload.languages = languages

    payload.datatable = {
      columns: AjaxColumns,
      apiUrl: apiUrl,
      id: id
    };

    res.render('admin/components/team/view_team_details', payload);
  })

};

const editTeamDetails = async (req, res) => {
  // console.log('\n\editTeamDetails - req.params :-', req.params);

  const { id } = req.params;
  const teams = await Teams.findOne({ where: { id }, include: [{ model: Location, as: 'location' }, { model: Users, as: 'teamLeader' }] });
  // console.log('\n\editTeamDetails - editTeamDetails :-', teams);
  const user = req.session.user;
  let query = {};

  const locations = await Location.findAll({});
  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  if (user.roleId == roles[AdminIndex].id) {
    query = { where: { roleId: roles[LeaderIndex].id, isDeleted: 0 }, raw: true }
  }
  else if (user.roleId == roles[LeaderIndex].id) {
    query = { where: { roleId: roles[LeaderIndex].id, id: user.id, isDeleted: 0 }, raw: true }
  }

  const users = await Users.findAll(query);
  const teamData = await Teams.findOne({
    where: { teamLeaderId: teams.teamLeaderId,isDeleted:0 },
    include: [{ model: Users, as: 'teamLeader' }],
  });
  // console.log('\n\nTeams - teamList - Edit Data :-', teamData);  

  //get location of leader
  // console.log('\n\n editTeamDetails - addTeam - users :-', users);

  for (const userdata of users) {
    // console.log('\n\n editTeamDetails - addTeam - userdata :-', userdata);

    const operLocations = await OperatingLocation.findAll({ where: { userId: userdata.id}, include: [{ model: Location, as: 'location' }] } );

    // console.log('\n\n editTeamDetails - addTeam - operLocations :-', operLocations);

    var operArr = []
    for (const operLocation of operLocations) {
      operArr.push(operLocation.dataValues)
    }
    // console.log('\n\nTeams - addTeam - operArr :-', operArr);

    userdata.operLocations = operArr
  }
  // console.log('\n\nTeams - addTeam - after users :-', users);

  const payload = {};
  payload.teams = teams.dataValues;
  payload.teamData = teamData.teamLeader.dataValues;
  payload.users = users;
  payload.error = false;
  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  payload.locations = locations;
  payload.form = ''
  
  //get team list of selected team leader
  const memberTeamData = await Teams.findAll({
    where: { teamLeaderId: teams.teamLeaderId },
    include: [{ model: Users, as: 'teamLeader' }],
  });
  
  //get count of fos and telecallers
  for (const team of memberTeamData) {
    // console.log('\n\n editTeamDetails for getLeaderTeams :-', team);

    const members = await TeamMember.findAll({ where: { teamId: team.id }, include: [{ model: Users, as: 'user' }] });

    // console.log('\n\n editTeamDetails of team members:-', members);
    const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
    // console.log('\n\n editTeamDetails of team teleIndex:-', teleTeam.length);

    const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
    // console.log('\n\n editTeamDetails of team fosTeam:-', fosTeam.length);

    team.dataValues.teleCount = teleTeam.length
    team.dataValues.fosCount = fosTeam.length
  }
  // console.log('\n\n editTeamDetails for memberTeamData :-', memberTeamData);

  payload.memberTeams = memberTeamData;

  res.render('admin/components/team/edit_team', payload);
};

const updateTeamDetails = async (req, res) => {
  // console.log('\n\nUpdateTeamDetails :-', req.body);
  const { id } = req.params;
  const user = req.session.user;

  await Teams.update(req.body, { where: { id }, }).then((num) => {
    if (num == 1) {

      // res.redirect('/team');

      Teams.findByPk(id, {
        include: [
          {
            model: Users,
            as: 'teamLeader'
          },
          {
            model: Users,
            as: 'users',
            attributes: [],
          },
          { model: Location, as: 'location' }
        ],
      }).then( async (team) => {

        //save trail
        var data = {
          userName: req.session.user.firstName + ' ' + req.session.user.lastName,
          userId: req.session.user.id,
          moduleName: "Teams",
          tableName: "Teams",
          action: "Edit",
          objectId: id,
          teamName: team.name
        }
        data.description = auditMsgs.getAuditMessage("updateTeamDetails", data)
        helper.saveAuditTrail(data, req);

        const AjaxColumns = [
          { 'title': 'First Name', 'data': 'firstName' },
          { 'title': 'Last Name', 'data': 'lastName' },
          { 'title': 'Role', 'data': 'role' },
          { 'title': 'Location', 'data': 'location' },
          { 'title': 'Address', 'data': 'address' },
          { 'title': 'Actions', 'data': 'actions' },
        ];

        const apiUrl = 'team/teamDetails';

        let payload = {};

        payload.url = 'team';
        payload.permissionsList = req.permissionsList;
        payload.team = team;
        payload.deleteText = 'Are you sure you want to remove this member?';

        payload.toast = true
        payload.toastColor = 'green'
        payload.toastText = 'Team edited successfully'

        payload.datatable = {
          columns: AjaxColumns,
          apiUrl: apiUrl,
          id: id
        };

        const roles = await Roles.findAll();
        const AdminIndex = roles.findIndex((e) => e.name === 'admin');
        const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
        const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
        const FOSIndex = roles.findIndex((e) => e.name === 'fos');

        if (user.roleId == roles[AdminIndex].id) {
          query = { where: { roleId: roles[LeaderIndex].id, isDeleted: 0 }, raw: true }
        }
        else if (user.roleId == roles[LeaderIndex].id) {
          query = { where: { roleId: roles[LeaderIndex].id, id: user.id, isDeleted: 0 }, raw: true }
        }

        const users = await Users.findAll(query);
        const teamData = await Teams.findOne({
          where: { teamLeaderId: team.teamLeaderId },
          include: [{ model: Users, as: 'teamLeader' }],
        });

        const locations = await Location.findAll({});

        // console.log('\n\nTeams - teamList - update Data :-', teamData);
        payload.teams = team.dataValues;
        payload.teamData = teamData.teamLeader.dataValues;
        payload.users = users;
        payload.error = false;
        payload.locations = locations;

        //get team list of selected team leader
        const memberTeamData = await Teams.findAll({
          where: { teamLeaderId: team.teamLeaderId },
          include: [{ model: Users, as: 'teamLeader' }],
        });
        
        //get count of fos and telecallers
        for (const team of memberTeamData) {
          // console.log('\n\n editTeamDetails for getLeaderTeams :-', team);

          const members = await TeamMember.findAll({ where: { teamId: team.id }, include: [{ model: Users, as: 'user' }] });

          // console.log('\n\n editTeamDetails of team members:-', members);
          const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
          // console.log('\n\n editTeamDetails of team teleIndex:-', teleTeam.length);

          const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
          // console.log('\n\n editTeamDetails of team fosTeam:-', fosTeam.length);

          team.dataValues.teleCount = teleTeam.length
          team.dataValues.fosCount = fosTeam.length
        }
        // console.log('\n\n editTeamDetails for memberTeamData :-', memberTeamData);

        payload.memberTeams = memberTeamData;

        // res.render('admin/components/team/view_team_details', payload);
        res.render('admin/components/team/edit_team', payload);
      })

    } else {
      res.send({
        message: `Cannot update Contact with id=${id}. Maybe Contact was not found or req.body is empty!`,
      });
    }
  })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Contacts.',
      });
    });
};

const teamDetails = async (req, res) => {

  // console.log('\n\nTeams - teamDetails - BODY :-', req.body.id);

  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = {isDeleted:0}; 

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${req.body.search.value}%` } },
        { lastName: { [Op.like]: `%${req.body.search.value}%` } },
        { role: { [Op.like]: `%${req.body.search.value}%` } },
      ]
    }
  }

  const team = await Teams.findOne({ where: { id: req.body.id } });
  const teamUsers = await team.getUsers({ limit: length, offset: start, where: searchQuery });
  const teamUsersCount = await Teams.findAndCountAll({ where: { id: req.body.id }, include: [{ model: Users, as: 'users', where: searchQuery, }] });

  //teamUsers.forEach(async user => {
  for (const user of teamUsers) {
    // console.log('\n\nTeams - teamDetails user :-', user);

    let actions = '';

    // const leadsAssigned = await Leads.findAll({ where: { telecallerAssigned: user.id } });
    // console.log('\n\nTeams - leadsAssigned :-', leadsAssigned.length);

    const leadData = await Leads.findOne({
      where: { telecallerAssigned: user.id }
    });
    // console.log('\n\nTeams - teamDetails leadData :-', leadData);

    if (req.permissionsList.includes('view')) {
    //  actions = `<a href="#userDetailsModal" class='modal-trigger dt-action text-capitalize pointer' onclick="getUserDetail('team/viewUserDetails', ${user.id}, ${team.dataValues.id})"><b>View</b></a>`;  
      actions += `<a onclick="getUserDetail('team/viewUserDetails', ${user.id}, ${team.dataValues.id})" href="#userDetailsModal" class='modal-trigger dt-action text-capitalize pointer' data-id='${user.id}'><b>View</b></a>`;  
    }
    if (req.permissionsList.includes('delete')) {
      if (leadData) {
        console.log('\n\nTeams - teamDetails leadData inside');
        actions = actions + `<b>Remove</b>`;
      }
      else {
        actions = actions + `<a href="#confirmModal" class='modal-trigger dt-action text-capitalize pointer' onclick="action('team/deleteFromTeam', ${user.id}, ${team.dataValues.id})"><b>Remove</b></a>`;
      }
    }
    user.dataValues.actions = actions;

    console.log('roles --- ', roles);
    console.log('user.dataValues --- ', user.dataValues);
    console.log('TelecallerIndex --- ', TelecallerIndex);
    console.log('FOSIndex --- ', FOSIndex);
    console.log('user.dataValues.roleId --- ', user.dataValues.roleId);

    if (user.dataValues.roleId == roles[TelecallerIndex].id) user.dataValues.role = 'telecaller';
    if (user.dataValues.roleId == roles[FOSIndex].id) user.dataValues.role = 'fos';

  //  user.dataValues.leadsAssigned = leadsAssigned.length
  };
  
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: teamUsers,
    recordsFiltered: teamUsersCount.count,
    recordsTotal: teamUsersCount.count
  });
}

// Delete Team
const deleteTeam = async (req, res) => {

  // console.log('\n\nTeams - deleteTeam - BODY :-', req.body);
  const { teamId } = req.body;

  const team = await Teams.findOne({ where: { id: teamId } });

  var auditFlag = "deactivateTeam"
  var isDeleted = 1
  if (team.isDeleted == 1) {
    isDeleted = 0
    auditFlag = "activateTeam"
  }
  await Teams.update({ isDeleted: isDeleted }, { where: { id: teamId } });
  
  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Teams",
    tableName: "Teams",
    action: "Delete",
    objectId: teamId,
    teamName: team.name
  }
  data.description = auditMsgs.getAuditMessage(auditFlag, data)
  helper.saveAuditTrail(data, req);

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });

};

// Delete Member From Team
const deleteFromTeam = async (req, res) => {

  const { teamId, userId } = req.body;

  // console.log(`\n\nTeams - deleteFromTeam - userId :- ${userId}`);
  // console.log(`\n\nTeams - deleteFromTeam - teamId :- ${req.body.teamId}`);

  const team = await Teams.findOne({ where: { id: teamId } });
  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Teams",
    tableName: "Team Members",
    action: "Delete",
    objectId: teamId,
    teamName: team.name
  }
  data.description = auditMsgs.getAuditMessage("deleteFromTeam", data)
  helper.saveAuditTrail(data, req);

  Users.findByPk(userId).then(async (user) => {
    if (!user) {
      // console.log('\n\nUser not found!');
      return null;
    }
    Teams.findByPk(teamId).then(async (team) => {
      if (!team) {
        // console.log('\n\nTeams not found!');
        return null;
      }

      // console.log(`\n\nTeams - deleteFromTeam - TEAM :- ${JSON.stringify(team, null, 2)}`);

      await user.removeTeam(team);

      return res.status(200).json({
        title: 'Success',
        error: false,
        message: 'User removed from team successfully'
      });

    });
  }).catch((err) => {
    // console.log('\n\nError while REMOVING Teams to User: ', err);
  });

};

// Add a Team Member - Page
const addNewMembers = async (req, res) => {

  const { id } = req.params;

  const team = await Teams.findOne({ where: { id }, raw: true });

  const AjaxColumns = [
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Role', 'data': 'role' },
    { 'title': 'Address', 'data': 'address' },
    { 'title': 'Location', 'data': 'location' },
    { 'title': 'Actions', 'data': 'actions' },
  ];

  const apiUrl = 'team/addNewMembersList';

  const productTypes = await ProductType.findAll({});

  let payload = {};

  payload.url = 'team';
  payload.permissionsList = req.permissionsList;
  payload.team = team;
  payload.deleteText = 'Are you sure you want to remove this member?';
  
  // console.log('\n\nTeams - addNewMembers - productTypes :-', productTypes);

  payload.productTypes = productTypes

  payload.datatable = {
    columns: AjaxColumns,
    apiUrl: apiUrl,
    id: id
  };

  res.render('admin/components/team/add_new_members', payload);
};

const addNewMembersList = async (req, res) => {
  console.log('\n\nTeams - addNewMembersList - BODY :-', req.body.id);
  let teamId = req.body.id;
  const roles = await Roles.findAll();
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  //get team
  const team = await Teams.findOne({ where: { id: teamId }, include: [{ model: Location, as: 'location' }] });
  // const usrQry = `SELECT * FROM users U WHERE (U.isDeleted != 1 AND ${team.location.id} IN (SELECT locationId FROM operatingLocations T WHERE T.userId=U.id) AND U.roleId = '${roles[TelecallerIndex].id}' OR U.roleId = '${roles[FOSIndex].id}' AND U.id NOT IN (SELECT userId FROM teamMembers T GROUP BY userId))`;
  const usrQry =`SELECT * FROM users U
  WHERE (U.id NOT IN (SELECT userId FROM teamMembers T GROUP BY userId) AND U.isDeleted != 1 AND (U.roleId = '${roles[TelecallerIndex].id}' OR U.roleId = '${roles[FOSIndex].id}'))`;
  console.log("usrQry"+ usrQry);
  const sqlFilteredUsers = await db.sequelize.query(usrQry, { type: Sequelize.QueryTypes.SELECT });
  console.log('\n\nteam - addNewMembersList - sqlFilteredUsers :-', sqlFilteredUsers);
  for (const user of sqlFilteredUsers) {

    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions = `<a class='dt-action text-capitalize' href='/user/view/${user.id}'><b>View</b></a>`;
    }
    if (req.permissionsList.includes('add')) {
      actions = actions + `<a class='dt-action text-capitalize pointer' href onclick="action('team/addToTeam', ${user.id}, ${teamId})"><b>Add</b></a>`;
    }
    user.actions = actions;

    if (user.roleId == roles[TelecallerIndex].id) user.role = 'telecaller';
    if (user.roleId == roles[FOSIndex].id) user.role = 'fos';

    const userExp = await UserExperience.findAll({
      where: { userId: user.id }
    });

    user.userExp = userExp
  }; 

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: sqlFilteredUsers,
  });
}

const addNewMembersListOld = async (req, res) => {

  // console.log('\n\nTeams - addNewMembersList - BODY :-', req.body.id);
  let teamId = req.body.id;
  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${req.body.search.value}%` } },
        { lastName: { [Op.like]: `%${req.body.search.value}%` } },
      ]
    }
  }

  // const sqlFilteredUsers = await db.sequelize.query("SELECT * FROM users U WHERE (U.role != 'admin' AND U.role != 'leader' AND U.id NOT IN (SELECT userId FROM teamMembers T WHERE T.teamId=" + teamId + ")) ", { type: Sequelize.QueryTypes.SELECT });
  // const sqlFilteredUsers = await db.sequelize.query("SELECT COUNT(*) FROM users U WHERE (U.role != 'admin' AND U.role != 'leader' AND U.id NOT IN (SELECT userId FROM teamMembers T WHERE T.teamId=" + teamId + ")) LIMIT 5", { type: Sequelize.QueryTypes.SELECT });

  const sqlFilteredUsers = await db.sequelize.query(`SELECT * FROM users U WHERE (U.firstName LIKE '%${req.body.search.value}%' AND U.isDeleted != 1 AND U.roleId != '${roles[AdminIndex].id}' AND U.roleId != '${roles[LeaderIndex].id}' AND U.id NOT IN (SELECT userId FROM teamMembers T WHERE T.teamId="${teamId}")) LIMIT ${length} OFFSET ${start}`, { type: Sequelize.QueryTypes.SELECT });

  const sqlCountUsers = await db.sequelize.query(`SELECT COUNT(*) FROM users U WHERE (U.isDeleted != 1 AND U.roleId != '${roles[AdminIndex].id}' AND U.roleId != '${roles[LeaderIndex].id}' AND U.id NOT IN (SELECT userId FROM teamMembers T WHERE T.teamId=" + teamId + "))`, { type: Sequelize.QueryTypes.SELECT });
  const recordsCount = sqlCountUsers[0]['COUNT(*)'];

  // console.log('\n\nteam - addNewMembersList - sqlFilteredUsers :-', sqlFilteredUsers);
  // console.log('\n\nteam - addNewMembersList - recordsCount :-', recordsCount);

  sqlFilteredUsers.forEach(user => {

    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions = `<a class='dt-action text-capitalize' href='/user/view/${user.id}'><b>View</b></a>`;
    }
    if (req.permissionsList.includes('add')) {
      actions = actions + `<a class='dt-action text-capitalize pointer' href onclick="action('team/addToTeam', ${user.id}, ${teamId})"><b>Add</b></a>`;
    }
    user.actions = actions;

    if (user.roleId == roles[TelecallerIndex].id) user.role = 'telecaller'
    if (user.roleId == roles[FOSIndex].id) user.role = 'fos'

  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: sqlFilteredUsers,
    recordsFiltered: recordsCount,
    recordsTotal: recordsCount
  });

}

const addToTeamOld = async (req, res) => {

  // console.log('\n\nADD TO TEAM', req.body);

  const { teamId, userId } = req.body;

  await userCrtl.addTeam(userId, teamId);

  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

const addToTeam = async (req, res) => {

  // console.log('\n\nADD TO TEAM', req.body);

  const teamId = req.body.teamId;
  const members = req.body.members;

  for (const userId of members) {
    await userCrtl.addTeam(userId, teamId);
  }

  const team = await Teams.findOne({ where: { id: teamId } });
  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Teams",
    tableName: "Team Members",
    action: "Add",
    objectId: teamId,
    teamName: team.name,
    memberCount: members.length
  }
  data.description = auditMsgs.getAuditMessage("addToTeam", data)
  helper.saveAuditTrail(data, req);
  
  var payload = {}
  payload.toastText = 'Members added successfully'
  return res.status(200).json({
    title: 'Members added successfully',
    error: false,
    data: payload
  });
};

// User Details - Page 
const viewUserDetails = async (req, res) => {
  // console.log(`\n\nTeams - viewUserDetails - req.body :- ${req.body}`);

  const { teamId, userId } = req.body;

  // console.log(`\n\nTeams - viewUserDetails - userId :- ${userId}`);
  // console.log(`\n\nTeams - viewUserDetails - teamId :- ${req.body.teamId}`);

  const user = await Users.findOne({ where: { id: userId } });

  user.dataValues.createdAt = moment(user.dataValues.createdAt).format('YYYY-MM-DD HH:MM');

  let whereQuery = {};
  const campaignMembers = await CampaignMembers.findAll({ where: { userId: userId } });

  whereQuery[Op.or] = [];

  campaignMembers.forEach(campaign => {
    whereQuery[Op.or].push({ id: campaign.dataValues.campaignId });
  })

  const campaigns = await Campaign.findAll({ where: whereQuery, raw: true });
  const allCampaigns = await Campaign.findAll({ raw: true });
  const role = await Roles.findOne({ where: { id: user.roleId } });

  const Module = await Modules.findAll({
    attributes: ['id', 'name', 'actions'],
    raw: true,
  });

  const ModulesArray = [];

  const team = await Teams.findOne({ where: { id: teamId } });
  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Teams",
    tableName: "User Details",
    action: "View",
    objectId: teamId,
    teamName: team.name,
    memberName: user.firstName + ' ' + user.lastName,
  }
  data.description = auditMsgs.getAuditMessage("viewUserDetails", data)
  helper.saveAuditTrail(data, req);  

  await Promise.all(Module.map(async (module) => {
    let checkAction = false;
    const PermissionCheck = await RoleModules.findOne({
      where: { roleId: user.roleId, moduleId: module.id },
      raw: true,
    });
    // console.log('\n\nModules - PermissionCheck :-', PermissionCheck);
    if (PermissionCheck && PermissionCheck !== null) {
      checkAction = true;
    }
    let contains = false;
    if (ModulesArray.length === 0) {
      ModulesArray.push({
        module: module.name,
        actions: [
          {
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          },
        ],
      });
    } else {
      ModulesArray.map((val) => {
        if (val.module === module.name) {
          contains = true;
          val.actions.push({
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          });
        }
      });
      if (!contains) {
        ModulesArray.push({
          module: module.name,
          actions: [
            {
              id: module.id,
              name: module.actions,
              isCheck: checkAction,
            },
          ],
        });
      }
    }
  }));

  const ModulesArrayData = ModulesArray;
  // console.log('\n\nModules - ModulesArrayData :-', JSON.stringify(ModulesArrayData));

  const payload = {};
  payload.user = user.dataValues;
  payload.campaigns = campaigns;
  payload.allCampaigns = allCampaigns;
  payload.role = role;
  payload.permissionModules = ModulesArrayData;

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  // console.log('\n\nCampaign - CampaignList - campaigns :-', campaigns);

  //get "Total leads assigned"
  const roles = await Roles.findAll();
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  let leadQuery = {};
  if(user.roleId ==  roles[TelecallerIndex].id) {
    leadQuery.telecallerAssigned = user.id;
  }
  if(user.roleId ==  roles[FOSIndex].id) {
    leadQuery.FOSAssigned = user.id;
  }
  const leads = await Leads.findAndCountAll({ where: leadQuery });
  payload.totalLeads = leads.count


  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
    message: 'User details'
  });

};

// To get teams of leader - Page 
const getLeaderTeams = async (req, res) => {
  // console.log('\n\nCampaign - getLeaderTeams:-');
  // console.log(`\n\nTeams - getLeaderTeams - req.body :- ${req.body.teamLeaderId}`);

  const { teamLeaderId } = req.body;

  //get team list of selected team leader
  const teamData = await Teams.findAll({
    where: { teamLeaderId: teamLeaderId ,isDeleted: 0},
    include: [{ model: Users, as: 'teamLeader' }],
  });

  const payload = {};
  
  const roles = await Roles.findAll();
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');
  
  //get count of fos and telecallers
  for (const team of teamData) {
    // console.log('\n\n Teams for getLeaderTeams :-', team);

    const members = await TeamMember.findAll({ where: { teamId: team.id }, include: [{ model: Users, as: 'user' }] });

    // console.log('\n\nteam of team members:-', members);
    const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
    // console.log('\n\nteam of team teleIndex:-', teleTeam.length);

    const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
    // console.log('\n\nteam of team fosTeam:-', fosTeam.length);

    team.dataValues.teleCount = teleTeam.length
    team.dataValues.fosCount = fosTeam.length
  }
  payload.teams = teamData;

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
    message: 'Team details'
  });
}

// To get team members
const getTeamMembers = async (req, res) => {
  // console.log('\n\n getTeamMembers:-', req.body);

  const { teamId } = req.body;

  const members = await TeamMember.findAll({ where: { teamId: teamId }, include: [{ model: Users, as: 'user' }] });

  const payload = {};
  payload.members = members;

  // Telecallers
  const AjaxColumnsAddTelecallers = [
    // { 'title': '', 'data': 'checkbox' },
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Address', 'data': 'address' },
    { 'title': 'Location', 'data': 'location' },
  ];
  const apiUrlAddTelecallers = 'campaign/campaignAddTelecallers';
  
  payload.datatableAddTelecallers = {
    id: req.params.id,
    columns: AjaxColumnsAddTelecallers,
    apiUrl: apiUrlAddTelecallers
  };

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
    message: 'Team details'
  });
}

module.exports = {
  list,
  teamList,
  addTeam,
  createTeam,
  deleteTeam,
  viewTeamDetails,
  editTeamDetails,
  updateTeamDetails,
  teamDetails,
  addNewMembers,
  addToTeam,
  deleteFromTeam,
  addNewMembersList,
  viewUserDetails,
  getLeaderTeams,
  getTeamMembers
};