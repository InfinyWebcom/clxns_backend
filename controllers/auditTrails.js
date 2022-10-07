// NODE MODULES
const { validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const helper = require('../helper/helper');
const moment = require('moment');

// DATABASE
const db = require('../models');
const Op = db.Sequelize.Op;
const Teams = db.teams;
const TeamMember = db.teamMembers;
const AuditTrail = db.auditTrail;
const Users = db.users;

// CONTROLLERS
const userCrtl = require('./users');

/*
# purpose: List audit trails - Page
*/
const list = async (req, res) => {

  const auditTrail = await AuditTrail.findAndCountAll({ });

  const AjaxColumns = [
    // { 'title': 'User Name', 'data': 'user.firstName' },
    { 'title': 'Date', 'data': 'dateString' },
    { 'title': 'Module Name', 'data': 'moduleName' },
    // { 'title': 'Table Name', 'data': 'tableName' },
    // { 'title': 'Action', 'data': 'action' },
    { 'title': 'Description', 'data': 'description' },    
  ];

  const apiUrl = 'audit/auditList';

  let payload = {};

  payload.url = 'auditTrail';
  payload.pageHeading = 'Audit Trails';
  payload.totalCount = `Total audits: ${auditTrail.count}`;
  payload.addUrl = 'audit/add';
//   payload.addButtonName = 'Create a team';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to change status of this team?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  payload.datatable = {
    url : 'auditTrail',
    columns: AjaxColumns,
    apiUrl: apiUrl
  };

  res.render('admin/main_list', payload);
};


/*
# purpose: List Teams
*/
const auditList = async (req, res) => {

    console.log('\n\nTeams - auditList - BODY :-', req.body);    
  
    const user = req.session.user;
  
    let length = req.body.length ? parseInt(req.body.length) : 5;
    let start = req.body.start ? parseInt(req.body.start) : 0;  

  //  let searchQuery = req.body.search.value != '' ? {  description: { [Op.like]: `%${req.body.search.value}%` } } : {};
    let searchQuery = {}
    let from_date
    let to_date 

    if (req.body.filterObj) {
      searchQuery = req.body.filterObj.searchValue ? {  description: { [Op.like]: `%${req.body.filterObj.searchValue}%` } } : {};
      if (req.body.filterObj.from_date != undefined && req.body.filterObj.to_date != undefined) {
      //  var from_date = new Date(req.body.filterObj.from_date)
      //  var to_date = new Date(req.body.filterObj.to_date)

        from_date = moment(req.body.filterObj.from_date+'00:00:00', "DD-MM-YYYY hh:mm:ss"); 
        to_date = moment(req.body.filterObj.to_date+'23:59:00', "DD-MM-YYYY hh:mm:ss"); 
        console.log('\n\nTeams - auditList - both :-', from_date);    
        searchQuery.createdAt = { [Op.and]: [{[Op.gte]: from_date}, { [Op.lte]: to_date } ]  }
      }
      else if (req.body.filterObj.from_date != undefined) {
        from_date = moment(req.body.filterObj.from_date, "DD/MM/YYYY")
        console.log('\n\nTeams - auditList - from_date :-', from_date);    
  
        searchQuery.createdAt = { [Op.gte]: from_date }
      }
      else if (req.body.filterObj.to_date != undefined) {
        to_date = moment(req.body.filterObj.to_date, "DD/MM/YYYY")
        console.log('\n\nTeams - auditList - to_date :-', to_date);    
  
        searchQuery.createdAt = { [Op.lte]: to_date }
      }
    }

    console.log('\n\nTeams - auditList - SEARCH DATE QUERY 2 :-', JSON.stringify(searchQuery));    

    const auditTrails = await AuditTrail.findAndCountAll({ where: searchQuery, limit: length, offset: start, include: [{ model: Users, as: 'user' }], order: [['createdAt', 'DESC']], });

    console.log('\n\nTeams - teamList - auditTrails :-', auditTrails);

    for (const audit of auditTrails.rows) {
        // console.log('\n\nTeams - teamList - audit :-', audit.createdAt);
        var dateString =moment(audit.createdAt).format('DD-MM-YYYY, hh:mm:ss A');

        // console.log('\n\nTeams - teamList - dateString :-', audit.createdAt.toString());

        audit.dataValues.dateString = dateString

        // console.log('\n\nTeams - teamList - user :-', audit.user.firstName);
    }

    return res.status(200).json({
      title: 'Success',
      error: false,
      data: auditTrails.rows,
      recordsFiltered: auditTrails.count,
      recordsTotal: auditTrails.count
    });  
}

module.exports = {
    list,
    auditList
};