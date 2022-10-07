// eslint-disable linebreak-style
// eslint-disable no-console
// eslint-disable linebreak-style

// NODE MODULES
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { validationResult } = require('express-validator');
const moment = require('moment');
const nodeGeocoder = require('node-geocoder');
const auditMsgs = require('../helper/auditMsgs');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// UTILITIES
const email = require('../utils/email');
const helper = require('../helper/helper');
const uploadHandler = require('../utils/upload');
// DATABASE
const db = require('../models');
const Op = db.Sequelize.Op;
const Users = db.users;
const Teams = db.teams;
const Roles = db.roles;
const UserExperience=db.userExperience;
const CampaignMembers = db.campaignMembers;
const Campaign = db.campaign;
const Modules = db.modules;
const RoleModules = db.rolesModules;
const teamMember=db.teamMembers;
const DPD = db.dpd;
const ProductType = db.productType;
const Location = db.locations;
const OperatingLocation =db.operatingLocations;
const Language = db.language;
const Pincodes = db.pincodes;
const ServiceablePincode=db.serviceablePincode;

/*
# parameters: email, password
# purpose: login for web app
*/
const login = async (req, res) => {
  let error = false;
  
  if (req.body.email) {
    const { email, password } = req.body;
    if (email && password) {
      const user = await Users.findOne({ where: { email : email } });
      if (user != null) {
      if(user.dataValues.roleId !=7){
        const user = await Users.findOne({ where: { email : email ,isDeleted : 0 } });
        if(user==null){
          error = 'User is deactivated, Please contact Admin!';
          const payload = {};
          payload.title = 'Clxns: Login';
          payload.error = error;
          payload.toast = false;
          payload.toastColor = 'green'
          payload.toastText = ''
          res.render('login', payload);
        }
        const roleName = await Roles.findOne({ where: { id:user.roleId} });
        const role = await Roles.findOne({ where: { id:user.roleId , status:'active'} });
        
            if(role==null){
              error = 'User permissions denied !';
              const payload = {};
              payload.title = 'Clxns: Login';
              payload.error = error;
              payload.toast = false;
              payload.toastColor = 'green'
              payload.toastText = ''
              res.render('login', payload);
            }
          if (bcrypt.compareSync(req.body.password, user.dataValues.password)) {
            req.session.permissions = await helper.getPermissions(user, req);
           
            req.session.loggedin = true;
            req.session.email = user.email;
            req.session.user_id = user.id;
            req.session.user = user;
            req.session.roleName = roleName;
            res.redirect('/dashboard');
          } else if (
            !bcrypt.compareSync(req.body.password, user.dataValues.password)
          ) {
            error = 'Incorrect username or password';
          }
      }else{
        error = 'Fos user can`t be login';
      }
      } else {
        error = 'User Not found';
      }
    } else {
      error = 'Please enter Username and Password!';
    }
  }
  const payload = {};
  payload.toast = false;
  payload.toastColor = 'green'
  payload.toastText = ''
  payload.title = 'Clxns: Login';
  payload.error = error;
  res.render('login', payload);
};

/*
# purpose: User Logout
*/ 
const logout = async (req, res) => {
  
  req.session.destroy(() => {
    // cannot access session here
    res.redirect('/user/login');
  });
};

/*
# purpose: Forgot Password 
*/ 
const forgotPassword = async (req, res) => {
  // console.log('\n\n\nFORGOT PASSWORD :-', req.body);
  const payload = {};

  if (req.body.email) {
    // const { email } = req.body;
    const user = await Users.findOne({ where: { email: req.body.email } });

    if (user != null) {
     
      const tempCode = Math.random().toString(36).substring(2, 7);
      const mailData = {
        email: req.body.email,
        subject: 'CLXNS - User Forgot Password!',
        body:
          '<p>'
          + 'Dear user'
          + '<p>'
          + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
          + '<p>'
          + `${process.env.baseUrl}user/resetPassword?code=${tempCode}\n\n`
          + `<br>`
          + '<p>'
          + 'Regards,'
          + '<br>'
          + 'Team CLXNS',
      };
    
      email.sendEmail(mailData);
      const updateUser = await Users.update(
        { tempCode },
        { where: { email: req.body.email } },
      );
     
      payload.toast = true
      payload.toastColor = 'green'
      payload.toastText = 'A reset password link has been sent on your email'
      res.render('admin/components/user/forgot_password', payload);
    } else {
      payload.toast = true
      payload.toastColor = 'red'
      payload.toastText = 'User not found'
      res.render('admin/components/user/forgot_password', payload);
    }
  }
  else {

    payload.toast = false
    payload.toastColor = 'red'
    payload.toastText = 'please enter your email'
    res.render('admin/components/user/forgot_password', payload);

  }
};


/*
# purpose:  Reset Password 
*/
const resetPassword = async (req, res) => {
  if (req.body.password) {
    const tempcode = req.body.tempCode;
    const encryptPssowrd = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    const updateUser = await Users.update(
      { password: encryptPssowrd },
      { where: { tempCode: tempcode } },
    );
    res.redirect('/user/login');
  } else {
    res.render('reset_password', { title: 'Clxns' });
  }
};

/*
# purpose:  List Users - Page
*/

const list = async (req, res) => {

  const users = await Users.findAndCountAll({ where: { isDeleted: 0 } });
  const usersCount = await Users.findAndCountAll({ where: { isDeleted: 0 } ,include: [{ model: Roles, as: 'roles' }]});
  let noOfTelecaller=0;
  let noOfFOS=0;
  let noOfTeamLeader=0;
  usersCount.rows.forEach((user)=>{
   
   if( user.roles.name=='telecaller'){
    noOfTelecaller++;
   }
   if( user.roles.name=='fos'){
    noOfFOS++;
   }
   if( user.roles.name=='team_leader'){
    noOfTeamLeader++;
   }
   
  });

  const AjaxColumns = [
    // { 'title': '', 'data': 'checkbox' },
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Employee ID', 'data': 'employeeId' },
    { 'title': 'Email', 'data': 'email' },
    { 'title': 'Role', 'data': 'roleId' },
    { 'title': 'Team Name', 'data': 'teamName' }, 
    { 'title': 'User Status', 'data': 'isUserStatus' },
    { 'title': 'Actions', 'data': 'actions' }
  ];

  const apiUrl = 'user/userlist';

  let payload = {};

  payload.url = 'users';
  payload.pageHeading = 'User Manager';
  payload.totalCount = `Total Users: ${users.count}`;
  payload.addUrl = 'user/addUser';
  payload.addButtonName = 'Add User';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to change status of this user?';

  payload.noOfTelecaller=noOfTelecaller;
  payload.noOfFOS=noOfFOS;
  payload.noOfTeamLeader=noOfTeamLeader;

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  if(req.session.toastTxt!=undefined && req.session.toastTxt!=null && req.session.toastTxt!=''){
    payload.toast = true
    payload.toastColor = 'green'
    payload.toastText = req.session.toastTxt;
    req.session.toastTxt=null;
  }
  const locations = await Location.findAll({});
  const languages = await Language.findAll({});

  payload.msg=req.flash('success');

  payload.datatable = {
    filter: 'users',
    columns: AjaxColumns,
    apiUrl: apiUrl,
    locations: locations,
    languages: languages
  };

  res.render('admin/main_list', payload);

};

/*
# purpose:  List Users - send data to datatables
*/
const userlist = async (req, res) => {

  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let whereQuery = {};
  var whereSelect = '(U.isDeleted != 1 OR U.isDeleted != 0)';
  if (req.body.filterObj && req.body.filterObj.name) {

    whereQuery[Op.or] = [
      { firstName: { [Op.like]: `%${req.body.filterObj.name}%` } },
      { lastName: { [Op.like]: `%${req.body.filterObj.name}%` } }
    ]
    whereSelect = whereSelect + ` AND (CONCAT(U.firstName, ' ', U.lastName) LIKE '%${req.body.filterObj.name}%')`
    
  }
  if (req.body.filterObj && req.body.filterObj.email) {
   
    whereSelect = whereSelect + ` AND U.email LIKE '%${req.body.filterObj.email}%'`
  }
  if (req.body.filterObj && req.body.filterObj.age) {
    whereSelect = whereSelect + ' AND (YEAR(NOW()) - YEAR(`dob`)) BETWEEN ' + req.body.filterObj.age[0] + ' AND ' + req.body.filterObj.age[1]//` AND U.email LIKE '%${req.body.filterObj.email}%'`
  }
  if (req.body.filterObj && req.body.filterObj.location) {
    
    var locaArr = "("
    req.body.filterObj.location.forEach(function(loc,i){
      
      if (i == req.body.filterObj.location.length - 1) {
        locaArr = locaArr + "'" + loc + "'"
        whereSelect = whereSelect + ` AND ${loc} IN (SELECT locationId FROM operatingLocations T WHERE T.userId=U.id) `
      }
      else {
        locaArr = locaArr + "'" + loc + "'" + ", "
        whereSelect = whereSelect + ` AND ${loc} IN (SELECT locationId FROM operatingLocations T WHERE T.userId=U.id) `
      }
      
    })
    locaArr = locaArr + ")"
  }
  if (req.body.filterObj && req.body.filterObj.language) {
    var langQuery = {}
    langQuery[Op.or] = []
    var langQuery = ""

    req.body.filterObj.language.forEach(function(lang,i){
      if (i == req.body.filterObj.language.length - 1) {
        langQuery = langQuery + `U.language LIKE '%${lang}%'`
      }
      else {
        langQuery = langQuery + `U.language LIKE '%${lang}%' OR `
      }
    })
    whereSelect = whereSelect + ` AND (${langQuery})`
  }
  if (req.body.filterObj && req.body.filterObj.experience) {
    
    var experience = req.body.filterObj.experience
    var exp = []
    if (experience == '1') {
      exp = [0, 3]

      
      whereSelect = whereSelect + ` AND (U.experience >= 0 AND U.experience < 3)`
    }
    if (experience == '2') {
      exp = [3, 9]

      
      whereSelect = whereSelect + ` AND (U.experience >= 3 AND U.experience < 6)`
    }
    if (experience == '3') {
      exp = [6, 12]
      
      whereSelect = whereSelect + ` AND (U.experience >= 6 AND U.experience < 12)`
    }
    if (experience == '4') {
      exp = [12, 36]

      
      whereSelect = whereSelect + ` AND (U.experience >= 12 AND U.experience < 36)`
    }
    if (experience == '5') {
      exp = [36, 60]

      
      whereSelect = whereSelect + ` AND (U.experience >= 36 AND U.lastName < 60)`
    }
    if (experience == '6') {
      exp = [60, 120]

      
      whereSelect = whereSelect + ` AND (U.experience >= 60 AND U.experience < 120)`
    }
    if (experience == '7') {
      exp = [120, 100000]

      
      whereSelect = whereSelect + ` AND (U.experience >= 120 AND U.experience < 100000)`
    }
 
  }

  let loginUserRoleId=   req.session.user.roleId;
  const role = await Roles.findOne({ where: { id:loginUserRoleId , status:'active'} });
  
  var cur = new Date(moment(new Date()).format('YYYY-MM-DD'))

  var selectQuery = `SELECT *,T.name as teamName,roles.name as roleName, U.id as id,U.isDeleted as isDeleted FROM users as U
   INNER JOIN roles ON U.roleId = roles.id
   LEFT JOIN teamMembers as TM ON TM.userId=U.id
   LEFT JOIN teams as T ON TM.teamId=T.id
   WHERE ` + whereSelect +` GROUP BY U.id ORDER BY U.id DESC `+ ` LIMIT `+ length + ` OFFSET ` + start//`SELECT *,roles.name as roleName, dob as ageDob FROM users U INNER JOIN roles ON U.roleId = roles.id WHERE ${whereSelect}`
  
  const users = await db.sequelize.query(selectQuery, { type: Sequelize.QueryTypes.SELECT })

  console.log("User List :",users);

  var countQuery = 'SELECT count(*) FROM users U WHERE ' + whereSelect
  const usersCount = await db.sequelize.query(countQuery, { type: Sequelize.QueryTypes.SELECT })
  for (const user of users) {
 
    let roleId = user.roleId;
    let status=user.isDeleted;
    let actions = '';

    // if (req.permissionsList.includes('view')) {
    //   actions = `<a class='dt-action text-capitalize' href='user/view/${user.id}'><b>View</b></a>`;
    // }

    // if (req.permissionsList.includes('view') && req.permissionsList.includes('edit') && req.permissionsList.includes('delete')) {
    //   actions = `<a class='dt-action text-capitalize' href='permissions/roles/view/${roleId}'><b>View Permissions</b></a>`;
    // }

  if (req.permissionsList.includes('edit') && role.name=='admin') {
    actions = actions + `<a class='dt-action text-capitalize' href='user/edit/${user.id}'><b>Edit</b></a>`;
  }
  
  if(user.level>=role.level){
    if(user && user.isDeleted==0 ){
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to deactivate this user?" onclick="action('user/delete', ${user.id}, '${status}')"><b>Deactivate</b></a>`;
    }
    else {
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to activate this user?" onclick="action('user/delete', ${user.id}, '${status}')"><b>Activate</b></a>`;
    }
  }
  

  if(user.isEmailVerified==0){
    user.isverifyEmail = 'Pending';
  }else{
    user.isverifyEmail = 'Verified';
  }

  if(user.isDeleted==0){
    user.isUserStatus = 'Active';
  }else{
    user.isUserStatus = 'Inactive';
  }

    user.checkbox = `<label><input type='checkbox' onchange='checkboxFunc(${user.id})'/><span></span></label>`
    user.actions = actions;
    user.roleId = user.roleName.replace('_',' ');
    user.teamName =user.teamName ? user.teamName.replace('_',' ') : 'N/A';
  };
  
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: users,
    recordsFiltered: (usersCount && usersCount.length > 0) ? usersCount[0]['count(*)']: 0,
    recordsTotal: (usersCount && usersCount.length > 0) ? usersCount[0]['count(*)']: 0
  });

};

/*
# purpose:  view User Details - Page
*/
const viewUserDetails = async (req, res) => {

  const { id } = req.params;

  const user = await Users.findOne({ where: { id } });

  let whereQuery = {};
  const campaignMembers = await CampaignMembers.findAll({ where: { userId: id } });

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

  await Promise.all(Module.map(async (module) => {
    let checkAction = false;
    const PermissionCheck = await RoleModules.findOne({
      where: { roleId: user.roleId, moduleId: module.id },
      raw: true,
    });
   
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
  

  const payload = {};
  payload.user = user.dataValues;
  payload.campaigns = campaigns;
  payload.allCampaigns = allCampaigns;
  payload.role = role;
  payload.permissionModules = ModulesArrayData;

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''


  res.render('admin/components/user/view_user_details_new', payload);

};

/*
# purpose:  check User Exit or Not
*/
const checkUserExit = async (req, res) => {
  
  let query = {};
  if (req.body.email && req.body.email != '') {
    query = { email: req.body.email.trim().toLowerCase() };
  }
  if (req.body.phone && req.body.phone != '') {
    query = { phone: req.body.phone.trim() };
  }
  if (req.body.employeeId && req.body.employeeId != '') {
    query = { employeeId: req.body.employeeId.trim() };
  }
  const userData = await Users.findOne({ where: query });

  if (userData && req.body.id) {
    
    if (userData && userData.dataValues && userData.dataValues.id == req.body.id) {
      
      return res.status(200).json(true);
    }
    return res.status(200).json(false);
  }
  if (userData && !req.body.id) {
    return res.status(200).json(false);
  }
  return res.status(200).json(true);
};
 
/*
# purpose: to Add User page
*/
const addUser = async (req, res) => {

  const roles = await Roles.findAll({});
  const locations = await Location.findAll({});
  const dpds = await DPD.findAll({});
  const productTypes = await ProductType.findAll({});
  const languages = await Language.findAll({});
  const payload = {};
  payload.error = false;
  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  payload.roles = roles;
  payload.locations = locations;
  payload.languages=languages;
  payload.dpds = dpds;
  payload.productTypes = productTypes;
  payload.form = '';
  res.render('admin/components/user/add_user', payload);
};

/*
# purpose: to create User
*/
const createUser = async (req, res) => {

  let lang='';
  if(req.body.language){
    lang=req.body.language.join().toLowerCase();
  }
  const result = validationResult(req);


  if (result.errors.length > 0) {

    const roles = await Roles.findAll({});
    const locations = await Location.findAll({});
    const dpds = await DPD.findAll({});
    const productTypes = await ProductType.findAll({});
    const payload = {};
    payload.roles = roles;
    payload.locations = locations;
    payload.dpds = dpds;
    payload.productTypes = productTypes;
    payload.error = result.errors;
    payload.toast = false;
    payload.toastColor = '';
    payload.toastText = '';
    

    payload.form = req.body;

    return res.render('admin/components/user/add_user', payload);

  }
  let expInMonths='';
  if(req.body.year!='' && req.body.month==''){
    expInMonths=parseInt(req.body.year) * 12;
  }
  if(req.body.month!='' && req.body.year==''){
    expInMonths=parseInt(req.body.month);
  }
  if(req.body.year!='' && req.body.month!=''){
    expInMonths= parseInt(req.body.year) * 12 + parseInt(req.body.month);
  }

   
  const tempCode = Math.random().toString(36).substring(2, 7);
  const password = randomstring.generate(8);
  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  let fileType;
  let sampleFile;
  if(req.files!=null){
    fileType = req.files.profileImg.mimetype;
    sampleFile = req.files.profileImg;
  }

  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone,
    emergencyPhone: req.body.emergencyPhone,
    dob: moment(req.body.dob, "YYYY-MM-DD").format('YYYY-MM-DD'),
    roleId: req.body.roleId,
    reportingTo:req.body.reportingTo,
    location: req.body.location,
    employeeId: req.body.employeeId,
    bloodGroup:req.body.bloodGroup,
    address: req.body.address,
    profileImg:(req.files)?req.files.profileImg.name:'',
    language: req.body.language ?  lang: null,
    experience:expInMonths,
    pincode: req.body.pincode ? req.body.pincode : null,
    password: hash,
    tempCode:tempCode
  };
  
  if (req.body.address && req.body.pincode) {

    const options = {
      provider: 'google',
      httpAdapter: 'https',
      apiKey: process.env.googleApiKey,
      formatter: null
    };

    const geoCoder = nodeGeocoder(options);
    const geoRes = await geoCoder.geocode({ address: req.body.address, country: 'India', zipcode: req.body.pincode });

    if (geoRes != undefined && geoRes.length > 0) {
      newUser.latitude = parseFloat(geoRes[0].latitude);
      newUser.longitude = parseFloat(geoRes[0].longitude);
    } else {
      newUser.latitude = 0.0;
      newUser.longitude = 0.0;
    }

  }

  await Users.create(newUser);
  const User = await Users.findOne({where:{phone:newUser.phone}});
  let id = User.dataValues.id;
    //save trail
    var data = {
      userName:  req.session.user.firstName + ' ' + req.session.user.lastName,
      userId: req.session.user.id,
      moduleName: "Users",
      tableName: "Users",
      action: "Add",
      objectId: id,
      CreateUserName: User.firstName + ' ' + User.lastName,
    }
    data.description = auditMsgs.getAuditMessage("createUser", data)
    helper.saveAuditTrail(data, req);
 
  //Serviceable Pincode  
  if(req.body.pincodeId){
    let PincodeIds=req.body.pincodeId;
    let selectCity=req.body.city;
   if(typeof(PincodeIds)!='string'){
  await Promise.all(PincodeIds.map(async(PincodeId)=>{
  const newServiceablePincode={
    userId: User.id,
    pincode:PincodeId,
    city:selectCity
  };
  await ServiceablePincode.create(newServiceablePincode);
}));
}
}

/* User Experience start*/
  let ProductTypes=req.body.productType;
  let dpd=req.body.dpd;
  
  let i=0;
  if(typeof(ProductTypes)!='string'){
    await Promise.all(ProductTypes.map(async(ProductType)=>{
      const newUserExperience={
        userId: User.id,
        productType: ProductType,
        dpd: dpd[i],
      };
      i++;
     
      await UserExperience.create(newUserExperience);
    }));
  }else{
    const newUserExperience={
      userId: User.id,
      productType: ProductTypes,
      dpd: dpd,
    };
    await UserExperience.create(newUserExperience);
  }
/* User Experience end*/

  /* Operating Location start*/
  let LocationIds=req.body.locationId;
  
  if(typeof(LocationIds)!='string'){
  LocationIds.map((LocationId)=>{
  const newOperatingLocation={
    userId: User.id,
    locationId:LocationId,
  };
  OperatingLocation.create(newOperatingLocation);
});

}
/* Operating Location end*/

  const mailData = {
    email: req.body.email,
    subject: 'Welcome to CLXNS - Your account has been created successfully!',
    body:
      `${'<p>' + 'Hello '}${req.body.firstName},`
      + '<p>'
      + 'Your user account has been created successfully!'
      + '<p>'
      + `Email: ${req.body.email}<br>`
      + `Password: ${password}<p>`
      + `<br>`
      + 'Please click on the below link to verify your email.'
      + `<br>`
      + `${process.env.baseUrl}user/verifiedEmail?code=${tempCode}\n\n`
      + `<br>`
      + `<br>`
      + 'Regards,'
      + '<br>'
      + 'Team CLXNS',
  };

  email.sendEmail(mailData)
  const allCampaigns = await Campaign.findAll({ raw: true });
  const roles = await Roles.findAll({});
  const locations = await Location.findAll({});
  const productTypes = await ProductType.findAll({});
  const dpds = await DPD.findAll({});
  const payload = {};
  payload.user = req.body;
  payload.campaigns = [];
  payload.allCampaigns = allCampaigns;
  payload.form = '';
  payload.error = false;
  payload.roles = roles;
  payload.locations = locations;
  payload.productTypes = productTypes;
  payload.dpds = dpds;

  payload.toast = true
  payload.toastColor = 'green'
  payload.toastText = 'User created successfully'

//  res.render('admin/components/user/add_user', payload);

  //userlist redirection
  const users = await Users.findAndCountAll({ where: { isDeleted: 0 } });
  const usersCount = await Users.findAndCountAll({ where: { isDeleted: 0 } ,include: [{ model: Roles, as: 'roles' }]});
  let noOfTelecaller=0;
  let noOfFOS=0;
  let noOfTeamLeader=0;
  usersCount.rows.forEach((user)=>{
   
   if( user.roles.name=='telecaller'){
    noOfTelecaller++;
   }
   if( user.roles.name=='fos'){
    noOfFOS++;
   }
   if( user.roles.name=='team_leader'){
    noOfTeamLeader++;
   }
   
  });

  const AjaxColumnsList = [
    // { 'title': '', 'data': 'checkbox' },
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Email', 'data': 'email' },
    { 'title': 'Role', 'data': 'roleId' },
    { 'title': 'Email Status', 'data': 'isverifyEmail' }, 
    { 'title': 'User Status', 'data': 'isUserStatus' },
    { 'title': 'Actions', 'data': 'actions' }
  ];

  const apiUrlList = 'user/userlist';

  let payloadList = {};

  payloadList.url = 'users';
  payloadList.pageHeading = 'User Manager';
  payloadList.totalCount = `Total Users: ${users.count}`;
  payloadList.addUrl = 'user/addUser';
  payloadList.addButtonName = 'Add User';
  payloadList.permissionsList = req.permissionsList;
  payloadList.deleteText = 'Are you sure you want to change status of this user?';

  payloadList.noOfTelecaller=noOfTelecaller;
  payloadList.noOfFOS=noOfFOS;
  payloadList.noOfTeamLeader=noOfTeamLeader;

  payloadList.toast = true
  payloadList.toastColor = 'green'
  payloadList.toastText = 'User added successfully'

  const locationsList = await Location.findAll({});
  const languagesList = await Language.findAll({});

  payloadList.datatable = {
    filter: 'users',
    columns: AjaxColumnsList,
    apiUrl: apiUrlList,
    locations: locationsList,
    languages: languagesList
  };
  req.session.toastTxt='User added successfully';
  res.redirect('/user');
};
 
/*
# purpose: to Edit User Details - Page
*/
const editUserDetails = async (req, res) => {

  const { id } = req.params;
  let locationArray=[];
  const roles = await Roles.findAll({});
  const locations = await Location.findAll({});
  const dpds = await DPD.findAll({});
  const productTypes = await ProductType.findAll({});
  const OperatingLocations = await OperatingLocation.findAll({ where:{userId:id}});
  
  const UserExperiences = await UserExperience.findAll({ where:{userId:id}});
  
  const userData = await Users.findOne({
    where: { id: id },
    include: [{ model: Roles, as: 'roles' }],
  });

  

  const UserReportingTo = await Users.findOne({ where:{ id:userData.reportingTo}, include: [{ model: Roles, as: 'roles' }]});
  
  let UserServicePincode;
  let UserStateCity;
  let ServicePincode;
  if(userData.dataValues.roles.name=='fos'){ 
    UserServicePincode = await ServiceablePincode.findOne({ where:{ userId:userData.id}});
    if(UserServicePincode){
      UserStateCity = await Pincodes.findOne({ where:{ code:UserServicePincode.pincode,city:UserServicePincode.city}});
    
      ServicePincode = await ServiceablePincode.findAll({ where:{ userId:userData.id},raw:true});
    }
   }
  

  
  await Promise.all(OperatingLocations.map(async (OperatingLocation) => {
    locationArray.push(OperatingLocation.locationId);
  }));
  
  let newArrayLocations=[];
  await Promise.all(locations.map(async (location) => {
    let checkAction = false;
    if(locationArray.includes(location.id)){
      newArrayLocations.push(
        {
          locationId:location.id,
          LocationName:location.name,
          isCheck: true,
        }
      );
  }else{
    newArrayLocations.push(
      {
        locationId:location.id,
        LocationName:location.name,
        isCheck: false,
      }
    );
  }
  }
));

  let newArrayLanguages=[];
  let totalLanguages =  [];
  let userLanguage=userData.language;
  let arrayLanguages = userLanguage.split(",");
  const languages = await Language.findAll({});
  await Promise.all(languages.map(async (language) => {
    totalLanguages.push(language.name);
  }));

  totalLanguages =totalLanguages.map(v => v.toLowerCase());
  totalLanguages =  [...totalLanguages,...arrayLanguages];
  totalLanguages =  totalLanguages.filter((val, i, arr) => arr.indexOf(val) === i);
  
  await Promise.all(totalLanguages.map(async (totalLanguage) => {
    let checkAction = false;
    if(arrayLanguages.includes(totalLanguage)){
      newArrayLanguages.push(
        {
          LanguageName:totalLanguage,
          isCheck: true,
        }
      );
  }else{
    newArrayLanguages.push(
      {
        LanguageName: totalLanguage,
        isCheck: false,
      }
    );
  }
  }
));


 let experience=userData.experience;
 
 let years=parseInt(experience/12); 
 let months=experience % 12; 
  const payload = {};
  payload.roles = roles;
  payload.user = userData;
if(userData.reportingTo!=null){
  payload.userReportingTo=UserReportingTo.firstName.charAt(0).toUpperCase() + UserReportingTo.firstName.slice(1)
  +" "+UserReportingTo.lastName.charAt(0).toUpperCase() + UserReportingTo.lastName.slice(1)
   +' '+'('+UserReportingTo.roles.name.replace('_',' ').toLowerCase()
   .split(' ').map((roleNam)=> {return roleNam[0].toUpperCase() + roleNam.substr(1);})
   .join(" ")+')';
}else{
  payload.userReportingTo=null;
}
  payload.user.YearsORMonths = 'month';
  payload.years = years;
  payload.months = months;
  payload.newArrayLanguages = newArrayLanguages;
  payload.arrayLanguages = arrayLanguages;
  payload.form = '';
  payload.locations = locations;
  payload.dpds = dpds;
  payload.productTypes = productTypes;
  payload.UserExperiences = UserExperiences;
  payload.OperatingLocations = OperatingLocations;
  payload.newArrayLocations = newArrayLocations;
  payload.userRole=userData.dataValues.roles.name;

 
  if(userData.dataValues.roles.name=='fos'){
    payload.UserStateCity=UserStateCity ? UserStateCity : '';
    payload.ServicePincode=ServicePincode ? ServicePincode : '';
  }else{
    payload.UserStateCity='';
    payload.ServicePincode='';
  }
 
  payload.toastColor = 'green'

  var toatsMsg = ""
  var toast = false
 
  if (req.flash('successMsg')[0]) {
   

    toatsMsg = req.flash('successMsg')[0]
    toast = true
  }
  payload.toastText = toatsMsg
  payload.toast = toast

  payload.error = false;

  res.render('admin/components/user/edit_user_details_new', payload);
};
 
/*
# purpose: to Update User Details
*/
const updateUserDetails = async (req, res) => {

  let expInMonths='';
  if(req.body.year!='' && req.body.month==''){
    expInMonths=parseInt(req.body.year) * 12;
  }
  if(req.body.month!='' && req.body.year==''){
    expInMonths=parseInt(req.body.month);
  }
  if(req.body.year!='' && req.body.month!=''){
    expInMonths= parseInt(req.body.year) * 12 + parseInt(req.body.month);
  }

  req.body.experience=expInMonths;

  req.body.dob = moment(req.body.dob, "YYYY-MM-DD").format('YYYY-MM-DD');
  let locationArray=[];
  let locationArrayNew=[];
  const { id } = req.body;
  
  const userData = await Users.findOne({
    where: { id: id },
    include: [{ model: Roles, as: 'roles' }],
  });
  if(req.body.language){
    const lang=req.body.language.join().toLowerCase();
   
    req.body.language=lang;
  }
  let UserReportingTo;
  if (isNaN(req.body.reportingTo)) {
  let reportName=req.body.reportingTo;
  
  let reportNameNew=reportName.split(' (');
  reportNameNew=reportNameNew[0];
  let reportNameLength=reportNameNew.split(" ").length;
  let firstReportName,secondReportName;
    if(reportNameLength>1){
      firstReportName  =reportNameNew.split(' ').slice(0,-1).join(' ');
      secondReportName =reportNameNew.split(' ').slice(1).join(' ');
    }else{
      firstReportName  =reportName.split(' ').slice(0).join(' ');
      secondReportName ='';
    }

    UserReportingTo = await Users.findOne({ where:{ firstName:firstReportName,lastName:secondReportName},include: [{ model: Roles, as: 'roles' }]});
    req.body.reportingTo=UserReportingTo.id;
  
  }else{
    UserReportingTo = await Users.findOne({ where:{ id:req.body.reportingTo},include: [{ model: Roles, as: 'roles' }]});
  }
  
  let ProductTypes=req.body.productType;
  let dpd=req.body.dpd;
  let i=0;
  if(typeof(ProductTypes)!='string'){
    await Promise.all(ProductTypes.map(async(ProductType)=>{
      const newUserExperience={
        userId: userData.id,
        productType: ProductType,
        dpd: dpd[i],
      };
   
     let productTypeCheck=ProductType;
     
     let dpdCheck=dpd[i];
     i++;
      const UserExperienceCheck = await UserExperience.findOne({ where:{userId:id,productType:productTypeCheck,dpd:dpdCheck}});
     
      if(!UserExperienceCheck && UserExperienceCheck==null){
        await UserExperience.create(newUserExperience);
      }
    }));
  }
  if (req.body.address != '' && req.body.address != undefined && req.body.pincode != '' && req.body.pincode != undefined) {

    const options = {
      provider: 'google',
      httpAdapter: 'https',
      apiKey: process.env.googleApiKey,
      formatter: null
    };

    const geoCoder = nodeGeocoder(options);
    const geoRes = await geoCoder.geocode({ address: req.body.address, country: 'India', zipcode: req.body.pincode });

    if (geoRes != undefined && geoRes.length > 0) {
      req.body.latitude = parseFloat(geoRes[0].latitude);
      req.body.longitude = parseFloat(geoRes[0].longitude);
    } else {
      req.body.latitude = 0.0;
      req.body.longitude = 0.0;
    }

  }


  const locations = await Location.findAll({});
  const dpds = await DPD.findAll({});
  const productTypes = await ProductType.findAll({});
  const UserExperiences = await UserExperience.findAll({ where:{userId:id}});

  //Serviceable Pincode

  if(req.body.pincodeId){
    let PincodeIds=req.body.pincodeId;
    let SelectCity=req.body.city;
   if(typeof(PincodeIds)!='string'){
    
  await Promise.all(PincodeIds.map(async(PincodeId)=>{

  const newServiceablePincode={
    userId:userData.id,
    pincode:PincodeId,
    city:SelectCity
  };

  let PincodeCheck=await ServiceablePincode.findOne({ where: { userId:userData.id ,pincode:PincodeId} });

  
  if(!PincodeCheck && PincodeCheck==null){
   
    await ServiceablePincode.create(newServiceablePincode);
  }
  
}));
}
}

//city state pincode
if(userData.dataValues.roles.name=='fos'){ 
  UserServicePincode = await ServiceablePincode.findOne({ where:{ userId:userData.id}});
  UserStateCity = await Pincodes.findOne({ where:{ code:UserServicePincode.pincode}});
  ServicePincode = await ServiceablePincode.findAll({ where:{ userId:userData.id},raw:true});
 }
 let emailCheck=await Users.findOne({ where: { email:req.body.email} });
 await Users.update(req.body, { where: { id } });
 

let updateUser=await Users.findOne({ where: { id } });
//save trail
var data = {
  userName: req.session.user.firstName + ' ' + req.session.user.lastName,
  userId: req.session.user.id,
  moduleName: "Users",
  tableName: "Users",
  action: "Edit",
  objectId: id,
  updateUserName:updateUser.firstName + ' ' + updateUser.lastName
}
data.description = auditMsgs.getAuditMessage("updateUserDetails", data)
helper.saveAuditTrail(data, req);

if(emailCheck==null){
  if(userData.email != req.body.email){
    const tempCode = Math.random().toString(36).substring(2, 7);
    const mailData = {
      email: req.body.email,
      subject: 'Welcome to CLXNS - Your account has been updated successfully!',
      body:
        `${'<p>' + 'Hello '}${req.body.firstName},`
        + '<p>'
        + 'Your user account has been updated successfully!'
        + '<p>'
        + `<br>`
        + 'Please click on the below link to verify your email.'
        + `<br>`
        + `${process.env.baseUrl}user/verifiedEmail?code=${tempCode}\n\n`
        + `<br>`
        + `<br>`
        + 'Regards,'
        + '<br>'
        + 'Team CLXNS',
    };
    await Users.update({tempCode:tempCode,isEmailVerified:0}, { where: { id } });
    
    email.sendEmail(mailData);
    
  }
}

  if(typeof(ProductTypes)=='string'){
    const UserExperienceCheck = await UserExperience.findOne({ where:{userId:id,productType:ProductTypes,dpd:dpd}});
    if(!UserExperienceCheck && UserExperienceCheck==null){
      const newUserExperience={
        userId: userData.id,
        productType: ProductTypes,
        dpd: dpd,
      };
      await UserExperience.create(newUserExperience);
    }else{
      try {
        await UserExperience.update(req.body, { where: { userId:id } });
      } catch (e) {
        console.log('UserExperience erro', e);
      }      
    }
  }
 
 /* Operating Location start*/
 let LocationIds=req.body.locationId;
if(req.body.locationId){
  if(typeof(LocationIds)!='string' ){
    await Promise.all(LocationIds.map(async(LocationId)=>{
    const newOperatingLocation={
      userId: userData.id,
      locationId:LocationId,
    };
   
   
   const OperatingLocationCheck = await OperatingLocation.findOne({ where:{userId:newOperatingLocation.userId,locationId:newOperatingLocation.locationId}});
   
   if(!OperatingLocationCheck && OperatingLocationCheck==null){
    await OperatingLocation.create(newOperatingLocation);
   }
   }));
   }
}


/* Operating Location end*/


const userDataUpdated = await Users.findOne({
  where: { id: id },
  include: [{ model: Roles, as: 'roles' }],
});


//remove operating location 

const OperatingLocationsNew = await OperatingLocation.findAll({ where:{userId:id}});

await Promise.all(OperatingLocationsNew.map(async (OperatingLocation) => {
  locationArrayNew.push(OperatingLocation.locationId);
}));

locationArrayNew = locationArrayNew.map(String);

if ((LocationIds && (LocationIds.length > 0)) || (!locationArrayNew)) {
  if (locationArrayNew && LocationIds.length < locationArrayNew.length) {
    locationArrayNew.map(async (arrayList) => {
     
      if (!LocationIds.includes(arrayList)) {
        await OperatingLocation.destroy({ where: { LocationId: arrayList } });
      }
    });
  }
} else {
  OperatingLocationsNew.map(async (operatinglocation) => {
    await OperatingLocation.destroy({
      where: {
        userId:userDataUpdated.id,
        locationId: operatinglocation.locationId,
      },
    });
  });
}

await OperatingLocation.update(req.body.locationId, { where: { userId:id } });

/*Payload OperatingLocations Array*/ 
const OperatingLocations = await OperatingLocation.findAll({ where:{userId:id}});

await Promise.all(OperatingLocations.map(async (OperatingLocation) => {
  locationArray.push(OperatingLocation.locationId);
}));

let newArrayLocations=[];
await Promise.all(locations.map(async (location) => {
  let checkAction = false;
  if(locationArray.includes(location.id)){
    newArrayLocations.push(
      {
        locationId:location.id,
        LocationName:location.name,
        isCheck: true,
      }
    );
}else{
  newArrayLocations.push(
    {
      locationId:location.id,
      LocationName:location.name,
      isCheck: false,
    }
  );
}
}
));

//edit user language check
  const roles = await Roles.findAll({});
  let newArrayLanguages=[];
  let totalLanguages=[];
  
  let userLanguage=userDataUpdated.language;
  let arrayLanguages = userLanguage.split(",");
  

  const languages = await Language.findAll({});
  await Promise.all(languages.map(async (language) => {
    totalLanguages.push(language.name);
  }));

  totalLanguages =totalLanguages.map(v => v.toLowerCase());

  await Promise.all(totalLanguages.map(async (totalLanguage) => {
    let checkAction = false;
    if(arrayLanguages.includes(totalLanguage)){
      newArrayLanguages.push(
        {
          LanguageName:totalLanguage,
          isCheck: true,
        }
      );
  }else{
    newArrayLanguages.push(
      {
        LanguageName: totalLanguage,
        isCheck: false,
      }
    );
  }
  }
));


let experience=userDataUpdated.experience;
 
 let years=parseInt(experience/12); 
 let months=parseInt(experience) % 12; 

  const payload = {};
  payload.roles = roles;
  payload.user = userDataUpdated;
  payload.form = req.body;
  payload.newArrayLanguages = newArrayLanguages;
  payload.arrayLanguages = arrayLanguages;
  payload.locations = locations;
  payload.dpds = dpds;
  payload.years = years;
  payload.months = months;
  payload.userRole=userData.dataValues.roles.name;
  payload.userReportingTo=UserReportingTo.firstName.charAt(0).toUpperCase() + UserReportingTo.firstName.slice(1)
  +" "+UserReportingTo.lastName.charAt(0).toUpperCase() + UserReportingTo.lastName.slice(1)
   +' '+'('+UserReportingTo.roles.name.replace('_',' ').toLowerCase()
   .split(' ').map((roleNam)=> {return roleNam[0].toUpperCase() + roleNam.substr(1);})
   .join(" ")+')';
  if(userData.dataValues.roles.name=='fos'){
    payload.UserStateCity=UserStateCity;
    payload.ServicePincode=ServicePincode;
  }else{
    payload.UserStateCity='';
    payload.ServicePincode='';
  }
  payload.productTypes = productTypes;
  payload.UserExperiences = UserExperiences;
  payload.OperatingLocations = OperatingLocations;
  payload.newArrayLocations = newArrayLocations;
  payload.toast = true
  payload.toastColor = 'green'
  payload.toastText = 'User edited successfully'
  payload.error = false;

  req.session.toastTxt='User edited successfully';
  res.redirect('/user');

  // res.render('admin/components/user/edit_user_details_new', payload);

};

/*
# purpose: to update User Password
*/
const updateUserPassword = async (req, res) => {

  const { id } = req.body;

  const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

  await Users.update({ password: hash }, { where: { id } });

  const roles = await Roles.findAll({});

  const userData = await Users.findOne({
    where: { id: id },
    include: [{ model: Roles, as: 'roles' }],
  });

  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Users",
    tableName: "Users",
    action: "edit",
    objectId: id,
    updateUserName:userData.dataValues.firstName + ' ' + userData.dataValues.lastName
  }
  data.description = auditMsgs.getAuditMessage('changePassword', data)
  helper.saveAuditTrail(data, req);

  const payload = {};
  payload.roles = roles;
  payload.user = userData;

  payload.title = 'Clxns: Login';
  payload.error = false;
  payload.toast = true
  payload.toastColor = 'green'

  payload.toastText = 'Password changed successfully'

  res.render('login', payload);
}

/*
# purpose: to Veryfi Email
*/
const emailVerification = async (req, res) => {

  const tempcode  = req.query.code;
  
  const users  = await Users.findOne({ where: { tempCode : tempcode}, raw: true });
  if(users && users!=null){
    await Users.update({ isEmailVerified: 1 }, { where: { tempCode : tempcode} });
  }else{
    const payload = {};
    payload.title = 'Clxns: Login';
    payload.error = false;
    payload.toast = true
    payload.toastColor = 'red'
    payload.toastText = 'User not found'
    res.render('login', payload);
  }
  const roles = await Roles.findAll({});
  const payload = {};
  payload.roles = roles;
  payload.title = 'Clxns: Login';
  payload.error = false;
  payload.toast = true
  payload.toastColor = 'green'
  payload.toastText = 'Your email address has been successfully verified'

  res.render('login',payload);
}

/*
# purpose: to Delete User 
*/
const deleteUser = async (req, res) => {

  const { userId } = req.body;
  
  let status=req.body.teamId;
  let statusChange='';
  if(status==0){
    statusChange=1;
  }else{
    statusChange=0;
  }
  console.log(req.body); 
 let deleteUser= await Users.findOne({ where: { id: userId } });
  await Users.update({ isDeleted: statusChange }, { where: { id: userId } });
  
  //save trail
  var data = {
    userName: req.session.user.firstName + ' ' + req.session.user.lastName,
    userId: req.session.user.id,
    moduleName: "Users",
    tableName: "Users",
    action: "Delete",
    objectId: userId,
    deleteUserName:deleteUser.firstName + ' ' + deleteUser.lastName,
    status : (status==0)?'deactivate':'activate'
  }
  data.description = auditMsgs.getAuditMessage('deleteUser', data)
  helper.saveAuditTrail(data, req);

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });

};
  
/*
# purpose: to validate Fields
*/
const validateFields = async (req, res) => {
 
  let query = {};

  if (req.body.email && req.body.email != '') {
    query = { email: req.body.email.trim().toLowerCase() };
  }
  if (req.body.phone && req.body.phone != '') {
    query = { phone: req.body.phone.trim() };
  }
  if (req.body.employeeId && req.body.employeeId != '') {
    query = { employeeId: req.body.employeeId.trim() };
  }

  const userData = await Users.findOne({ where: query });


  if (userData && req.body.id) {
    if (userData && userData.dataValues && userData.dataValues.id == req.body.id) {
      return res.status(200).json({
        error: false,
        isExist: false,
      });
    }
    return res.status(200).json({
      error: false,
      isExist: true,
    });
  }
  if (userData && !req.body.id) {
    return res.status(200).json({
      error: false,
      isExist: true,
    });
  }

  return res.status(200).json({
    error: false,
    isExist: false,
  });
};

/*
# purpose: to find All Users
*/

const findAll = async (req, res) => {
  Users.findAll({
    include: [
      {
        model: Teams,
        as: "teams",
        attributes: ["id", "name", "members", "team_leader"],
        through: {
          attributes: [],
        }
      },
    ],
  })
    .then((users) => {
      return res.status(200).json({
        error: false,
        title: 'Success',
        data: users
      });
    })
    .catch((err) => {
      console.log(">> Error while retrieving Userss: ", err);
      return res.status(200).json({
        error: true,
        title: 'Failure',
        data: err
      });
    });
};

/*
# purpose: to find Users By Id 
*/

const findById = async (req, res) => {
  Users.findByPk(req.body.userId, {
    include: [
      {
        model: Teams,
        as: "teams",
        attributes: ["id", "name", "member", "team_leader"],
        through: {
          attributes: [],
        }
      },
    ],
  })
    .then((users) => {
      return res.status(200).json({
        error: false,
        title: 'Success',
        data: users
      });
    })
    .catch((err) => {
      console.log(">> Error while finding Users: ", err);
      return res.status(200).json({
        error: true,
        title: 'Failure',
        data: err
      });
    });
};

/*
# purpose: to addTeam in view team details page
*/

const addTeam = (userId, teamId) => {

  return Users.findByPk(userId)
    .then((user) => {
      if (!user) {
        console.log('\n\nUser not found!');
        return null;
      }
      return Teams.findByPk(teamId).then((team) => {
        if (!team) {
          console.log('\n\nTeams not found!');
          return null;
        }
        

        user.addTeam(team);
        return user;
      });
    })
    .catch((err) => {
      console.log('\n\n>> Error while adding Teams to User: ', err);
    });
};

/*
# purpose: to find Level of users
*/
const findLevel = async(req,res) => {
  const {roleId}=req.body;
  const roleOne = await Roles.findOne({ where: { id:roleId} });

  let whereQuery={};
  let reportingName=[];
  whereQuery.level= (roleOne.name=='admin' || roleOne.name=='business_head') ? roleOne.level : roleOne.level -1;
  whereQuery.type= (roleOne.name=='field_manager')? 'backoffice':roleOne.type;
  const roleLevel = await Roles.findAll({ where: whereQuery , raw:true});
  

  await Promise.all(roleLevel.map(async(newlevel)=>{
  const userName = await Users.findAll({ where: {roleId:newlevel.id} ,include: [{ model: Roles, as: 'roles' }]});
  
  await userName.map((newUser)=>{
    reportingName.push({
      id:newUser.id,
      name:newUser.firstName.charAt(0).toUpperCase() + newUser.firstName.slice(1)
      +" "+newUser.lastName.charAt(0).toUpperCase() + newUser.lastName.slice(1)
       +'('+newUser.roles.name.replace('_',' ').toLowerCase()
       .split(' ').map((roleNam)=> {return roleNam[0].toUpperCase() + roleNam.substr(1);})
       .join(" ")+')',
      roleName:newUser.roles.name
    })
  })
  }) 
  );

  
  let payload={};
  payload.roleLevel=roleLevel;
  payload.reportingName=reportingName;
  payload.roleOne=roleOne;
  payload.isEdit=req.body.isEdit;
  return res.status(200).json({
    title: 'Success',
    error: false,
    payload
  });
  
};

/*
# purpose: to find StateCity of users
*/
const findStateCity = async(req,res) => {
  const {roleId,state}=req.body;
  const {isStateSelect}=req.body;
  const roleOne = await Roles.findOne({ where: { id:roleId} });
  
  let whereQuery={};
 let CityLocation;
 let whereState={};
 whereState.state= {[Op.ne]: ''}
  const StateLocation = await Pincodes.findAll({ where:whereState,group: ['state'],raw:true});
  if(state!=null){
     CityLocation = await Pincodes.findAll({ where:{state:state} ,group: ['city'],raw:true});
  }else{
     CityLocation = await Pincodes.findAll({ group: ['city'],raw:true});
  }
  
  let payload={};
  payload.StateLocation=StateLocation.sort();
  payload.CityLocation=CityLocation.sort();
  payload.roleOne=roleOne;
  payload.pincode=StateLocation;
  payload.isEdit=req.body.isEdit;
  payload.isStateSelect=isStateSelect;
  return res.status(200).json({
    title: 'Success',
    error: false,
    payload
  });
  
};

/*
# purpose: to find City of users
*/
const findCity = async(req,res) => {
  const {stateName}=req.body;
  const {isStateSelect}=req.body;

  let whereQuery={};

  const City = await Pincodes.findAll({ where :{state:stateName},group: ['city'],raw:true});

  let payload={};
  payload.City=City.sort();
  payload.isStateSelect=isStateSelect;
  return res.status(200).json({
    title: 'Success',
    error: false,
    payload
  });
  
};

/*
# purpose: to find Pincode of users
*/
const findPincode = async(req,res) => {
  const {cityName}=req.body;

  let whereQuery={};
  let pincodeListNew=[];
  let servicePincodeList=[];
  const Pincode = await Pincodes.findAll({ where :{city:cityName},group: ['code'],raw:true});

  if(req.body.pincodeList && req.body.pincodeList.length>0){
    const pincodeNew=JSON.parse(req.body.pincodeList);

    await Promise.all(pincodeNew.map(async (ServicePincode) => {
      servicePincodeList.push(ServicePincode.pincode);
    }));
    
  
    await Promise.all(Pincode.map(async (newPincode) => {
      if(servicePincodeList.includes(newPincode.code)){
        pincodeListNew.push(
        {
          code:newPincode.code,
          isCheck: true,
        }
      );
      }else{
        pincodeListNew.push(
          {
            code:newPincode.code,
            isCheck: false,
          }
        );
      }
    }));
  
  }

  
  let payload={};
  if(req.body.pincodeList && req.body.pincodeList.length>0){
    payload.Pincode=pincodeListNew.sort();
  }else{
    payload.Pincode=Pincode.sort();
  }
 
  return res.status(200).json({
    title: 'Success',
    error: false,
    payload
  });
  
};

/*
# purpose: to profile
*/
const profile = async(req, res) => {

  const  id  = req.session.user_id;
  let locationArray=[];
  const roles = await Roles.findAll({});
  const locations = await Location.findAll({});
  const dpds = await DPD.findAll({});
  const productTypes = await ProductType.findAll({});
  const OperatingLocations = await OperatingLocation.findAll({ where:{userId:id}});
  
  const UserExperiences = await UserExperience.findAll({ where:{userId:id}});
  
  const userData = await Users.findOne({
    where: { id: id },
    include: [{ model: Roles, as: 'roles' }],
  });

  

  const UserReportingTo = await Users.findOne({ where:{ id:userData.reportingTo}, include: [{ model: Roles, as: 'roles' }]});
  
  let UserServicePincode;
  let UserStateCity;
  let ServicePincode;
  if(userData.dataValues.roles.name=='fos'){ 
    UserServicePincode = await ServiceablePincode.findOne({ where:{ userId:userData.id}});
    
    UserStateCity = await Pincodes.findOne({ where:{ code:UserServicePincode.pincode,city:UserServicePincode.city}});
    
    ServicePincode = await ServiceablePincode.findAll({ where:{ userId:userData.id},raw:true});
   }
  

  
  await Promise.all(OperatingLocations.map(async (OperatingLocation) => {
    locationArray.push(OperatingLocation.locationId);
  }));
  
  let newArrayLocations=[];
  await Promise.all(locations.map(async (location) => {
    let checkAction = false;
    if(locationArray.includes(location.id)){
      newArrayLocations.push(
        {
          locationId:location.id,
          LocationName:location.name,
          isCheck: true,
        }
      );
  }else{
    newArrayLocations.push(
      {
        locationId:location.id,
        LocationName:location.name,
        isCheck: false,
      }
    );
  }
  }
));

  let newArrayLanguages=[];
  let totalLanguages =  [];
  let userLanguage=userData.language;
  let arrayLanguages = userLanguage.split(",");
  const languages = await Language.findAll({});
  await Promise.all(languages.map(async (language) => {
    totalLanguages.push(language.name);
  }));

  totalLanguages =totalLanguages.map(v => v.toLowerCase());
  totalLanguages =  [...totalLanguages,...arrayLanguages];
  totalLanguages =  totalLanguages.filter((val, i, arr) => arr.indexOf(val) === i);
  
  await Promise.all(totalLanguages.map(async (totalLanguage) => {
    let checkAction = false;
    if(arrayLanguages.includes(totalLanguage)){
      newArrayLanguages.push(
        {
          LanguageName:totalLanguage,
          isCheck: true,
        }
      );
  }else{
    newArrayLanguages.push(
      {
        LanguageName: totalLanguage,
        isCheck: false,
      }
    );
  }
  }
));


 let experience=userData.experience;
 
 let years=parseInt(experience/12); 
 let months=experience % 12; 
  const payload = {};
  payload.roles = roles;
  payload.user = userData;
if(userData.reportingTo!=null){
  payload.userReportingTo=UserReportingTo.firstName.charAt(0).toUpperCase() + UserReportingTo.firstName.slice(1)
  +" "+UserReportingTo.lastName.charAt(0).toUpperCase() + UserReportingTo.lastName.slice(1)
   +' '+'('+UserReportingTo.roles.name.replace('_',' ').toLowerCase()
   .split(' ').map((roleNam)=> {return roleNam[0].toUpperCase() + roleNam.substr(1);})
   .join(" ")+')';
}else{
  payload.userReportingTo=null;
}
  payload.user.YearsORMonths = 'month';
  payload.years = years;
  payload.months = months;
  payload.newArrayLanguages = newArrayLanguages;
  payload.arrayLanguages = arrayLanguages;
  payload.form = '';
  payload.locations = locations;
  payload.dpds = dpds;
  payload.productTypes = productTypes;
  payload.UserExperiences = UserExperiences;
  payload.OperatingLocations = OperatingLocations;
  payload.newArrayLocations = newArrayLocations;
  payload.userRole=userData.dataValues.roles.name;
  if(userData.dataValues.roles.name=='fos'){
    payload.UserStateCity=UserStateCity;
    payload.ServicePincode=ServicePincode;
  }else{
    payload.UserStateCity='';
    payload.ServicePincode='';
  }
  
  
  payload.toastColor = 'green'

  var toatsMsg = ""
  var toast = false
 
  if (req.flash('successMsg')[0]) {
   

    toatsMsg = req.flash('successMsg')[0]
    toast = true
  }
  payload.toastText = toatsMsg
  payload.toast = toast

  payload.error = false;

  res.render('admin/components/user/profile', payload);
}

module.exports = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  list,
  userlist,
  viewUserDetails,
  addUser,
  createUser,
  editUserDetails,
  updateUserDetails,
  deleteUser,
  validateFields,
  findAll,
  findById,
  addTeam,
  updateUserPassword,
  emailVerification,
  checkUserExit,
  findLevel,
  findStateCity,
  findCity,
  findPincode,
  profile
};