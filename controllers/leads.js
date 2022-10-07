/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
// const multer = require('multer');
// NODE MODULES
const { validationResult } = require('express-validator');
const moment = require('moment');
const fs = require('fs');
const csv = require('fast-csv');
const CsvParser = require("json2csv").Parser;
const path = require('path');
const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const ejs = require('ejs');
// const randomstring = require('randomstring');
const uploadHandler = require('../utils/upload');
const leadsSource = require('./sourcing');
const leadsCustomer = require('./customer');
const db = require('../models');
const e = require('connect-flash');
const async = require('async');
const helper = require('../helper/helper');
const eventSuppContr = require('./caseEventsSupportings');
const { Op } = db.Sequelize;
const Leads = db.leads;
const LeadsUploads = db.pools;
const Campaigns = db.campaign;
const Teams=db.teams;
const TeamMember = db.teamMembers;
const Users = db.users;
const UserExperience= db.userExperience;
const Fis = db.fis;
const Pincode = db.pincodes;
const LeadsCities = db.cities;
const Roles = db.roles;
const Pools = db.pools;
const CollectionStatus = db.caseStatus;
const CallStatus = db.callStatus;
const CaseEvent = db.caseEvent;
const Disposition = db.dispositions;
const SubDisposition = db.subDispositions;
const DPDBucket = db.dpd;
const Location = db.locations;
const Language = db.language;
const Script = db.script;
const Payment=db.payments;
const CaseEventSupporting=db.caseEventSupporting;
const ProductType=db.productType;
const leadsContactUpdate = db.leadsContactUpdate;

 
/*
# purpose:To List New Leads - Page
*/

const listNewAssign = async (req, res) => {
 
  const campaigns = await Campaigns.findAndCountAll({ where: { isDeleted: 0 } });
  // to show team list in teamleader login
  let teamLeaderId=req.session.user.id;
  let teamList=[];
  let teamListName=[];
  const teamlist = await Teams.findAndCountAll({ where: { teamLeaderId : teamLeaderId} });
  // console.log('\n\nteamLeaderId - Res :-', teamlist[0].id);
  await Promise.all(teamlist.rows.map(async(team)=>{
    const leadsTeam = await Leads.findOne({ where: { teamId: team.id } });
    if(leadsTeam!=null && teamList.indexOf(leadsTeam.teamId) < 0){
      teamList.push(leadsTeam.teamId);
    }
  }));

  await Promise.all(teamList.map(async(teamid)=>{
    const teamlist = await Teams.findOne({ where: { id : teamid} });
    teamListName.push({
      teamID:teamlist.id,
      teamName:teamlist.name
    });
  }));
  // to set datatables columns
  const AjaxColumns = [
    { title: 'Sr.No', data: 'srNo' },
    { title: 'Loan Number', data: 'loanAccountNo' },
    { title: 'Pool', data: 'pool' },
    { title: 'Bank Name', data: 'bankName' },
    { title: 'Customer Name', data: 'name' },
    { title: 'Total Due Amt', data: 'totalDueAmount' },
    { title: 'Outstanding Amt', data: 'principalOutstandingAmount' },
    { title: 'DPD', data: 'DPDBucket' },
    { title: 'Location', data: 'applicantCity' },
    { title: 'Email', data: 'email' },
    { title: 'Days Due', data: 'daysDue' },
    { title: 'Disbursement Date', data: 'disbursementDate' },
    { title: 'EMI Start Date', data: 'emiStartDate' },
    { title: 'Interest Due Amount', data: 'interestDueAmount' },
    { title: 'Penalty Amount', data: 'penaltyAmount' },
    { title: 'OD Value', data: 'ODValue' },
    { title: 'Transaction Type', data: 'transactionType' },
    { title: 'Payment Status', data: 'paymentStatus' },
    { title: 'Telecaller Assigned Date', data: 'telecallerAssignedDate' },
    { title: 'FOS Assigned Date', data: 'fosAssignedDate' },
    { title: 'Expiry Date', data: 'expiryDate' },
    { title: 'Amount Collected', data: 'amountCollected' },
    { title: 'Allocation Date', data: 'allocationDate' },
    { title: 'Applicant PanNumber', data: 'applicantPanNumber' },
    { title: 'Applicant DOB', data: 'applicantDob' },
    { title: 'EMI Due Amount', data: 'emiDueAmount' },
    { title: 'Date Of Default', data: 'dateOfDefault' },
    { title: 'Allocation DPD', data: 'allocationDpd' },
    { title: 'Disbursement Type', data: 'disbursementType' },
    { title: 'Applicant Pincode', data: 'applicantPincode' },
    { title: 'Loan Type', data: 'loanType' },
    { title: 'Tenure Finished', data: 'tenureFinished' },
    { title: 'Applicant Cibil Score', data: 'applicantCibilScore' },
    { title: 'Applicant Address Type', data: 'applicantAddressType' },
    { title: 'Engine Number', data: 'engineNumber' },
    { title: 'Co-Applicant Name', data: 'coApplicantName' },
    { title: 'Co-Applicant DOB', data: 'coApplicantDob' },
    { title: 'Co-Applicant Address', data: 'coApplicantAddress' },
    { title: 'Co-Applicant City', data: 'coApplicantCity' },
    { title: 'Co-Applicant State', data: 'coApplicantState' },
    { title: 'Co-Applicant Pincode', data: 'coApplicantPincode' },
    { title: 'Band', data: 'band' },
    { title: 'Loan Disbursement Date', data: 'loanDisbursementDate' },
    { title: 'Loan Maturity Date', data: 'loanMaturityDate' },
    { title: 'Business Name', data: 'businessName' },
    { title: 'Applicant Address', data: 'applicantAddress' },
    { title: 'Applicant City', data: 'applicantCity' },
    { title: 'Applicant State', data: 'applicantState' },
    { title: 'Make And Model', data: 'makeAndModel' },
    { title: 'Chassis Number', data: 'chassisNumber' },
    { title: 'Request Reassign', data: 'requestReassign' },
    // { title: 'Actions', data: 'actions' },
  ];

  const apiUrlNewLeads = 'leads/leadslistNew';

  const payload = {};
// to send datatables payload data
  payload.datatable = {
    filter: 'leads',
    columns: AjaxColumns,
    apiUrl:apiUrlNewLeads,
    isFilter:'false',
  };
  let leads;
  leads = await Leads.findAndCountAll({ where: { isDeleted: 0 } });
  payload.url = 'leads/newLeads';
  payload.pageHeading = 'New Leads ';
  payload.totalCount = `Total Leads: ${leads.count}`;
  payload.addUrl = 'leads/addLeads';
  payload.Content = 'Leads Management';
  payload.campaigns = campaigns.rows;
  payload.teamListName=teamListName;
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this lead?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
 let whereQuery={};
 whereQuery[Op.and]= [{teamId:  {[Op.is]: null}},{fosTeamId: {[Op.is]: null}}];
 whereQuery.isDeleted=0;
 let newLeadCount=0;
 let totalAmount=0;

 // to send payload data in new leads info box

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){

  let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L
  WHERE L.isDeleted = 0 AND (L.telecallerId IS NULL AND L.fosId IS NULL)`;

  leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
  newLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
  totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

  }

  if(res.locals.roleName.name=='floor_manager'){
    let loginUserId=req.session.user.id;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE U.reportingTo = ${loginUserId} AND L.telecallerId IS NULL AND L.expiryDate >= '${todayDate}'`;
 
    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    newLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

  }

  if(res.locals.roleName.name=='team_leader'){
    let loginUserId=req.session.user.id;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE U.id = ${loginUserId} AND (L.telecallerId IS NULL) AND L.expiryDate >= '${todayDate}'`;
 
    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    newLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  }

 
  payload.newLeadCount=newLeadCount;
  payload.totalAmount = totalAmount;


  const fis = await Fis.findAll({ where: { isDeleted: 0 } });
  payload.fis=fis;
  const productTypes = await ProductType.findAll({ where: { } });
  payload.productTypes=productTypes;
  const leadsUpload = await LeadsUploads.findAll({ where: { status: 'Success' } });
  payload.leadsUploads=leadsUpload;

  const dpdBucket = await DPDBucket.findAll({ where: { } });
  payload.dpdBuckets=dpdBucket;

  const collectionStatus = await CollectionStatus.findAll({ where: { } });
  const callStatus = await CallStatus.findAll({ where: { } });
 
  payload.collectionStatus = collectionStatus;
  payload.callStatus = callStatus;

    // to send Telecallers data in lead assign to team popup
    const AjaxColumnsAddTelecallers = [
      { 'title': '', 'data': 'radioButton' },
      { 'title': 'Name', 'data': 'Name' },
      { 'title': 'Leads', 'data': 'totalLeads' },
      { 'title': 'Close Leads', 'data': 'closeLeads' },
      { 'title': 'Experience', 'data': 'exp'},
      { 'title': 'DPD Experience', 'data': 'DpdExperience'},
    ];

    const apiUrlAddTelecallers = 'leads/leadsAddTelecallers';

    payload.datatableAddTelecallers = {
      url : 'leadsAddTelecallers',
      columns: AjaxColumnsAddTelecallers,
      apiUrl: apiUrlAddTelecallers
    };
 

 // to send team name in payload
 let teams;
 if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager' || res.locals.roleName.name=='field_coordinator'){
   teams = await Teams.findAll( { where: { isDeleted: 0 }, include: [{ model: Users, as: 'teamLeader' }] });
 }
 


 if(res.locals.roleName.name=='team_leader'){
  teams = await Teams.findAll( { where: { isDeleted: 0 ,teamLeaderId:teamLeaderId}, include: [{ model: Users, as: 'teamLeader' }] });
}
 

 teams.forEach((team) => {
  team.dataValues.name=team.name+'('+team.teamLeader.location+' : '+team.teamLeader.firstName+" "+team.teamLeader.lastName+')';
});



 payload.teams = teams;

  payload.moment=moment;

  res.render('admin/main_list', payload);
};

/*
# purpose:To List All Leads - Page
*/

const listAllAssign = async (req, res) => {

const campaigns = await Campaigns.findAndCountAll({ where: { isDeleted: 0 } });

// To show team list in breadcrum of teamleader login 
	
  let teamLeaderId=req.session.user.id;	
  let teamList=[];
  let teamListName=[];
  let teamMember=[];
  const teamlist = await Teams.findAndCountAll({ where: { teamLeaderId : teamLeaderId} });

  await Promise.all(teamlist.rows.map(async(team)=>{
    const leadsTeam = await Leads.findOne({ where: { teamId: team.id } });
 
    if(leadsTeam!=null && teamList.indexOf(leadsTeam.teamId) < 0){
      teamList.push(leadsTeam.teamId);
    }
  }));

  await Promise.all(teamList.map(async(teamid)=>{
    const teamlist = await Teams.findOne({ where: { id : teamid} });
    teamListName.push({
      teamID:teamlist.id,
      teamName:teamlist.name
    });
  }));


  await Promise.all(teamlist.rows.map(async(teamid)=>{

    const teamMemberList = await TeamMember.findAndCountAll({ where: { teamId: teamid.id }, include: [{ model: Users, as: 'user' }] });

    teamMemberList.rows.map(async(teamMemberName)=>{
      teamMember.push({
        userId:teamMemberName.user.id,
        userName:teamMemberName.user.firstName+" "+teamMemberName.user.lastName
      });
    });
  }));

  // to set data in datatables
  let check=`<input type="checkbox" class="select-all" />`;
  let AjaxColumns;
  if(res.locals.roleName.name=='field_coordinator' || res.locals.roleName.name=='field_manager'){
    AjaxColumns = [
      { title: '<span></span>' , data: 'checkbox' },
      { title: 'Loan Id', data: 'loanId' },
      { title: 'Lead Id', data: 'loanAccountNo' },
      { title: 'Pool', data: 'pool' },
      { title: 'Bank Name', data: 'bankName' },
      { title: 'Customer Name', data: 'name' },
      { title: 'Total Due Amt', data: 'totalDueAmount' },
      { title: 'Outstanding Amt', data: 'principalOutstandingAmount' },
      { title: 'DPD', data: 'DPDBucket' },
      { title: 'Disposition', data: 'dispostion' },
      { title: 'Location', data: 'applicantCity' },
      { title: 'Field Coordinator', data: 'FieldCoName' },
      { title: 'Tellecaller', data: 'telecallerName' },
      { title: 'FOS', data: 'fosName' },
      { title: 'Email', data: 'email' },
      { title: 'Days Due', data: 'daysDue' },
      { title: 'Disbursement Date', data: 'disbursementDate' },
      { title: 'EMI Start Date', data: 'emiStartDate' },
      { title: 'Interest Due Amount', data: 'interestDueAmount' },
      { title: 'Penalty Amount', data: 'penaltyAmount' },
      { title: 'OD Value', data: 'ODValue' },
      { title: 'Transaction Type', data: 'transactionType' },
      { title: 'Payment Status', data: 'paymentStatus' },
      { title: 'Telecaller Assigned Date', data: 'telecallerAssignedDate' },
      { title: 'FOS Assigned Date', data: 'fosAssignedDate' },
      { title: 'Expiry Date', data: 'expiryDate' },
      { title: 'Amount Collected', data: 'amountCollected' },
      { title: 'Allocation Date', data: 'allocationDate' },
      { title: 'Applicant PanNumber', data: 'applicantPanNumber' },
      { title: 'Applicant DOB', data: 'applicantDob' },
      { title: 'EMI Due Amount', data: 'emiDueAmount' },
      { title: 'Date Of Default', data: 'dateOfDefault' },
      { title: 'Allocation DPD', data: 'allocationDpd' },
      { title: 'Disbursement Type', data: 'disbursementType' },
      { title: 'Applicant Pincode', data: 'applicantPincode' },
      { title: 'Loan Type', data: 'loanType' },
      { title: 'Tenure Finished', data: 'tenureFinished' },
      { title: 'Applicant Cibil Score', data: 'applicantCibilScore' },
      { title: 'Applicant Address Type', data: 'applicantAddressType' },
      { title: 'Engine Number', data: 'engineNumber' },
      { title: 'Co-Applicant Name', data: 'coApplicantName' },
      { title: 'Co-Applicant DOB', data: 'coApplicantDob' },
      { title: 'Co-Applicant Address', data: 'coApplicantAddress' },
      { title: 'Co-Applicant City', data: 'coApplicantCity' },
      { title: 'Co-Applicant State', data: 'coApplicantState' },
      { title: 'Co-Applicant Pincode', data: 'coApplicantPincode' },
      { title: 'Band', data: 'band' },
      { title: 'Loan Disbursement Date', data: 'loanDisbursementDate' },
      { title: 'Loan Maturity Date', data: 'loanMaturityDate' },
      { title: 'Business Name', data: 'businessName' },
      { title: 'Applicant Address', data: 'applicantAddress' },
      { title: 'Applicant City', data: 'applicantCity' },
      { title: 'Applicant State', data: 'applicantState' },
      { title: 'Make And Model', data: 'makeAndModel' },
      { title: 'Chassis Number', data: 'chassisNumber' },
      { title: 'Request Reassign', data: 'requestReassign' },
      { title: 'Created at', data: 'createdAt' },
    ];
  } else if(res.locals.roleName.name=='team_leader'){
    AjaxColumns = [
      { title: '<span></span>' , data: 'checkbox' },
      { title: 'Loan Id', data: 'loanId' },
      { title: 'Lead Id', data: 'loanAccountNo' },
      { title: 'Pool', data: 'pool' },
      { title: 'Bank Name', data: 'bankName' },
      { title: 'Customer Name', data: 'name' },
      { title: 'Total Due Amt', data: 'totalDueAmount' },
      { title: 'Outstanding Amt', data: 'principalOutstandingAmount' },
      { title: 'Disposition', data: 'dispostion' },
      { title: 'DPD', data: 'DPDBucket' },
      { title: 'Location', data: 'applicantCity' },
      { title: 'Team Leader', data: 'teamName' },
      { title: 'Field Coordinator', data: 'FieldCoName' },
      { title: 'Tellecaller', data: 'telecallerName' },
      { title: 'FOS', data: 'fosName' },
      { title: 'Email', data: 'email' },
      { title: 'Days Due', data: 'daysDue' },
      { title: 'Disbursement Date', data: 'disbursementDate' },
      { title: 'EMI Start Date', data: 'emiStartDate' },
      { title: 'Interest Due Amount', data: 'interestDueAmount' },
      { title: 'Penalty Amount', data: 'penaltyAmount' },
      { title: 'OD Value', data: 'ODValue' },
      { title: 'Transaction Type', data: 'transactionType' },
      { title: 'Payment Status', data: 'paymentStatus' },
      { title: 'Telecaller Assigned Date', data: 'telecallerAssignedDate' },
      { title: 'FOS Assigned Date', data: 'fosAssignedDate' },
      { title: 'Expiry Date', data: 'expiryDate' },
      { title: 'Amount Collected', data: 'amountCollected' },
      { title: 'Allocation Date', data: 'allocationDate' },
      { title: 'Applicant PanNumber', data: 'applicantPanNumber' },
      { title: 'Applicant DOB', data: 'applicantDob' },
      { title: 'EMI Due Amount', data: 'emiDueAmount' },
      { title: 'Date Of Default', data: 'dateOfDefault' },
      { title: 'Allocation DPD', data: 'allocationDpd' },
      { title: 'Disbursement Type', data: 'disbursementType' },
      { title: 'Applicant Pincode', data: 'applicantPincode' },
      { title: 'Loan Type', data: 'loanType' },
      { title: 'Tenure Finished', data: 'tenureFinished' },
      { title: 'Applicant Cibil Score', data: 'applicantCibilScore' },
      { title: 'Applicant Address Type', data: 'applicantAddressType' },
      { title: 'Engine Number', data: 'engineNumber' },
      { title: 'Co-Applicant Name', data: 'coApplicantName' },
      { title: 'Co-Applicant DOB', data: 'coApplicantDob' },
      { title: 'Co-Applicant Address', data: 'coApplicantAddress' },
      { title: 'Co-Applicant City', data: 'coApplicantCity' },
      { title: 'Co-Applicant State', data: 'coApplicantState' },
      { title: 'Co-Applicant Pincode', data: 'coApplicantPincode' },
      { title: 'Band', data: 'band' },
      { title: 'Loan Disbursement Date', data: 'loanDisbursementDate' },
      { title: 'Loan Maturity Date', data: 'loanMaturityDate' },
      { title: 'Business Name', data: 'businessName' },
      { title: 'Applicant Address', data: 'applicantAddress' },
      { title: 'Applicant City', data: 'applicantCity' },
      { title: 'Applicant State', data: 'applicantState' },
      { title: 'Make And Model', data: 'makeAndModel' },
      { title: 'Chassis Number', data: 'chassisNumber' },
      { title: 'Request Reassign', data: 'requestReassign' },
      { title: 'Created at', data: 'createdAt' },
    ];
  }else{
    AjaxColumns = [
      { title: 'Loan Id', data: 'loanId' },
      { title: 'Lead Id', data: 'loanAccountNo' },
      { title: 'Pool', data: 'pool' },
      { title: 'Bank Name', data: 'bankName' },
      { title: 'Customer Name', data: 'name' },
      { title: 'Total Due Amt', data: 'totalDueAmount' },
      { title: 'Outstanding Amt', data: 'principalOutstandingAmount' },
      { title: 'Disposition', data: 'dispostion' },
      { title: 'DPD', data: 'DPDBucket' },
      { title: 'Location', data: 'applicantCity' },
      { title: 'Team Leader', data: 'teamName' },
      { title: 'Field Coordinator', data: 'FieldCoName' },
      { title: 'Tellecaller', data: 'telecallerName' },
      { title: 'FOS', data: 'fosName' },
      { title: 'Email', data: 'email' },
      { title: 'Days Due', data: 'daysDue' },
      { title: 'Disbursement Date', data: 'disbursementDate' },
      { title: 'EMI Start Date', data: 'emiStartDate' },
      { title: 'Interest Due Amount', data: 'interestDueAmount' },
      { title: 'Penalty Amount', data: 'penaltyAmount' },
      { title: 'OD Value', data: 'ODValue' },
      { title: 'Transaction Type', data: 'transactionType' },
      { title: 'Payment Status', data: 'paymentStatus' },
      { title: 'Telecaller Assigned Date', data: 'telecallerAssignedDate' },
      { title: 'FOS Assigned Date', data: 'fosAssignedDate' },
      { title: 'Expiry Date', data: 'expiryDate' },
      { title: 'Amount Collected', data: 'amountCollected' },
      { title: 'Allocation Date', data: 'allocationDate' },
      { title: 'Applicant PanNumber', data: 'applicantPanNumber' },
      { title: 'Applicant DOB', data: 'applicantDob' },
      { title: 'EMI Due Amount', data: 'emiDueAmount' },
      { title: 'Date Of Default', data: 'dateOfDefault' },
      { title: 'Allocation DPD', data: 'allocationDpd' },
      { title: 'Disbursement Type', data: 'disbursementType' },
      { title: 'Applicant Pincode', data: 'applicantPincode' },
      { title: 'Loan Type', data: 'loanType' },
      { title: 'Tenure Finished', data: 'tenureFinished' },
      { title: 'Applicant Cibil Score', data: 'applicantCibilScore' },
      { title: 'Applicant Address Type', data: 'applicantAddressType' },
      { title: 'Engine Number', data: 'engineNumber' },
      { title: 'Co-Applicant Name', data: 'coApplicantName' },
      { title: 'Co-Applicant DOB', data: 'coApplicantDob' },
      { title: 'Co-Applicant Address', data: 'coApplicantAddress' },
      { title: 'Co-Applicant City', data: 'coApplicantCity' },
      { title: 'Co-Applicant State', data: 'coApplicantState' },
      { title: 'Co-Applicant Pincode', data: 'coApplicantPincode' },
      { title: 'Band', data: 'band' },
      { title: 'Loan Disbursement Date', data: 'loanDisbursementDate' },
      { title: 'Loan Maturity Date', data: 'loanMaturityDate' },
      { title: 'Business Name', data: 'businessName' },
      { title: 'Applicant Address', data: 'applicantAddress' },
      { title: 'Applicant City', data: 'applicantCity' },
      { title: 'Applicant State', data: 'applicantState' },
      { title: 'Make And Model', data: 'makeAndModel' },
      { title: 'Chassis Number', data: 'chassisNumber' },
      { title: 'Request Reassign', data: 'requestReassign' },
      { title: 'Created at', data: 'createdAt' },
    ];
  }
  
  const apiUrlAllLeads = 'leads/leadslistAll';

  const payload = {};
//send payload data in datatables
  payload.datatable = {
    filter: 'leads',
    columns: AjaxColumns,
    apiUrl:apiUrlAllLeads,
  };

  //to send all leads data in info box data

  let leads;
  let caseRecovered;
  let totalAmount=0;
  let totalAmountRecover=0;
  let teamLeadCount=0;
  let LeadCount=0;
  let totalAmountAllocated=0;
  let RecoveredLeadCount=0;
  let caseAllocate;
  let openLeads=0;
  leads= await Leads.findAndCountAll({ where: { isDeleted: 0 } });

  let todayDate=moment(new Date()).format('YYYY-MM-DD');

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id OR L.fosTeamId=T.id)
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE L.isDeleted = 0 AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL) AND L.expiryDate >= '${todayDate}'`;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
 
    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id OR L.fosTeamId=T.id)
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE L.isDeleted = 0 AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL) AND L.amountCollected > 0 AND L.expiryDate >= '${todayDate}'`;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });

    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
    let loginUserId=req.session.user.id;
    let StrQuery;
    if(res.locals.roleName.name=='field_manager'){
     StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE (UT.reportingTo = ${loginUserId} OR L.fosId=${loginUserId}) AND L.expiryDate >= '${todayDate}'`;
    }
    if(res.locals.roleName.name=='floor_manager'){
      StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE UT.reportingTo = ${loginUserId} AND L.expiryDate >= '${todayDate}'`;
    }

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  
    //open leads query
    let StrQueryFos=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    WHERE L.fosId = ${loginUserId} AND L.expiryDate >= '${todayDate}'`;

    leads= await db.sequelize.query(StrQueryFos, { type: Sequelize.QueryTypes.SELECT });
    openLeads=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;

    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE UT.reportingTo = ${loginUserId} AND L.amountCollected > 0 AND L.expiryDate >= '${todayDate}'`;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){
    let loginUserId=req.session.user.id;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE UT.id = ${loginUserId} AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL) AND L.expiryDate >= '${todayDate}'`;
   
    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE UT.id = ${loginUserId} AND L.amountCollected > 0 AND L.expiryDate >= '${todayDate}'`;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });

    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='telecaller'){
    let telecallerId=req.session.user.id;	
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE L.telecallerId=${telecallerId} AND L.expiryDate >= '${todayDate}'`;

    let leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE L.telecallerId=${telecallerId} AND L.amountCollected > 0 AND L.expiryDate >= '${todayDate}'`;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;

  }

  payload.url = 'leads/assignLeads';
  payload.pageHeading = 'All Leads';
  payload.totalCount = `${leads.count}`;
  payload.addUrl = 'leads/addLeads';
  payload.Content = 'Leads Management';
  payload.campaigns = campaigns.rows;
  payload.teamListName = teamListName;
  payload.teamMembers=teamMember;
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this lead?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
 
  const collectionStatus = await CollectionStatus.findAll({ where: { } });
  const callStatus = await CallStatus.findAll({ where: { }});
  
  payload.openLeads=openLeads;

  payload.caseAllocate=teamLeadCount;
  payload.caseRecover=RecoveredLeadCount;
  payload.casePending=teamLeadCount-RecoveredLeadCount;

  payload.totalAmount=totalAmount;
  payload.totalAmountRecover=totalAmountRecover;
  payload.amountPending=totalAmount-totalAmountRecover;

  payload.moment=moment;

  payload.collectionStatus = collectionStatus;
 

  const fis = await Fis.findAll({ where: { isDeleted: 0 } });
  payload.fis=fis;
  const productTypes = await ProductType.findAll({ where: { } });
  payload.productTypes=productTypes;
  const leadsUpload = await LeadsUploads.findAll({ where: { status:'Success' } });
  payload.leadsUploads=leadsUpload;

  const dpdBucket = await DPDBucket.findAll({ where: { } });
  payload.dpdBuckets=dpdBucket;

  // to send Telecallers in leads assign to teams
  const AjaxColumnsAddTelecallers = [
    { 'title': '', 'data': 'radioButton' },
    { 'title': 'Name', 'data': 'Name' },
    { 'title': 'Leads', 'data': 'totalLeads' },
    { 'title': 'Close Leads', 'data': 'closeLeads' },
    { 'title': 'Experience', 'data': 'exp'},
    { 'title': 'DPD Experience', 'data': 'DpdExperience'},
  ];

  const apiUrlAddTelecallers = 'leads/leadsAddTelecallers';

  payload.datatableAddTelecallers = {
    url : 'leadsAddTelecallers',
    columns: AjaxColumnsAddTelecallers,
    apiUrl: apiUrlAddTelecallers
  };

//to send team names
  let teams;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager' || res.locals.roleName.name=='field_coordinator'){
    teams = await Teams.findAll( { where: { isDeleted: 0 }, include: [{ model: Users, as: 'teamLeader' }] });
    teams.forEach((team) => {
      team.dataValues.name=team.name+'('+team.teamLeader.location+' : '+team.teamLeader.firstName+" "+team.teamLeader.lastName+')';
      });
      payload.teams = teams;
  }

  let teamFilters;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager' || res.locals.roleName.name=='field_coordinator'){
    teamFilters = await Teams.findAll( { where: { isDeleted: 0 }, include: [{ model: Users, as: 'teamLeader' }] });
    teamFilters.forEach((team) => {
      team.dataValues.name=team.name;
      });
      payload.teamFilters = teamFilters;
  }

  if(res.locals.roleName.name=='team_leader'){
  teams = await Teams.findAll( { where: { isDeleted: 0 ,teamLeaderId:teamLeaderId}, include: [{ model: Users, as: 'teamLeader' }] });
  teams.forEach((team) => {
    team.dataValues.name=team.name+'('+team.teamLeader.location+' : '+team.teamLeader.firstName+" "+team.teamLeader.lastName+')';
    });
    payload.teams = teams;
}

if(res.locals.roleName.name=='telecaller'){
  payload.teams = [];
}
  payload.callStatus = callStatus;
  payload.moment=moment;

  res.render('admin/main_list', payload);
};

/*
# purpose:To List Archive Leads - Page
*/

const listArchiveLead = async (req, res) => {

  const campaigns = await Campaigns.findAndCountAll({ where: { isDeleted: 0 } });
  
  // To show team list in breadcrum of teamleader login 
    
    let teamLeaderId=req.session.user.id;	
    let teamList=[];
    let teamListName=[];
    let teamMember=[];
    const teamlist = await Teams.findAndCountAll({ where: { teamLeaderId : teamLeaderId} });

    await Promise.all(teamlist.rows.map(async(team)=>{
      const leadsTeam = await Leads.findOne({ where: { teamId: team.id } });

      if(leadsTeam!=null && teamList.indexOf(leadsTeam.teamId) < 0){
        teamList.push(leadsTeam.teamId);
      }
    }));

    await Promise.all(teamList.map(async(teamid)=>{
      const teamlist = await Teams.findOne({ where: { id : teamid} });
      teamListName.push({
        teamID:teamlist.id,
        teamName:teamlist.name
      });
    }));

  
    await Promise.all(teamlist.rows.map(async(teamid)=>{

      const teamMemberList = await TeamMember.findAndCountAll({ where: { teamId: teamid.id }, include: [{ model: Users, as: 'user' }] });

      teamMemberList.rows.map(async(teamMemberName)=>{
        teamMember.push({
          userId:teamMemberName.user.id,
          userName:teamMemberName.user.firstName+" "+teamMemberName.user.lastName
        });
      });
    }));
    let check=`<input type="checkbox" class="select-all" />`;
    const AjaxColumns = [
      // { title: 'Sr.No', data: 'srNo' },
      // (res.locals.roleName.name=='team_leader')?{ title: '<span></span>' , data: 'checkbox' }:
      { title: 'Loan Number', data: 'loanAccountNo' },
      { title: 'Pool', data: 'pool' },
      { title: 'Bank Name', data: 'bankName' },
      { title: 'Customer Name', data: 'name' },
      { title: 'Total Due Amt', data: 'totalDueAmount' },
      { title: 'Outstanding Amt', data: 'principalOutstandingAmount' },
      { title: 'DPD', data: 'DPDBucket' },
      { title: 'Location', data: 'applicantCity' },
      { title: 'Team Leader', data: 'teamName' },
      { title: 'Tellecaller', data: 'telecallerName' },
      { title: 'FOS', data: 'fosName' },
      // { title: 'Actions', data: 'actions' },
    ];
  
    const apiUrlAllLeads = 'leads/leadslistArchive';
  
    const payload = {};
  
    payload.datatable = {
      filter: 'leads',
      columns: AjaxColumns,
      apiUrl:apiUrlAllLeads,
    };
  
    // leads info box data
    let leads= await Leads.findAndCountAll({ where: { isDeleted: 0 } });
    payload.url = 'leads/archiveLeads';
    payload.pageHeading = 'Archived Leads';
    payload.totalCount = `${leads.count}`;
    payload.addUrl = 'leads/archiveLeads';
    payload.Content = 'Leads Management';
    payload.campaigns = campaigns.rows;
    payload.teamListName = teamListName;
    payload.teamMembers=teamMember;
    payload.permissionsList = req.permissionsList;
    payload.deleteText = 'Are you sure you want to delete this lead?';
  
    payload.toast = false
    payload.toastColor = 'green'
    payload.toastText = ''
   
    const collectionStatus = await CollectionStatus.findAll({ where: { } });
    const callStatus = await CallStatus.findAll({ where: { } });
    
    payload.moment=moment;
  
    payload.collectionStatus = collectionStatus;
    payload.callStatus = callStatus;
  
    const fis = await Fis.findAll({ where: { isDeleted: 0 } });
    payload.fis=fis;
    const productTypes = await ProductType.findAll({ where: { } });
    payload.productTypes=productTypes;
    const leadsUpload = await LeadsUploads.findAll({ where: { status:'Success' } });
    payload.leadsUploads=leadsUpload;
  
    const dpdBucket = await DPDBucket.findAll({ where: { } });
    payload.dpdBuckets=dpdBucket;
  
  
  //team
    let teams;
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager' || res.locals.roleName.name=='field_coordinator'){
      teams = await Teams.findAll( { where: { isDeleted: 0 }, include: [{ model: Users, as: 'teamLeader' }] });
      teams.forEach((team) => {
        team.dataValues.name=team.name+'('+team.teamLeader.location+' : '+team.teamLeader.firstName+" "+team.teamLeader.lastName+')';
        });
      
        payload.teams = teams;
    }
  
    let teamFilters;
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager' || res.locals.roleName.name=='field_coordinator'){
      teamFilters = await Teams.findAll( { where: { isDeleted: 0 }, include: [{ model: Users, as: 'teamLeader' }] });
      teamFilters.forEach((team) => {
        team.dataValues.name=team.name;
        });
        payload.teamFilters = teamFilters;
    }
  
    if(res.locals.roleName.name=='team_leader'){
    teams = await Teams.findAll( { where: { isDeleted: 0 ,teamLeaderId:teamLeaderId}, include: [{ model: Users, as: 'teamLeader' }] });
    teams.forEach((team) => {
      team.dataValues.name=team.name+'('+team.teamLeader.location+' : '+team.teamLeader.firstName+" "+team.teamLeader.lastName+')';
      });

      payload.teams = teams;
  }
  
  if(res.locals.roleName.name=='telecaller'){
    payload.teams = [];
  }
    
    payload.moment=moment;
  
    res.render('admin/main_list', payload);
};

/*
# purpose:To Send Data in Datatables and handles List All Leads
*/
  
const leadslistAll = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObj;

  let whereQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  var whereSelect = 'L.isDeleted = 0';

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
   if (filterData && filterData.expiryLead == 'Yes') {
    whereSelect=whereSelect+` AND L.expiryDate <= '${todayDate}'`;
   }else{
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
   }
  }else{
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
  }

  if (req.body.search.value != '') {
    whereSelect = whereSelect + ` AND (L.name LIKE '%${req.body.search.value}%' OR L.loanAccountNo LIKE '%${req.body.search.value}%'
    OR L.phone LIKE '%${req.body.search.value}%')`
  }

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.loanType != '') {
    whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.loanType}`
  }

  if (filterData && filterData.amountMore != '' && filterData.amountLess == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount > ${filterData.amountMore}`
  }
  if (filterData && filterData.amountLess != '' && filterData.amountMore == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount < '%${filterData.amountLess}%'`
  }
  if (filterData && filterData.amountMore != '' && filterData.amountLess != '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount BETWEEN ${filterData.amountMore} AND ${filterData.amountLess}`
  }


  if (filterData && filterData.callStatus != '') {
    if(filterData.callStatus==1){
      whereSelect = whereSelect + ` AND L.dispositionId IS NULL`
    }else if(filterData.callStatus==7){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${7} OR L.dispositionId = ${21})`
    }else if(filterData.callStatus==8){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${8} OR L.dispositionId = ${22})`
    }else if(filterData.callStatus==9){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${9} OR L.dispositionId = ${23})`
    }else if(filterData.callStatus==10){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${10} OR L.dispositionId = ${24})`
    }else if(filterData.callStatus==12){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${12} OR L.dispositionId = ${25})`
    }else if(filterData.callStatus==13){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${13} OR L.dispositionId = ${26})`
    }else if(filterData.callStatus==14){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${14} OR L.dispositionId = ${27})`
    }else if(filterData.callStatus==15){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${15} OR L.dispositionId = ${28})`
    }else if(filterData.callStatus==16){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${16} OR L.dispositionId = ${29})`
    }else{
      whereSelect = whereSelect + ` AND L.dispositionId = ${filterData.callStatus}`
    }
    
  }

  if (filterData && filterData.DPDBucket != '') {
    whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.DPDBucket}'`
  }

  if (filterData && filterData.paymentStatus != '') {
    whereSelect = whereSelect + ` AND L.paymentStatus = '${filterData.paymentStatus}'`
  }

  if (filterData && filterData.EmployeeID != '') {
    let userId=await Users.findOne({ where : {employeeId : filterData.EmployeeID}});
    if(userId!=null){
     whereSelect = whereSelect + ` AND (L.telecallerId = '${userId.dataValues.id}' OR  L.fosId = '${userId.dataValues.id}')`
    }else{
      return res.status(200).json({
        title: 'Success',
        error: false,
        data: [],
        recordsFiltered: 0,
        recordsTotal: 0,
      });
    }
  }

  if (filterData && filterData.team != '') {
    whereSelect = whereSelect + ` AND (L.teamId = ${filterData.team} OR L.fosTeamId = ${filterData.team})`
  }

  if (filterData && filterData.telecaller != '') {
    whereSelect = whereSelect + ` AND L.telecallerId = ${filterData.telecaller}`
  }

  if (filterData && filterData.telecallerAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.telecallerId IS NOT NULL`
  }

  if (filterData && filterData.FOSAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.fosId IS NOT NULL`
  }
  
  if (filterData && filterData.from && filterData.to) {
    let todate = new Date(filterData.to);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + ` AND (L.createdAt >='${new Date(filterData.from).toISOString()}'  AND L.createdAt <= '${todate.toISOString()}')`
  }


  let totalTeamLeads=[];

  //for admin & business_head login

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let leadData;
    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName,CONCAT(UT.firstName, ' ', UT.lastName) as teamName,CONCAT(UFT.firstName, ' ', UFT.lastName) as FieldCoName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName, CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName, d.name as dispostion FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    LEFT JOIN teams as FT ON L.fosTeamId=FT.id
    LEFT JOIN users as UFT ON FT.teamLeaderId=UFT.id
    LEFT JOIN users as UTele ON L.telecallerId=UTele.id
    LEFT JOIN users as UFos ON L.fosId=UFos.id
    LEFT JOIN dispositions as d ON L.dispositionId=d.id
    WHERE `+ whereSelect +` group by L.loanAccountNo ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;

    console.log('\n\nLeads - StrQuery admin :-', StrQuery);
    
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    // console.log('\n\nLeads - temLeadsData admin :-', leadData);
    await Promise.all(leadData.map(async(lead) => {
      
      let loanAcontNo = '';
      if (req.permissionsList.includes('view')) {
        loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/assignLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
      }
    
      let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
      if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
        caseEventCheck +=lead.loanAccountNo;
        lead.loanAccountNo = caseEventCheck;
      }
      lead.loanAccountNo = loanAcontNo;
    }));
  
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leadData,
      recordsFiltered: (leadData[0]) ? leadData[0].countLead :0,
      recordsTotal: (leadData[0]) ? leadData[0].countLead :0,
    });
  }

  //for floor_manager & field_manager login

  if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
      let loginUserId=req.session.user.id;
      let reportingUsers = await Users.findAndCountAll({ where: {reportingTo : loginUserId} });
      whereSelect +=` AND (UT.reportingTo=${loginUserId} OR L.fosId=${loginUserId})`;
      let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName,CONCAT(UT.firstName, ' ', UT.lastName) as teamName,CONCAT(UFT.firstName, ' ', UFT.lastName) as FieldCoName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName,CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName,d.name as dispostion FROM leads as L 
      LEFT JOIN pools as P ON L.poolId=P.id
      LEFT JOIN fis as F ON L.FIId=F.id
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      LEFT JOIN teams as FT ON L.fosTeamId=FT.id
      LEFT JOIN users as UFT ON FT.teamLeaderId=UFT.id
      LEFT JOIN users as UTele ON L.telecallerId=UTele.id
      LEFT JOIN users as UFos ON L.fosId=UFos.id
      LEFT JOIN dispositions as d ON L.dispositionId=d.id
      WHERE `+ whereSelect + ' LIMIT '+ length + ' OFFSET ' + start;

      let temLeadsData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

      await Promise.all(temLeadsData.map(async(lead) => {
        let loanAcontNo = '';
        if(res.locals.roleName.name=='floor_manager'){
           loanAcontNo = '';
        }
        
        if (req.permissionsList.includes('view')) {
          loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/assignLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
        }

        if(res.locals.roleName.name=='field_manager' && lead.fosId==loginUserId){
          loanAcontNo += '(O)';
       }
        if(res.locals.roleName.name=='field_manager'){
          lead.checkbox = `<label><input type='checkbox' name="leadIds[]" class="CheckBox" value='${lead.loanAccountNo}'/><span></span></label>`
        }
        lead.loanAccountNo = loanAcontNo;
      }));

      return res.status(200).json({
        title: 'Success',
        error: false,
        data: temLeadsData,
        recordsFiltered:(temLeadsData[0]) ? temLeadsData[0].countLead :0,
        recordsTotal: (temLeadsData[0]) ? temLeadsData[0].countLead :0,
      });
    
  }

   //for team_leader & field_coordinator login

  if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){
    let leads;
    let loginUserId=req.session.user.id;
    whereSelect +=` AND UT.id=${loginUserId}`;
    whereSelect +=` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName,CONCAT(UT.firstName, ' ', UT.lastName) as teamName,CONCAT(UFT.firstName, ' ', UFT.lastName) as FieldCoName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName, CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName,d.name as dispostion FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    LEFT JOIN teams as FT ON L.fosTeamId=FT.id
    LEFT JOIN users as UFT ON FT.teamLeaderId=UFT.id
    LEFT JOIN users as UTele ON L.telecallerId=UTele.id
    LEFT JOIN users as UFos ON L.fosId=UFos.id
    LEFT JOIN dispositions as d ON L.dispositionId=d.id
    WHERE `+ whereSelect + ' LIMIT '+ length + ' OFFSET ' + start;
  
    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    await Promise.all(leads.map(async(lead) => {
    let loanAcontNo = '';
    if (req.permissionsList.includes('view')) {
      loanAcontNo += `<a class='dt-action text-capitalize' href='/leads/assignLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
    }
    //  let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
    //  if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
    //    caseEventCheck +=lead.loanAccountNo;
    //    lead.loanAccountNo = caseEventCheck;
    //  }
    lead.checkbox = `<label><input type='checkbox' name="leadIds[]" class="CheckBox" value='${lead.loanAccountNo}'/><span></span></label>`
    lead.loanAccountNo = loanAcontNo;
  }));

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leads,
    recordsFiltered: (leads[0])?leads[0].countLead:0,
    recordsTotal: (leads[0])?leads[0].countLead:0,
  });
  }

   //for telecaller login

  if(res.locals.roleName.name=='telecaller'){
    let telecallerId=user.id;
    whereSelect +=` AND L.telecallerId=${telecallerId}`;
    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName,CONCAT(UT.firstName, ' ', UT.lastName) as teamName,CONCAT(UFT.firstName, ' ', UFT.lastName) as FieldCoName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName,CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName,d.name as dispostion FROM leads as L 
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    LEFT JOIN teams as FT ON L.fosTeamId=FT.id
    LEFT JOIN users as UFT ON FT.teamLeaderId=UFT.id
    LEFT JOIN users as UTele ON L.telecallerId=UTele.id
    LEFT JOIN users as UFos ON L.fosId=UFos.id
    LEFT JOIN dispositions as d ON L.dispositionId=d.id
    WHERE `+ whereSelect + ' LIMIT '+ length + ' OFFSET ' + start;
    
    let leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    await Promise.all(leads.map(async(lead) => {
  
      let loanAcontNo = '';

      if (req.permissionsList.includes('view')) {
        loanAcontNo += `<a class='dt-action text-capitalize' href='/leads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
      }
    
       let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
       if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
         caseEventCheck +=lead.loanAccountNo;
         lead.loanAccountNo = caseEventCheck;
       }
      lead.loanAccountNo = loanAcontNo;
    }));
  
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leads,
      recordsFiltered: (leads[0])? leads[0].countLead :0,
      recordsTotal: (leads[0])? leads[0].countLead :0,
    });
  }
};

/*
# purpose:To Send Data in Datatables and handles List New Leads
*/

const leadslistNew = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObj;

  let whereQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');
  const FieldCoIndex = roles.findIndex((e) => e.name === 'field_coordinator');

  var whereSelect = 'L.isDeleted = 0';
  
  if(res.locals.roleName.name!='admin' && res.locals.roleName.name!='business_head'){
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
  } 

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.loanType != '') {
    whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.loanType}`
  }

  if (filterData && filterData.IDTo != '' && filterData.IDFrom == '') {
    whereSelect = whereSelect + ` AND L.srNo = ${filterData.IDTo}`
  }
  if (filterData && filterData.IDFrom != '' && filterData.IDTo == '') {
    whereSelect = whereSelect + ` AND L.srNo = ${filterData.IDFrom}`
  }
  if (filterData && filterData.IDTo != '' && filterData.IDFrom != '') {
    whereSelect = whereSelect + ` AND L.srNo BETWEEN ${filterData.IDFrom} AND ${filterData.IDTo}`
  }

  if (filterData && filterData.amountMore != '' && filterData.amountLess == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount > ${filterData.amountMore}`

  }
  if (filterData && filterData.amountLess != '' && filterData.amountMore == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount < '%${filterData.amountLess}%'`
  }
  if (filterData && filterData.amountMore != '' && filterData.amountLess != '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount BETWEEN ${filterData.amountMore} AND ${filterData.amountLess}`
  }

  if (filterData && filterData.DPDBucket != '') {
    whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.DPDBucket}'`
  }


  let totalTeamLeads=[];
  //for admin & business_head login
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    whereSelect = whereSelect + ` AND (L.telecallerId IS NULL AND L.fosId IS NULL)`
    let leadData;
    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName FROM leads as L 
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id 
    WHERE `+ whereSelect +` ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;

  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    await Promise.all(leadData.map(async(lead) => {
      
      let loanAcontNo = '';
      // if (req.permissionsList.includes('view')) {
      //   loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/newLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
      // }
    
      let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
      if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
        caseEventCheck +=lead.loanAccountNo;
        lead.loanAccountNo = caseEventCheck;
      }
      // lead.dataValues.loanAccountNo = loanAcontNo;
    }));
  
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leadData,
      recordsFiltered: (leadData[0]) ? leadData[0].countLead :0,
      recordsTotal: (leadData[0]) ? leadData[0].countLead :0,
    });
  }

  //for floor_manager login
  if(res.locals.roleName.name=='floor_manager'){
      let loginUserId=req.session.user.id;
      let leadData;
      let reportingUsers = await Users.findAndCountAll({ where: {reportingTo : loginUserId} });

      whereSelect +=` AND (L.telecallerId IS NULL AND L.fosId IS NULL)`;
      whereSelect +=` AND UT.reportingTo=${loginUserId}`;
      let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName FROM leads as L 
      LEFT JOIN pools as P ON L.poolId=P.id
      LEFT JOIN fis as F ON L.FIId=F.id
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ whereSelect +` ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;

      let temLeadsData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
     
      await Promise.all(temLeadsData.map(async(lead) => {
        let loanAcontNo = '';
        // if (req.permissionsList.includes('view')) {
        //   loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/newLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
        // }
        let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
        if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
          caseEventCheck +=lead.loanAccountNo;
          lead.loanAccountNo = caseEventCheck;
        }
        // lead.loanAccountNo = loanAcontNo;
      }));

      return res.status(200).json({
        title: 'Success',
        error: false,
        data: temLeadsData,
        recordsFiltered: (temLeadsData[0]) ? temLeadsData[0].countLead :0,
        recordsTotal:(temLeadsData[0]) ? temLeadsData[0].countLead :0,
      });
  }

 //for team_leader login
  if(res.locals.roleName.name=='team_leader'){
    let teamLeaderId=user.id;
    let leads;
    let loginUserId=req.session.user.id;
    whereSelect +=` AND UT.id=${loginUserId}`;
    whereSelect +=` AND (L.telecallerId IS NULL)`;
    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as pool,F.name as bankName FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect +` ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;
    
     leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
     await Promise.all(leads.map(async(totalTeamLead) => {
      let loanAcontNo = '';
      // if (req.permissionsList.includes('view')) {
      //   loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/newLeads/view/${totalTeamLead.loanAccountNo}'><b>${totalTeamLead.loanAccountNo}</b></a>`;
      // }
      let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
      if((totalTeamLead.createdAt==totalTeamLead.updatedAt) || moment(totalTeamLead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
        caseEventCheck +=totalTeamLead.loanAccountNo;
        totalTeamLead.loanAccountNo = caseEventCheck;
      }
      // totalTeamLead.loanAccountNo = loanAcontNo;
    }));
   
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leads,
      recordsFiltered: (leads[0])?leads[0].countLead:0,
      recordsTotal:  (leads[0])?leads[0].countLead:0,
    });
  }

};

/*
# purpose:To Send Data in Datatables and handles List Archive Leads
*/

const leadslistArchive = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObj;
 
  let whereQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  var whereSelect = 'L.isDeleted = 0';
  whereSelect=whereSelect+` AND L.expiryDate < '${todayDate}'`;

  if (req.body.search.value != '') {
    whereSelect = whereSelect + ` AND (L.name LIKE '%${req.body.search.value}%' OR L.loanAccountNo LIKE '%${req.body.search.value}%'
    OR L.phone LIKE '%${req.body.search.value}%')`
  }

  let totalTeamLeads=[];

  if(res.locals.roleName.name=='admin'){
    let leadData;

    let StrQuery=`SELECT (COUNT(*) OVER()) as countLead, L.*,P.fileName as bankName,F.name as pool,CONCAT(UT.firstName, ' ', UT.lastName) as teamName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName, CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN teams as T ON L.teamId=T.id
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    LEFT JOIN users as UTele ON L.telecallerId=UTele.id
    LEFT JOIN users as UFos ON L.fosId=UFos.id
    WHERE `+ whereSelect +` ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    // console.log('\n\nLeads - temLeadsData admin :-', leadData);
    await Promise.all(leadData.map(async(lead) => {
      
      let loanAcontNo = '';
      if (req.permissionsList.includes('view')) {
        loanAcontNo = `<a class='dt-action text-capitalize' href='/leads/archiveLeads/view/${lead.loanAccountNo}'><b>${lead.loanAccountNo}</b></a>`;
      }
    
      let caseEventCheck=`<span style="padding-right: 5px;">&#10004;</span>`;
      if((lead.createdAt==lead.updatedAt) || moment(lead.updatedAt, "YYYY-MM-DD").format('DD-MM-YYYY')==moment(new Date()).format('DD-MM-YYYY')){
        caseEventCheck +=lead.loanAccountNo;
        lead.loanAccountNo = caseEventCheck;
      }
      lead.loanAccountNo = loanAcontNo;
    }));
  
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leadData,
      recordsFiltered: (leadData[0]) ? leadData[0].countLead :0,
      recordsTotal: (leadData[0]) ? leadData[0].countLead :0,
    });
  }

};

/*
# purpose:To get add lead page
*/

const addLeads = async (req, res) => {
  res.render('admin/components/leads/add_leads');
};

/*
# purpose:To get upload lead page 
*/

const uploadLeads = async (req, res) => {
  const payload = {};
  payload.toast = false;
  payload.toastColor = 'green'
  payload.toastText = '';

  res.render('admin/components/leads/leads_upload', payload);
};

/*
# purpose:To upload Pool(Leads) data
*/

const uploadFile = async (req, res) => {
  let isError = false;
  let errorList = [];
  let sampleFile;
  let uploadPath;
  let totalPoolAmount = 0;
  let totalLeads = 0;
  let locationArray = [];
  let fisId = parseInt(req.body.FIId);
  let productId = parseInt(req.body.productTypeId);
  let headerLineNo = 0;
  let rowLineNo = 0;
  let srNumber=1;
  let isParsingError = false;
  let isLoanCheck = [];
  let arr = [];
  // const csvName = randomstring.generate(8);
  const ext = '.csv';
  let fileType = req.files.leads_csv.mimetype;
  sampleFile = req.files.leads_csv;
  const campaignData = {
    campaignId: '',
    endDate: moment(req.body.end_date, "YYYY-MM-DD").format('YYYY-MM-DD'),
  };
  const user_name = req.session.user;
  const fisData = await Fis.findOne({ where: { id: fisId } });
  const userData = {
    name: user_name.firstName,
    fileName: req.files.leads_csv.name,
    bankName: fisData.name,
    endDate: moment(req.body.end_date, "YYYY-MM-DD").format('DD-MM-YYYY'),
    startDate: moment(req.body.startDate, "YYYY-MM-DD").format('DD-MM-YYYY'),
  };
  if (fileType !== 'application/octet-stream' && fileType !== 'application/csv' && fileType !== 'text/csv' && fileType !== 'application/vnd.ms-excel') {
    const fisDatas = await Fis.findAll({ where: {} });
    const productType = await ProductType.findAll({ where: { } });
    const payload = {};
    payload.fisDatas = fisDatas;
    payload.productType = productType;
    payload.toast = true;
    payload.toastText = 'Please upload only CSV file!';
    res.render('admin/components/sourcing/leads_upload', payload);
  } else {
    uploadPath = `./uploads/csv_folder/${req.files.leads_csv.name}`;//to save file path in csv_folder
    uploadHandler.createDir('./uploads/csv_folder/');//if path not exist then create new path
    await sampleFile.mv(uploadPath, async (err) => { //move file in exist path
        if (err || err !== undefined) {
          const fisDatas = await Fis.findAll({ where: {} });
          const productType = await ProductType.findAll({ where: { } });
          const payload = {};
          payload.fisDatas = fisDatas;
          payload.productType = productType;
          payload.toast = true;
          payload.toastText = 'Error in File Uploading Please Check File Uploading Path!';

          res.render('admin/components/sourcing/leads_upload', payload);
        } else {
          let bulkupload = [];
          let headerMatch = true;
          const fileName = sampleFile.name;
          let leadsUpload = await LeadsUploads.findOne({ where: {} });
          // await Campaigns.update({endDate:campaignData.endDate, status: 'Active'}, {where: { id: campaignData.campaignId }});
          // let upload_id = leadsUpload.dataValues.id;
          let upload_id = 0;
          const path2 = path.join(path.dirname(__dirname), uploadPath);
          let stream = fs.createReadStream(path2);//read csv file data
          stream.pipe(csv.parse({ headers: true }))//parse csv file data
            .on('error', async (error) => {
              if (error) {
                isParsingError = true;
                const fisDatas = await Fis.findAll({ where: {} });
                const productType = await ProductType.findAll({ where: { } });
                const payload = {};
                payload.fisDatas = fisDatas;
                payload.productType = productType;
                payload.toast = true
                payload.toastText = 'Error in CSV Parsing While File Reading from uploading CSV file. Please check file data!';
              }
            }).on('headers', (headers) => {
            let clientHeaders=headers.map(header => header.toLowerCase());
            let headArray = [
              'allocation date', 'loan id', 'applicant name', 'contact number', 'total claim/due amount', 'principal outstanding amount', 'interest due amount',
              'late fee/penal amount', 'applicant pincode',
              'pan card number', 'applicant date of birth', 'email', 'product type', 'total loan amount', 'emi due amount', 'emi amount', 'card outstanding amount', 'date of default/due date',
              'minimum due amount', 'last payment date', 'last payment mode', 'last paid amount', 'allocation dpd', 'allocation dpd bucket', 'loan disbursement date', 'disbursement type',
              'loan type', 'loan maturity date', 'tenure finished' ,'applicant cibil score' ,'business name' ,'applicant address type' ,'applicant address',
              'applicant city', 'applicant state', 'applicant alternate address type', 'applicant alternate address', 'applicant alternate city',
              'applicant alternate state', 'applicant alternate pincode' ,'reference 1 relation with applicant', 'reference 1 name', 'reference 1 mobile' ,'reference 2 relation with applicant'
              ,'reference 2 name' ,'reference 2 mobile' ,'reference 3 relation with applicant' ,'reference 3 name' ,'reference 3 mobile' ,'alternate mobile 1' ,
              'alternate mobile 2' ,'alternate mobile 3', 'make and model', 'chassis number', 'engine number', 'vehicle registration number', 'co applicant name' ,
              'co applicant email', 'co applicant contact number', 'co applicant dob', 'co applicant address type', 'co applicant address', 'co applicant city',
              'co applicant state' ,'co applicant pincode', 'band', 'allocation agent id'
            ]
            //match header of csv files
            headArray.map((header) => {
                if (!clientHeaders.includes(header)) { // check if incoming headers are matching
                  isError = true;
                  headerLineNo++;
                  headerMatch = false;
                  errorList.push(
                    {
                      LineNo: 0,
                      Error: header + ' header is not matching to given template'
                    }
                  );
                }
              });
            })
            .on('data', async (row) => {
              if (row) {
                arr.push(row);
              }
            })
            .on('end', async () => {
              let total = arr.reduce((acc, current) => acc + (current['Total Claim/Due Amount'] ? parseInt(current['Total Claim/Due Amount']) : 0), 0); 
              console.log("total:---",total);
              if(errorList.length == 0){
             //to find no of leads from each uniqs Location
                let uniqsLocation = {};

                if (!locationArray.includes(undefined) && locationArray != null && locationArray.length > 0) {

                  let arrLocation = locationArray.map(ele => ele.replace("\n", "").toUpperCase());
                  uniqsLocation = arrLocation.reduce((acc, val) => {
                    acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
                    return acc;
                  }, {});
                }
                userData.productId=productId;
                userData.totalPoolAmount = total;
                userData.totalLeads = arr.length;
                userData.locationArray = JSON.stringify(uniqsLocation);
                let leadData;
                if (isError) { //if headers don't match
                  userData.isErrorcheck = 'true';
                  userData.status = 'failed';
                  userData.errors = JSON.stringify(errorList);
                  await leadsSource.createSource(userData);
                  fs.unlinkSync(`./uploads/csv_folder/${req.files.leads_csv.name}`);
                  const PoolId = await Pools.findOne({ where: { fileName: fileName, status: 'Failed' },
                  order: [ ['createdAt', 'DESC'] ] });
                  viewId = PoolId.id;
                  const payload = {};
                  payload.errorList = errorList;
                  payload.toast = false;
                  payload.toastText = '';
                  res.redirect('/sourcing/failedLeads/view/' + viewId);
                } else {
                  if (!isError && isLoanCheck.length == 0) { //if no error found keep the pool in processing state
                    userData.isErrorcheck = 'false';
                    userData.status = 'Processing';
                    userData.errorList = '';
                    leadData = await leadsSource.createSource(userData);
                  }
                }
                const PoolId = await Pools.findOne({ where: { fileName: fileName, status: 'Processing' },order: [ [ 'createdAt', 'DESC' ]], });

                if (!isError) {
                  viewId = PoolId.id;
                  res.redirect('/sourcing/successLeads/view/' + viewId);
                  tempLeadsValidation(PoolId, arr, req); // validate leads in background and insert to lead table
                }
              }else{
                  //to find no of leads from each uniqs Location
                let uniqsLocation = {};

                if (!locationArray.includes(undefined) && locationArray != null && locationArray.length > 0) {
                  // console.log(locationArray);
                  // console.table(locationArray);

                  let arrLocation = locationArray.map(ele => ele.replace("\n", "").toUpperCase());
                  uniqsLocation = arrLocation.reduce((acc, val) => {
                    acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
                    return acc;
                  }, {});
                }

                userData.productId=productId;
                userData.totalPoolAmount = total;
                userData.totalLeads = arr.length;
                userData.locationArray = JSON.stringify(uniqsLocation);
                userData.isErrorcheck = 'true';
                userData.status = 'failed';
                userData.errors = JSON.stringify(errorList);
                await leadsSource.createSource(userData);
                fs.unlinkSync(`./uploads/csv_folder/${req.files.leads_csv.name}`);
                const PoolId = await Pools.findOne({ where: { fileName: fileName, status: 'Failed' },
                order: [ ['createdAt', 'DESC'] ] });
                viewId = PoolId.id;
                const payload = {};
                payload.errorList = errorList;
                payload.toast = false;
                payload.toastText = '';
                res.redirect('/sourcing/failedLeads/view/' + viewId);
              }
            }).once("close", async () => {
              if (isParsingError) {
                stream.destroy();

                deleteFile(path2);
                const fisDatas = await Fis.findAll({ where: {} });
                const productType = await ProductType.findAll({ where: { } });
                const payload = {};
                payload.fisDatas = fisDatas;
                payload.productType = productType;
                payload.toast = true
                payload.toastText = 'Error in CSV Parsing While File Reading from uploading CSV file. Please check file data!';
                return res.render('admin/components/sourcing/leads_upload', payload);
              } else {
                console.log('\n\n File uploaded successfully!');
              }
            });
        }
      });
    
  }
};

/*
# purpose:To validate upload Pool(Leads) data
*/

const tempLeadsValidation = async(poolData, row, req) => {
  // console.log('-=-=-=-==poolData-=-=-=-=-=-=-=',poolData,row.length)
  const dpdBucket = await DPDBucket.findAll({ where: { } });
  let errorList = [];
  let locationArray = [];
  let isError = false;
  let rowLineNo = 1;
  let srNumber=1;
  let totalPoolAmount = 0;
  let user_name = req.session.user;
  let totalLeads = 0;
  let isLoanCheck = [];
  let fisData = await Fis.findOne({ where: { id: parseInt(req.body.FIId) } });
  let userData = {
    name: user_name.firstName,
    fileName: req.files.leads_csv.name,
    bankName: fisData.name,
    endDate: moment(req.body.end_date, "YYYY-MM-DD").format('DD-MM-YYYY'),
    startDate: moment(req.body.startDate, "YYYY-MM-DD").format('DD-MM-YYYY'),
  };

  let fisId = parseInt(req.body.FIId);
  let productId = parseInt(req.body.productTypeId);
  
    for (let i = 0; i < row.length; i++) {
    
      if (row[i] && errorList.length == 0 && !isError) {
        let rowName = Object.keys(row[i]);
        rowLineNo++;
        
        let loanNo = row[i]['Loan Id'];
        //to check values of mandatory fiels in csv file
        let field = [
          'Allocation Date', 'Loan Id', 'Applicant Name', 'Contact Number', 'Total Claim/Due Amount', 'Interest Due Amount',
          'Late Fee/Penal Amount', 'Applicant Pincode'];
        field.forEach(element => {
          if (rowName.includes(element)) { // check if particular row is not empty
            if (!row[i][element]) {
              isError = true;
              errorList.push({
                LineNo: rowLineNo,
                Error: element.toLowerCase() + ' value is empty'
              });
              
            }
          }
        });
        if(errorList.length > 0){ // break the loop if row is empty OR allocated agent not found OR agent team not found
          break;
        }
// to handle dpd buckets with each Allocation DPD range in given csv
        let dpdBucketNew;
        await dpdBucket.forEach(dpd => {
          if(row[i]['Allocation DPD']<=365){
            let newDPD=dpd.name.split('-');
            if(row[i]['Allocation DPD'] >=newDPD[0] && row[i]['Allocation DPD'] <=newDPD[1]){
                  dpdBucketNew=dpd.shortName;
            }
          }else{
            dpdBucketNew='Write-Off';
          }
        });
    //mapping leads data from csv file to save in leads tables
        let data = {
          srNo: srNumber++,
          name: row[i]['Applicant Name'],
          FIId: fisId,
          productTypeId:productId,
          cityId: null,
          phone: row[i]['Contact Number'],
          email: row[i].Email,
          address: row[i]['Applicant Address'],
          pos: row[i]['Principal Outstanding Amount'],
          applicantPincode: row[i]['Applicant Pincode'],
          amountOutstanding: row[i]['Card Outstanding Amount'] ? Number(row[i]['Card Outstanding Amount']) : 0,
          disbursementDate: row[i]['Loan Disbursement Date'] ? row[i]['Loan Disbursement Date'] : null ,
          daysDue: 0,
          loanAccountNo: fisData.shortName+new Date().getYear()+new Date().getMonth()+'-'+ row[i]['Loan Id'],
          loanId:row[i]['Loan Id'],
          emiStartDate: row[i]['Loan Disbursement Date'] ? row[i]['Loan Disbursement Date'] : null, 
          penaltyAmount: row[i]['Late Fee/Penal Amount']? Number(row[i]['Late Fee/Penal Amount']) :0,
          ODValue: row[i]['Total Claim/Due Amount'],
          ODInt: row[i]['Interest Due Amount'],
          poolId: poolData.id,
          telecallerAssigned: null,
          DPDBucket: dpdBucketNew,
          reminderDate: null,
          closeStatus: null,
          fieldVisitStatus: null,
          FOSAssigned: null,
          transactionType: null,
          chequeNo: null,
          chequeDate: null,
          chequeBank: null,
          transactionNo: null,
          imageVerified: null,
          locationVerified: null,
          intendToPay: null,
          abilityToPay: null,
          expiryDate: new Date(req.body.end_date), 
          amountCollected:0,
          allocationDate: row[i]['Allocation Date'],
          applicantPanNumber: row[i]['PAN Card Number'] ? Number(row[i]['PAN Card Number']) :0, 
          applicantDob: row[i]['Applicant Date Of Birth'] ? row[i]['Applicant Date Of Birth'] : null, 
          emiDueAmount: row[i]['EMI Amount'] ? Number(row[i]['EMI Amount']) :0, 
          dateOfDefault: row[i]['Date Of Default/Due Date'] ?  row[i]['Date Of Default/Due Date'] : null,
          allocationDpd: row[i]['Allocation DPD'] ? Number(row[i]['Allocation DPD']) :0, 
          disbursementType: row[i]['Disbursement Type'],
          loanType: row[i]['Loan Type'], 
          tenureFinished: row[i]['Tenure Finished'] ? row[i]['Tenure Finished'] : null, 
          applicantCibilScore: row[i]['Applicant Cibil Score'] ? Number(row[i]['Applicant Cibil Score']) :0,
          applicantAddressType: row[i]['Applicant Address Type'],
          applicantAltAddressType: row[i]['Applicant Alternate Address Type'],
          applicantAltCity: row[i]['Applicant Alternate City'], 
          applicantAltState: row[i]['Applicant Alternate State'],
          applicantAltPincode: row[i]['Applicant Alternate Pincode'],
          refRelationWithApplicant_1: row[i]['Reference 1 Relation With Applicant'],
          refContactNumber_1: row[i]['Reference 1 Mobile'],
          refRelationWithApplicant_2: row[i]['Reference 2 Relation With Applicant'],
          refContactNumber_2: row[i]['Reference 2 Mobile'],
          refRelationWithApplicant_3: row[i]['Reference 3 Relation With Applicant'],
          refContactNumber_3: row[i]['Reference 3 Mobile'],
          engineNumber: row[i]['Engine Number'],
          vehicleRegistrationNumber: row[i]['Vehicle Registration Number'],
          coApplicantName: row[i]['Co Applicant Name'],
          coApplicantEmail: row[i]['Co Applicant Email'],
          coApplicantContactNumber: row[i]['Co Applicant Contact Number'],
          coApplicantDob: row[i]['Co Applicant Dob'],
          coApplicantAddressType: row[i]['Co Applicant Address Type'],
          coApplicantAddress: row[i]['Co Applicant Address'],
          coApplicantCity: row[i]['Co Applicant City'],
          coApplicantState: row[i]['Co Applicant State'],
          coApplicantPincode: row[i]['Co Applicant Pincode'],
          band: row[i]['Band'],
          paymentStatus:'pending',
          totalLoanAmount: row[i]['Total Loan Amount'] ? Number(row[i]['Total Loan Amount']) :0, 
          totalDueAmount: row[i]['Total Claim/Due Amount'] ? Number(row[i]['Total Claim/Due Amount']) :0, 
          principalOutstandingAmount: row[i]['Principal Outstanding Amount'] ? Number(row[i]['Principal Outstanding Amount']) :0,
          interestDueAmount: row[i]['Interest Due Amount'] ? Number(row[i]['Interest Due Amount']) :0, 
          penalAmount: row[i]['Late Fee/Penal Amount'] ? Number(row[i]['Late Fee/Penal Amount']) :0, 
          emiAmount: row[i]['EMI Amount'] ? Number(row[i]['EMI Amount']) :0,
          allocationDpdBucket: row[i]['Allocation DPD Bucket'], 
          loanDisbursementDate: row[i]['Loan Disbursement Date'] ? row[i]['Loan Disbursement Date'] : null,
          loanMaturityDate: row[i]['Loan Maturity Date'] ? row[i]['Loan Maturity Date'] :null,
          businessName: row[i]['Business Name'], 
          applicantAddress: row[i]['Applicant Address'], 
          applicantCity: row[i]['Applicant City'], 
          applicantState: row[i]['Applicant State'], 
          applicantAltAddress: row[i]['Applicant Alternate Address'], 
          refName_1: row[i]['Reference 1 Name'], 
          refName_2: row[i]['Reference 2 Name'], 
          refName_3: row[i]['Reference 3 Name'], 
          applicantAlternateMobile_1: row[i]['Alternate Mobile 1'], 
          applicantAlternateMobile_2: row[i]['Alternate Mobile 2'],
          applicantAlternateMobile_3: row[i]['Alternate Mobile 3'], 
          makeAndModel: row[i]['Make And Model'],
          chassisNumber: row[i]['Chassis Number'],
          key: fisData.shortName + row[i]['Loan Id'],
          requestReassign:'false',
          fosTeamId:null
        };

        let agentID = row[i]['Allocation Agent Id'];
        let foundAgent;

        if (agentID && agentID != '') { // if agent ID is present in that lead
          foundAgent = await Users.findOne({ where: { employeeId: agentID }, include: [{ model: Roles, as: 'roles' }]});
          if (foundAgent !== '' && foundAgent != null) {
            let team = await TeamMember.findOne({ where: { userId: foundAgent.id } });
            if(foundAgent.roles.name == 'fos'){
              data.fosId = foundAgent.id;
              data.fosTeamId = team ? team.teamId : null;
              data.fosAssignedDate = new Date();
            }
            if(foundAgent.roles.name == 'telecaller'){
              data.telecallerId = foundAgent.id;
              data.teamId = team ? team.teamId : null;
              data.telecallerAssignedDate = new Date();
            }
            if(!team){ // if agent Id is present in lead but agent doesn't have belong to any team
              isError = true;
              errorList.push({
                LineNo: data.srNo,
                Error: `${agentID} do not belong to any team kindly assign user to team and try again!`
              });  
              break; 
            }
          } else { // if agent ID is present in that lead but not in system
            isError = true;
            errorList.push({
              LineNo: data.srNo,
              Error: `Allocated agent not found: ${agentID}`
            });
            break;
          }
        }
        let count = 0;
        Locations = (row[i]['Applicant State'] !='' && row[i]['Applicant State']!=null)?row[i]['Applicant State']:'N/A';
        locationArray.push(Locations);
        totalPoolAmount =totalPoolAmount + parseInt(row[i]['Total Loan Amount']);
        totalLeads++;
        const customer = {
          bankName: userData.bankName,
          name: row[i]['Applicant Name'],
          email: row[i].Email,
          primaryPhone: row[i]['Contact Number'],
          secondaryPhone: row[i]['Alternate Mobile 1'],
          primaryAddress: row[i]['Applicant Address'],
          secondaryAddress: row[i]['Applicant Alternate Address'],
          amountDue: row[i]['Total Claim/Due Amount'],
          loanAccountNo: row[i]['Loan Id'],
          status: '',
        };
        if (!isError && isLoanCheck.length == 0 && errorList.length == 0) { // if no errors found insert this lead
          Leads.create(data)
        }
      } 
    }
    
    if (!locationArray.includes(undefined) && locationArray != null && locationArray.length > 0) {
      

      let arrLocation = locationArray.map(ele => ele.replace("\n", "").toUpperCase());
       uniqsLocation =await arrLocation.reduce((acc, val) => {
        acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
        return acc;
      }, {});
    }

    if(!isError && isLoanCheck.length == 0 && errorList.length == 0){ // if error found mark the pool as success from processing
      let update1 = {}
      
      update1.location = JSON.stringify(uniqsLocation);
      update1.isErrorcheck = 'true';
      update1.status = 'success';
     
     await LeadsUploads.update(update1, {
        where: { id: poolData.id },
      }).then(result => result).catch((err) => {
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=err-=->',err)
      });
    }else{ // if error, mark the pool as failed and delete all the leads which where inserted
      
      let uniqsLocation = {};
      
      let update1 = {}
      update1.location = JSON.stringify(uniqsLocation);
      update1.isErrorcheck = 'true';
      update1.status = 'failed';
      update1.errors = JSON.stringify(errorList);
      fs.unlinkSync(`./uploads/csv_folder/${req.files.leads_csv.name}`);
      Leads.destroy({where: { poolId: poolData.id }})
      LeadsUploads.update(update1, {
        where: { id: poolData.id },
      }).then(result => result).catch((err) => {
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=err-=failed->',err)
      });
    }
}

/*
# purpose:To get Leads data
*/

const getuploadLeads = (req, res) => {
  Leads.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving tutorials.',
      });
    });
};

/*
# purpose:To view leads page and handles view leads
*/

const viewLeadsDetails = async (req, res) => {
  const { loanAccountNo } = req.params;


  const leads = await Leads.findOne({ where: { loanAccountNo } });
  const collectionStatus = await CollectionStatus.findAll({ where: { } });
  const callStatus = await CallStatus.findAll({ where: { } });
  let whereQueryStatus={};
  if(res.locals.roleName.name=='team_leader'){
    whereQueryStatus.isDeleted=0;
    whereQueryStatus.type='Telecaller';
  }else{
    whereQueryStatus.isDeleted=0;
    whereQueryStatus.name={ [Op.ne]:  'Closed/DND (Do Not Disturb)'};
    whereQueryStatus.type='Telecaller';
  }
  let newLeadContact=[];
  const leadsContact = await leadsContactUpdate.findAll({ where: { leadId:loanAccountNo } });
  const Dispositions = await Disposition.findAll({ where: whereQueryStatus });
  const SubDispositions = await SubDisposition.findAll({ where: { } });
  const dpdBucket = await DPDBucket.findOne({ where: { shortName:leads.dataValues.DPDBucket } });
  const caseEvents = await CaseEvent.findAll({ where: { leadId:loanAccountNo },order: [['updatedAt', 'DESC']], });
  const payments = await Payment.findOne({ where: { leadId:loanAccountNo } });
  const paymentData = await Payment.findAll({ where: { leadId:loanAccountNo } });
  const CaseEventSupportingS = await CaseEventSupporting.findAll({ where: { leadId:loanAccountNo } });
  const dispositionName = await Disposition.findOne({ where: { id:leads.dataValues.dispositionId } });
  const SubDispositionsName = await SubDisposition.findOne({ where: { id:leads.dataValues.subDispositionId } });
  const productType = await ProductType.findOne({ where: { id:leads.dataValues.productTypeId } });
  const fis = await Fis.findOne({where:{id:leads.dataValues.FIId}});
  const script = await Script.findAll({ where: { type: productType.shortName} });
  const languages = await Language.findAll({ where: { } });
  let StrQuery=`SELECT CE.* FROM caseEvents as CE
  WHERE  CE.leadId='${loanAccountNo}'`;

  let caseEventDetails= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

  //Suporting Documents
  let supportingFiles=[];
  await Promise.all(CaseEventSupportingS.map(async(caseEventFile)=>{
    supportingFiles.push({
        caseEventId:caseEventFile.caseEventId,
        fileName:caseEventFile.image,
        fileUrl: process.env.baseUrl + "supportings/" + caseEventFile.image
      });
  }));

  await Promise.all(caseEventDetails.map(caseEvent => {
    let checkFile= supportingFiles.find(val => val.fileName === caseEvent.fileName);
      if(caseEvent.fileName!='' && !checkFile ){
        supportingFiles.push({
          caseEventId:caseEvent.id,
          fileName:caseEvent.fileName,
          fileUrl: process.env.baseUrl + "supportings/" + caseEvent.fileName
        });
      }
  }));

//payment supporting
  await Promise.all(paymentData.map(async(paymentdata)=>{
    let checkFile= supportingFiles.find(val => val.fileName === paymentdata.dataValues.supporting);

    if(paymentdata.supporting!='' && !checkFile && checkFile==undefined){
       supportingFiles.push({
         caseEventId:paymentdata.dataValues.caseEventId,
         fileName:paymentdata.dataValues.supporting,
         fileUrl: process.env.baseUrl + "supportings/" + paymentdata.dataValues.supporting
       });
     }
   }));

   //Lat Land Location
  let CheckInLocation=[];
  await Promise.all(caseEvents.map(async(caseEvent)=>{
    let checkFile= CheckInLocation.find(val => val.latLandCode === caseEvent.dataValues.location);

    if(caseEvent.dataValues.location!='' && caseEvent.dataValues.location!=null && !checkFile ){
      CheckInLocation.push({
        caseEventId:caseEvent.dataValues.id,
        latLandCode:caseEvent.dataValues.location,
      });
    }
  }));

  await Promise.all(caseEventDetails.map((caseEvent)=>{
    supportingFiles.forEach(supportFile => {
      if(supportFile.caseEventId==caseEvent.id){
        caseEvent.supportingFile=supportingFiles;
        caseEvent.PaymentDetail=(payments!=null) ? payments.dataValues : '';
        caseEvent.CheckInLocation=CheckInLocation;
      }
    });
  }));

 //new Contact details
 await Promise.all(leadsContact.map(async(newContact)=>{
  newLeadContact.push({
        type:newContact.type,
        content:newContact.content
      });
}));

 //table for Lead history
  const AjaxColumnsLeadsHistory = [
    { title: 'Date', data: 'createdAt' },
    { title: 'Disposition', data: 'dispositionName' },
    { title: 'Additional Info', data: 'additional' },
    { title: 'Comments', data: 'comments' },
  ];

  const apiUrlLeadsHistory = 'leads/leadHistory';

  const payload = {};

  payload.datatable = {
    columns: AjaxColumnsLeadsHistory,
    apiUrl:apiUrlLeadsHistory,
    id:loanAccountNo
  };

  payload.deleteText = 'Are you sure you want to delete this lead?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  if(req.session.toastTxt!=undefined && req.session.toastTxt!=null && req.session.toastTxt!=''){
    payload.toast = true
    payload.toastColor = 'green'
    payload.toastText = req.session.toastTxt;
    req.session.toastTxt=null;
  }

  payload.leads = leads.dataValues;
  payload.amountCollected = leads.dataValues.ODValue-leads.dataValues.amountCollected;
  if(leadsContact){
    payload.leadsContact=(leadsContact.type=='mobile')? leadsContact.content:leadsContact.content;
  }
  payload.productType=productType.name;
  payload.fisName=fis.name;
  payload.script=script;
  
  payload.collectionStatus = collectionStatus;
  payload.caseEvents=caseEvents;
  payload.caseEventDetails=caseEventDetails;
  payload.supportingFiles=supportingFiles;
  payload.CheckInLocation=CheckInLocation;
  payload.newLeadContact=newLeadContact;
  payload.payments=payments;
  payload.callStatus = callStatus;
  payload.Dispositions = Dispositions;
  payload.languages=languages;
  payload.DispositionName = (dispositionName) ? dispositionName.name: 'Fresh';
  payload.dpdBucket=(dpdBucket)?dpdBucket.name:'';
  payload.SubDispositions = SubDispositions;
  payload.SubDispositionsName = (SubDispositionsName) ? SubDispositionsName.name :'N/A';
  payload.moment=moment;
  res.render('admin/components/leads/view_leads', payload);
};

/*
# purpose:To Add Telecallers in leads assign to popup
*/

const leadsAddTelecallers = async (req, res) => {
  
  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'team_leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'fos');

  const role = await Roles.findOne({ where: { name: "telecaller" } });
  

  let TeamID = req.body.search.value;
  
  let telecallers = []
   if (req.body.search.value && req.body.search.value != '') {
       telecallers = await TeamMember.findAll({ where: {teamId: TeamID}, include: [{ model: Users, as: 'user' }] });
    }  

  await Promise.all(telecallers.map(async (tele) => {
    let whereQuery = {}
    let DpdExp='';
    whereQuery[Op.or] = [{ telecallerId: tele.dataValues.user.id }, { fosId: tele.dataValues.user.id }];
    let leads = await Leads.findAll({ where: whereQuery });
    let closeLeadData= await Leads.findAndCountAll({where: {telecallerId : tele.dataValues.user.id , paymentStatus:'paid'}, attributes: [
      [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount']
  ], logging: console.log });
    let closedLead=(closeLeadData.count > 0)? closeLeadData.rows[0].dataValues.leadCount : 0 ;
    let dpdExp=await UserExperience.findAll({ where: { userId:tele.dataValues.user.id} });
    
    await Promise.all(dpdExp.map(async(dpdExps,index) => {
        let productType=await ProductType.findOne({where :{ name: dpdExps.productType }})
        if(index==dpdExp.length-1){
          DpdExp+=productType.dataValues.shortName +'('+ dpdExps.dpd+')'
        }else{
          DpdExp+=productType.dataValues.shortName +'('+ dpdExps.dpd+'), '
        }
    }));
   
    tele.dataValues.totalLeads = leads.length;
    tele.dataValues.Name=tele.user.firstName+" "+tele.user.lastName +"("+tele.user.employeeId+")";
    tele.dataValues.DpdExperience=DpdExp;
    tele.dataValues.closeLeads=closedLead;
    tele.dataValues.exp = `${ (tele.user.experience > 12 && tele.user.experience % 12 != 0) ? 
      Math.floor(tele.user.experience/12) + ' year, '+ (tele.user.experience%12) + ' months' :
      (tele.user.experience > 12 && tele.user.experience % 12 == 0) ? (tele.user.experience/12) + ' years' :
      tele.user.experience + ' months'} `;
    tele.dataValues.radioButton = `<label><input class='checkId' name="group1" value="${tele.dataValues.user.id}" type="radio"/><span></span></label>`;
  })) 
   
  
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: telecallers,
    recordsFiltered: telecallers.length,
    recordsTotal: telecallers.length
  });
}

/*
# purpose: to get edit leads page
*/

const editLeadsDetails = async (req, res) => {
  const { loanAccountNo } = req.params;

  const leads = await Leads.findOne({ where: { loanAccountNo } });

  const payload = {};
  payload.leads = leads.dataValues;

  res.render('admin/components/leads/edit_leads', payload);
};

/*
# purpose:To update leads 
*/

const updateLeadsDetails = async (req, res) => {

  const { loanAccountNo } = req.params;
  await Leads.update(req.body, {
    where: { loanAccountNo },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/leads');
      } else {
        res.send({
          message: `Cannot update Contact with id='${loanAccountNo}'. Maybe Contact was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Contacts.',
      });
    });
};

/*
# purpose:To delete lead 
*/

const deleteLeads = async (req, res) => {

  const { teamId } = req.body;
  

  const result = await Leads.update({ isDeleted: 1 }, { where: { loanAccountNo: teamId } });


  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose:To view lead history page 
*/

const leadHistory = async (req, res) => {
 
  const user = req.session.user;

  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObj;
  
  let whereQuery = {};
  whereQuery.leadId=req.body.id;
  

  var leadsHistoryData = await CaseEvent.findAll({ where: whereQuery, limit: length, offset: start })
  
    await Promise.all(leadsHistoryData.map(async(leadsData)=>{
    let dateTime='';
    dateTime = moment(leadsData.dataValues.createdAt).format('MM-DD-YYYY');
    dateTime +=`<br>${moment(leadsData.dataValues.createdAt).format('hh:mm:ss A')}`;
    leadsData.dataValues.createdAt=dateTime;
    var fileUrl = process.env.baseUrl + "supportings/" + leadsData.dataValues.fileName
    
    let additionalInfo=[];
    let additional={};
    if(leadsData && leadsData.dataValues.additionalField!=null){
      additional=JSON.parse(leadsData.dataValues.additionalField);
    }
    let additionInfo='';
    console.log("addition----",leadsData.dataValues.additionalField);
    console.log("addition typeof----",typeof(leadsData.dataValues.additionalField));
    console.log("addition location----",leadsData.dataValues.location);
    Object.keys(additional).forEach(function(key) {
      additionInfo +=`<br>${key.replace('_',' ').toLowerCase().split(' ').map((word)=> {return word[0].toUpperCase() + word.substr(1);}).join(" ")} : ${additional[key]}`;
    })
    leadsData.dataValues.additional=additionInfo;
    leadsData.dataValues.fileName = `<a href='${fileUrl}' target='_blank'>${leadsData.dataValues.fileName}</a>`
    const Dispositions = await Disposition.findOne({ where: { id:leadsData.dataValues.dispositionId } });
    const SubDispositions = await SubDisposition.findOne({ where: { id:leadsData.dataValues.subDispositionId} });
    let actions = '';
    if((leadsData &&  Object.keys(additional).length != 0) || (leadsData && leadsData.dataValues.location!=null) ){
      if(leadsData.dataValues.additionalField!=null || leadsData.dataValues.location!=null){
        actions += `<a class="histPop dt-action text-capitalize modal-trigger pointer" href="#leadHistoryModal-${leadsData.dataValues.id}" data-eventId=${leadsData.dataValues.id}>${Dispositions.dataValues.name}</a>`;
      }else{
        actions += `<a class="dt-action text-capitalize modal-trigger" style="color: gray;" href="javascript:void(0)">${Dispositions.dataValues.name}</a>`;
      }
    }else{
      actions += `<a class="dt-action text-capitalize modal-trigger" style="color: gray;" href="javascript:void(0)">${Dispositions.dataValues.name}</a>`;
    }
    
    let DispositionsName=actions;
    DispositionsName +=`<br><span style="font-size: 12px;">${(SubDispositions && SubDispositions.dataValues.name)?SubDispositions.dataValues.name:''}</span>`;
    leadsData.dataValues.dispositionName=DispositionsName;
  }));

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leadsHistoryData,
    recordsFiltered: leadsHistoryData.length,
    recordsTotal: leadsHistoryData.length,
  });

};

/*
# parameters: filterObj , teamId ,telecallerId
# purpose: Assign Leads to telecaller/Fos
*/

const assignLeadToTeam=async(req,res)=>{

    const filterData = req.body.filterObj;
    const teamId = req.body.teamId;
    const telecallerId = req.body.telecallerId;
    
    let whereQuery = {};
  
    whereQuery.isDeleted = 0;
   
    if (filterData && filterData.fi != '') {
      whereQuery.FIId = filterData.fi;
    }
  
    if (filterData && filterData.PoolId != '') {
      whereQuery.poolId = filterData.PoolId;
    }
  
    if (filterData && filterData.loanType != '') {
      whereQuery.productTypeId = filterData.loanType;
    }
  
    if (filterData && filterData.IDTo != '' && filterData.IDFrom == '') {
      whereQuery.srNo = { [Op.eq]: filterData.IDTo };
    }
    if (filterData && filterData.IDFrom != '' && filterData.IDTo == '') {
      whereQuery.srNo = { [Op.eq]: filterData.IDFrom };
    }
    if (filterData && filterData.IDTo != '' && filterData.IDFrom != '') {
      whereQuery.srNo = { [Op.between]: [filterData.IDFrom , filterData.IDTo] }
    }
  
    if (filterData && filterData.amountMore != '' && filterData.amountLess == '') {
      whereQuery.totalDueAmount = { [Op.gte]: filterData.amountMore };
    }
    if (filterData && filterData.amountLess != '' && filterData.amountMore == '') {
      whereQuery.totalDueAmount = { [Op.lte]: filterData.amountLess };
    }
    if (filterData && filterData.amountMore != '' && filterData.amountLess != '') {
      whereQuery.totalDueAmount = { [Op.between]: [filterData.amountMore, filterData.amountLess] }
    }
    // if (filterData && filterData.amountOutstanding != '') {
    //   whereQuery.amountOutstanding = { [Op.gte]: filterData.amountOutstanding };
    // }
    if (filterData && filterData.DPDBucket != '') {
      whereQuery.DPDBucket = filterData.DPDBucket;
    }
  
    const user=await Users.findOne({ where: { id: telecallerId }, include: [{ model: Roles, as: 'roles' }]});

    const teamLeader=await Teams.findOne({ where: { id: teamId } });
    
    let telecallerAssignDate=moment(new Date()).utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');
    let fosAssignDate=moment(new Date()).utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');

    let updateLeads;
    
    if(user && user!=null){
      if(user.dataValues.roles.name=='telecaller'){
        updateLeads = await Leads.update({ teamId : teamId , telecallerId:telecallerId,telecallerAssignedDate:telecallerAssignDate}, { where: whereQuery });
     }
     if(user.dataValues.roles.name=='fos'){
        updateLeads = await Leads.update({ fosTeamId : teamId , fosId:telecallerId,fosAssignedDate:fosAssignDate}, { where: whereQuery });
     }
    }else{
      updateLeads = await Leads.update({ teamId : teamId}, { where: whereQuery });
    }
   
    return res.status(200).json({
      title: 'Success',
      error: false,
    });
};

/*
# parameters: filterObj , teamId ,telecallerId
# purpose: Reassign Leads to telecaller/Fos
*/

const reassignLeadToTeam=async(req,res)=>{

  const filterData = req.body.filterObj;
  const teamId = req.body.teamId;
  const telecallerId = req.body.telecallerId;
  
  if (filterData && filterData.loanArray.length > 0) {
      let whereQuery = {};
      whereQuery.isDeleted = 0;
      whereQuery.loanAccountNo =  { [Op.in]:filterData.loanArray };
      const user=await Users.findOne({ where: { id: telecallerId }, include: [{ model: Roles, as: 'roles' }]});
      const teamLeader=await Teams.findOne({ where: { id: teamId } });
      let telecallerAssignDate=moment(new Date()).utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');
      let fosAssignDate=moment(new Date()).utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');
      let updateLeads;
      var data = {
        userName:  req.session.user.firstName + ' ' + req.session.user.lastName,
        userId: req.session.user.id,
        moduleName: "Leads",
        tableName: "Leads",
        action: "Reassign",
        objectId: telecallerId
      }
      data.description = req.session.user.firstName + ' ' + req.session.user.lastName + ' Reassigned ' + filterData.loanArray.length + " leads to " + user.employeeId
      helper.saveAuditTrail(data, req);
      if(user && user!=null){
        if(user.dataValues.roles.name=='telecaller'){
          updateLeads = await Leads.update({ teamId : teamId , telecallerId:telecallerId,telecallerAssignedDate:telecallerAssignDate}, { where: whereQuery });
      }
      if(user.dataValues.roles.name=='fos'){
          updateLeads = await Leads.update({ fosTeamId : teamId , fosId:telecallerId,fosAssignedDate:fosAssignDate}, { where: whereQuery });
      }
      }else{
        updateLeads = await Leads.update({ teamId : teamId}, { where: whereQuery });
      } 
      return res.status(200).json({
        title: 'Success',
        error: false,
      });
  }
  else {
    return res.status(200).json({
      title: 'Error',
      error: false,
    });
  }
  
};

/*
# purpose:To get no of telecallers & fos in campaign
*/

const getcampaignDetails = async (req, res) => {

  const { campaignId } = req.body;

  //get team list of selected team leader
  const teamData = await Campaigns.findAll({
    where: { user_id: teamLeaderId },
    include: [{ model: Users, as: 'users' }],
  });

  const payload = {};
  
  const roles = await Roles.findAll();
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');
  
  //get count of fos and telecallers
  for (const team of teamData) {
    
    const members = await TeamMember.findAll({ where: { teamId: team.id }, include: [{ model: Users, as: 'user' }] });

    const teleTeam = members.filter((e) => e.user.roleId === roles[TelecallerIndex].id); //3-telecaller, 4-leader
    
    const fosTeam = members.filter((e) => e.user.roleId === roles[FOSIndex].id); //5-fos
    
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

/*
# purpose:To delete path of leads uploads
*/

const deleteFile=(path)=>{
  fs.unlinkSync(path);
  console.log('\n\nDelete file');
};

/*
# purpose:To update status of leads
*/

const saveCaseEvents = async (req, res) => {
  let fileType;
  let sampleFile;
  const user = req.session.user;
  if(req.files!=null){
    fileType = req.files.supportImageFile.mimetype;
    sampleFile =req.files.supportImageFile.length > 0 ? req.files.supportImageFile : [req.files.supportImageFile];
  }
 
  let uploadPath;

  //get all data
  let fosLeadData;
  let newLead;
  let fosTeams;
  let Url;
  let whereQueryStatus={};
  if(res.locals.roleName.name=='team_leader'){
    whereQueryStatus.isDeleted=0;
    whereQueryStatus.type='Telecaller';
  }else{
    whereQueryStatus.isDeleted=0;
    whereQueryStatus.name={ [Op.ne]:  'Closed/DND (Do Not Disturb)'};
    whereQueryStatus.type='Telecaller';
  }

  const leads = await Leads.findOne({ where: { loanAccountNo: req.body.leadId } });
  const Dispositions = await Disposition.findAll({ where: whereQueryStatus });
  const languages = await Language.findAll({ where: { } });
  const dpdBucket = await DPDBucket.findOne({ where: { shortName:leads.dataValues.DPDBucket } });
  const collectionStatus = await CollectionStatus.findAll({ where: { } });
  const leadsContact = await leadsContactUpdate.findOne({ where: { leadId:req.body.leadId } });
  const callStatus = await CallStatus.findAll({ where: { } });
  const roles = await Roles.findAll();
  const fis = await Fis.findOne({where:{id:leads.dataValues.FIId}});
  const FOSIndex = roles.findIndex((e) => e.name == 'fos');
  const FieldMngIndex = roles.findIndex((e) => e.name == 'field_manager');
  const productType = await ProductType.findOne({ where: { id:leads.dataValues.productTypeId } });
  const FieldMngr = await Users.findOne({ where: { roleId: FieldMngIndex + 1 } });
  const dispositionName = await Disposition.findOne({ where: { id:req.body.dispositionId } });
  const SubDispositionsName = await SubDisposition.findOne({ where: { id:leads.dataValues.subDispositionId } });
  //Assigned to FOS 
  if(dispositionName.name=='Assigned to FOS'){
    let fosAssignDate=moment(new Date()).utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');
    let PincodeUpdate;
    let fosStrQuery=`SELECT count(*) as lcount,SP.userId,SP.pincode as pincode,L.fosId FROM leads L
    RIGHT JOIN users U ON L.fosId= U.id 
    LEFT JOIN serviceablePincodes SP on U.id = SP.userId 
    WHERE SP.pincode=${leads.applicantPincode} GROUP BY SP.userId order by lcount ASC limit 0,1;`;
   
    fosLeadData= await db.sequelize.query(fosStrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    
    if(fosLeadData!=null && fosLeadData.length > 0){
      fosTeams = await TeamMember.findOne({ where: { userId:fosLeadData[0].userId  } });
      
      if(fosTeams){
        if( fosLeadData && fosLeadData[0].pincode == leads.applicantPincode){
          newLead = await Leads.update({ fosId: fosLeadData[0].userId,fosTeamId: fosTeams.dataValues.teamId,fosAssignedDate:fosAssignDate},
            { where: { loanAccountNo: req.body.leadId } });
            PincodeUpdate = await Pincode.update({operatingLocation : 'Yes'},{ where: { code: leads.applicantPincode } });
        }else if(FieldMngr!=null){
            newLead = await Leads.update({ fosId: FieldMngr.id,fosAssignedDate:fosAssignDate},
              { where: { loanAccountNo: req.body.leadId } });
              PincodeUpdate = await Pincode.update({operatingLocation : 'Yes'},{ where: { code: leads.applicantPincode } });
        }else{
          console.log("User",user);
        }
     }else{
      const script = await Script.findAll({ where: { } });
      let payload={}
      payload.toast = true
      payload.toastColor = 'red'
      payload.script=script;
      payload.DispositionName = (dispositionName) ? dispositionName.name: 'Fresh';
      payload.dpdBucket=(dpdBucket)?dpdBucket.name:'';
      payload.SubDispositionsName = (SubDispositionsName) ? SubDispositionsName.name :'N/A';
      payload.leadsContact=(leadsContact)?leadsContact.content :'';
      payload.productType=productType.name;
      payload.Dispositions = Dispositions;
      payload.languages=languages;
      payload.moment=moment;
      req.session.toastTxt='This user does not belong to a team!';
      return res.redirect(`/leads/assignLeads/view/${req.body.leadId}`);
     }
    }else{
    if(FieldMngr!=null){
      newLead = await Leads.update({ fosId: FieldMngr.id,fosAssignedDate:fosAssignDate},
        { where: { loanAccountNo: req.body.leadId } });
        PincodeUpdate = await Pincode.update({operatingLocation : 'Yes'},{ where: { code: leads.applicantPincode } });
    }
    }
  }


    //to set Columns for Leads History

  const AjaxColumnsLeadsHistory = [
    { title: 'Date', data: 'createdAt' },
    { title: 'Disposition', data: 'dispositionName' },
    { title: 'Sub Disposition', data: 'subDispositionName' },
    { title: 'Comments', data: 'comments' },
    { title: 'File', data: 'fileName' },
  ];

  const apiUrlLeadsHistory = 'leads/leadHistory';

  const payload = {};

  payload.datatable = {
    columns: AjaxColumnsLeadsHistory,
    apiUrl:apiUrlLeadsHistory,
  };

  payload.deleteText = 'Are you sure you want to delete this lead?';

  payload.toast = true
  payload.toastColor = 'green'
  

  payload.leads = leads.dataValues;
  payload.collectionStatus = collectionStatus;
  payload.callStatus = callStatus;
  let leadUpdate;
  let  additionalFieldNew= {};
  let fileCheck;
  //to check files come or not
  if(req.files!=undefined){
    if( req.files.supportImageFile.length > 0){
      fileCheck = req.files.supportImageFile.filter(val => (val.mimetype== 'image/jpeg' || val.mimetype == 'image/png' || val.mimetype == 'image/jpg'));
    }else{
      fileCheck = req.files.supportImageFile.mimetype== 'image/jpeg' || req.files.supportImageFile.mimetype == 'image/png' || req.files.supportImageFile.mimetype == 'image/jpg';
    }

    if ((req.files.supportImageFile.length>0 && req.files.supportImageFile.length!=fileCheck.length) || (req.files.supportImageFile && !fileCheck)) {
      console.log('Please upload only Image file!');
      const script = await Script.findAll({ where: { } });
      payload.DispositionName = (dispositionName) ? dispositionName.name: 'Fresh';
      payload.dpdBucket=(dpdBucket)?dpdBucket.name:'';
      payload.SubDispositionsName = (SubDispositionsName) ? SubDispositionsName.name :'N/A';
      payload.leadsContact=(leadsContact)?leadsContact.content :'';
      payload.script=script;
      payload.fisName=fis.name;
      payload.languages=languages;
      payload.moment=moment;
      payload.productType=productType.name;
      payload.Dispositions = Dispositions;
      req.session.toastTxt = 'Please upload only Image file!'
      return res.redirect(`/leads/assignLeads/view/${req.body.leadId}`);
    }
      console.log('Image file else');
      if(req.files.supportImageFile.length > 0){
        uploadPath = `./uploads/supportings/${req.files.supportImageFile[0].name}`;
      }else{
        uploadPath = `./uploads/supportings/${req.files.supportImageFile.name}`;
      }
     
      uploadHandler.createDir('./uploads/supportings/');
  
      if (fs.existsSync(uploadPath)) {
        console.log('uploaded file exists');
        const script = await Script.findAll({ where: { } });
        let payload={};
        req.session.toastTxt = 'uploaded file exists'

        return res.redirect(`/leads/assignLeads/view/${req.body.leadId}`);
      }
    
    await sampleFile[0].mv(uploadPath, async (err) => {
      if (err || err !== undefined) {
        console.log('Error in File Uploading Please Check File Uploading Path!');
        let payload={};
        req.session.toastTxt = 'Error in File Uploading Please Check File Uploading Path!'
        return res.redirect(`/leads/assignLeads/view/${req.body.leadId}`);
      }
    });  
  }
    

    
    //to save case event
    let newCaseEvent={};
    newCaseEvent = {
      dispositionId: req.body.dispositionId,
      subDispositionId: req.body.subDispositionId ? req.body.subDispositionId :null,
      comments: req.body.comments,
      fileName: req.files && req.files.supportImageFile.length > 0 ? req.files.supportImageFile[0].name : req.files && req.files.supportImageFile ? req.files.supportImageFile.name : '',
      leadId: req.body.leadId,
      followUp:req.body.nextDate ? req.body.nextDate :null,
      nextAction:req.body.nextAction ? req.body.nextAction :'',
      userId: user.id
    };

    let collectedAmout=0;
   //to handle each disposition 
    if(req.body.probability!=undefined){
      
      additionalFieldNew['Probability']=req.body.probability;
    }
    if(req.body.additionalSettlementStatus){
      additionalFieldNew['Settlement Amount Type']=req.body.additionalSettlementStatus;
      additionalFieldNew['Settlement Amount']=req.body.settlementAmount;
      collectedAmout=req.body.settlementAmount;
    }
    if(req.body.additionalStatus){
      additionalFieldNew['PTP Amount Type']=req.body.additionalStatus;
      additionalFieldNew['PTP Amount']=req.body.ptpAmount;
      collectedAmout=req.body.ptpAmount;
    }
    if(req.body.additionalLanguage){
      additionalFieldNew['Communicable Language']=req.body.additionalLanguage;
    }
    if(req.body.collectedStatusAmt){
      additionalFieldNew['Receipt Recovery Type']=req.body.collectedStatusAmt;
      additionalFieldNew['Recovery Amount']=(req.body.ptpAmount)?req.body.ptpAmount:req.body.recoveredAmount;
      additionalFieldNew['Payment Date']=req.body.recoveryDate;
      additionalFieldNew['Cheque No']=req.body.chequeNo;
      collectedAmout=req.body.recoveredAmount;
    }

    if(req.body.amountPaid){
      additionalFieldNew['Amount Paid']=req.body.amountPaid;
      additionalFieldNew['Cheque No']=req.body.chequeNo;
      additionalFieldNew['Payment Date']=req.body.paymentDate;
      collectedAmout=req.body.amountPaid;
    }
    newCaseEvent.additionalField=JSON.stringify(additionalFieldNew);
    
    const createCaseEvent = await CaseEvent.create(newCaseEvent);

    let dir = './uploads/supportings/';

    if (req.files && req.files.supportImageFile.length > 1) {
      eventSuppContr.addSupportingFile(dir, createCaseEvent.id, req.body.leadId, req.files.supportImageFile); //add entrys to supportings
    }

    let update = {};
    if(req.body.dispositionId){
      update.dispositionId = req.body.dispositionId;
    }
    if(req.body.subDispositionId){
      update.subDispositionId = req.body.subDispositionId;
    }
    if(req.body.additionalLanguage){
      update.requestReassign = 'true';
    }
    if(req.body.collectedStatusAmt){
      let colAmount = 0;
      colAmount= (req.body.ptpAmount)? Number(req.body.ptpAmount):Number(req.body.recoveredAmount);
      update.amountCollected = Sequelize.literal(`amountCollected + ${colAmount}`);
      update.paymentStatus = (dispositionName.name=='Collected') ? 'Paid' : 'Partially Paid';
      let newPayment = {
        leadId: req.body.leadId,
        loanNo: req.body.leadId,
        fosId: user.id,
        amtType: req.body.collectedStatusAmt,
        paymentMode: 'Online',
        recoveryDate: req.body.recoveryDate,
        refNo: '',
        collectedAmt: (req.body.ptpAmount)?req.body.ptpAmount:req.body.recoveredAmount,
        chequeNo: req.body.chequeNo,
        remark: '',
        supporting:req.files ? req.files.supportImageFile.name : '',
        caseEventId:createCaseEvent.id
    };
    const payments = await Payment.create(newPayment);
    }
   
    leadUpdate = await Leads.update(update,{ where: { loanAccountNo: req.body.leadId } });
   
    const script = await Script.findAll({ where: { } });
    if(req.body.dispositionId==12){
      const paymentData = await Payment.findOne({ where: { leadId: req.body.leadId } });

      if(leads.dataValues.telecallerId){
        let userType={};
        let TeleId=leads.dataValues.telecallerId;
        const userData = await Users.findOne({ where: { id: TeleId } });
        userType.employeeId=userData.dataValues.employeeId;
        userType.name=userData.dataValues.firstName+" "+userData.dataValues.lastName;
        let paymentId=paymentData.dataValues.id;
        await helper.generateReceipt(paymentId,userType);
      }
    }
    

    payload.script=script;
    payload.toastText = '';
    payload.DispositionName = (dispositionName) ? dispositionName.name: 'Fresh';
    payload.dpdBucket=(dpdBucket)?dpdBucket.name:'';
    payload.SubDispositionsName = (SubDispositionsName) ? SubDispositionsName.name :'N/A';
    payload.leadsContact=(leadsContact)?leadsContact.content :'';
    payload.productType=productType.name;
    payload.Dispositions = Dispositions;
    payload.fisName=fis.name;
    payload.moment=moment;
    payload.languages=languages;
    req.session.toastTxt='Connect details added successfully';
    res.redirect('/leads/assignLeads/view/'+req.body.leadId);
}

/*
# purpose:To find sub Disposition
*/

const findSubDisposition=async (req,res)=>{

const {dispositionId}=req.body;
const SubDispositions = await SubDisposition.findAll({ where: { dispositionId:dispositionId } });
let payload={};
  payload.SubDispositions=SubDispositions;
  return res.status(200).json({ 
    title: 'Success',
    error: false,
    payload
  });
}

/*
# purpose:To filters all and new leads api
*/

const filterApiData = async (req, res) => {
 
  const {filterData}=req.body;
  let leads;
  let caseRecovered;
  let totalAmount=0;
  let totalAmountRecover=0;
  let teamLeadCount=0;
  let LeadCount=0;
  let totalAmountAllocated=0;
  let RecoveredLeadCount=0;
  let caseAllocate;
  let openLeads=0;
  let whereQuery={};
  let todayDate=moment(new Date()).format('YYYY-MM-DD');


  if(!filterData.hasOwnProperty('IDTo')){
    filterData.IDTo='';
  }
  if(!filterData.hasOwnProperty('IDFrom')){
    filterData.IDFrom='';
  }

  var whereSelect = 'L.isDeleted = 0';

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
   if (filterData && filterData.expiryLead == 'Yes') {
    whereSelect=whereSelect+` AND L.expiryDate <= '${todayDate}'`;
   }else{
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
   }
  }else{
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
  }
 
  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.loanType != '') {
    whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.loanType}`
  }

  if (filterData && filterData.IDTo != '' && filterData.IDFrom == '') {
    whereSelect = whereSelect + ` AND L.srNo = ${filterData.IDTo}`
  }
  if (filterData && filterData.IDFrom != '' && filterData.IDTo == '') {
    whereSelect = whereSelect + ` AND L.srNo = ${filterData.IDFrom}`
  }
  if (filterData && filterData.IDTo != '' && filterData.IDFrom != '') {
    whereSelect = whereSelect + ` AND L.srNo BETWEEN ${filterData.IDFrom} AND ${filterData.IDTo}`
  }

  if (filterData && filterData.amountMore != '' && filterData.amountLess == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount > ${filterData.amountMore}`
  }
  if (filterData && filterData.amountLess != '' && filterData.amountMore == '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount < '%${filterData.amountLess}%'`
  }
  if (filterData && filterData.amountMore != '' && filterData.amountLess != '') {
    whereSelect = whereSelect + ` AND L.totalDueAmount BETWEEN ${filterData.amountMore} AND ${filterData.amountLess}`
  }


  if (filterData && filterData.callStatus != '') {
    if(filterData.callStatus==7){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${7} OR L.dispositionId = ${21})`
    }else if(filterData.callStatus==8){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${8} OR L.dispositionId = ${22})`
    }else if(filterData.callStatus==9){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${9} OR L.dispositionId = ${23})`
    }else if(filterData.callStatus==10){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${10} OR L.dispositionId = ${24})`
    }else if(filterData.callStatus==12){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${12} OR L.dispositionId = ${25})`
    }else if(filterData.callStatus==13){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${13} OR L.dispositionId = ${26})`
    }else if(filterData.callStatus==14){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${14} OR L.dispositionId = ${27})`
    }else if(filterData.callStatus==15){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${15} OR L.dispositionId = ${28})`
    }else if(filterData.callStatus==16){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${16} OR L.dispositionId = ${29})`
    }else{
      whereSelect = whereSelect + ` AND L.dispositionId = ${filterData.callStatus}`
    }
  }

  if (filterData && filterData.paymentStatus != '') {
    whereSelect = whereSelect + ` AND L.paymentStatus = '${filterData.paymentStatus}'`
  }

  if (filterData && filterData.EmployeeID != '') {
    let userId=await Users.findOne({ where : {employeeId : filterData.EmployeeID}});
   if(userId!=null){
    whereSelect = whereSelect + ` AND (L.telecallerId = '${userId.dataValues.id}' OR  L.fosId = '${userId.dataValues.id}')`
   } else {
    const payload = {};
    payload.openLeads=0;
    payload.caseAllocate=0;
    payload.caseRecover=0;
    payload.casePending=0;
  
    payload.totalAmount=0;
    payload.totalAmountRecover=0;
    payload.amountPending=0;
    
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: payload,
    });
   }
  }

  if (filterData && filterData.DPDBucket != '') {
    whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.DPDBucket}'`
  }

  if (filterData && filterData.team != '') {
    whereSelect = whereSelect + ` AND (L.teamId = ${filterData.team} OR L.fosTeamId = ${filterData.team})`
  }

  if (filterData && filterData.telecaller != '') {
    whereSelect = whereSelect + ` AND L.telecallerId = ${filterData.telecaller}`
  }

  if (filterData && filterData.telecallerAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.telecallerId IS NOT NULL`
  }

  if (filterData && filterData.FOSAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.fosId IS NOT NULL`
  }
  
  if (filterData && filterData.from && filterData.to) {
    let todate = new Date(filterData.to);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + ` AND (L.createdAt >='${new Date(filterData.from).toISOString()}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  //get leads data

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    
    if(filterData.hasOwnProperty('isFresh')){
      whereSelect = whereSelect + ` AND (L.telecallerId IS NULL AND L.fosId IS NULL)`;
    }else{
      whereSelect = whereSelect + ` AND (L.telecallerId IS NOT NULL OR L.fosId IS NOT NULL)`;
    }
    
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE `+ whereSelect;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id OR L.fosTeamId=T.id)
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE `+ whereSelect;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
    let loginUserId=req.session.user.id;
    whereSelect +=` AND (UT.reportingTo=${loginUserId} OR L.fosId=${loginUserId})`;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  
    //open leads query
    whereSelect += ` AND L.fosId = ${loginUserId}`;
    let StrQueryFos=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect;

    let leadFos= await db.sequelize.query(StrQueryFos, { type: Sequelize.QueryTypes.SELECT });
    openLeads=(leadFos[0].LeadCount!=null) ? leadFos[0].LeadCount :0;

    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){
    let loginUserId=req.session.user.id;
    whereSelect +=` AND UT.id=${loginUserId}`;
    whereSelect +=` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect;

    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='telecaller'){
    let telecallerId=req.session.user.id;	
    whereSelect +=` AND L.telecallerId=${telecallerId}`;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE `+ whereSelect;

    let leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    teamLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON L.teamId=T.id 
    LEFT JOIN users as U ON T.teamLeaderId=U.id
    WHERE `+ whereSelect;
    
    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    RecoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecover=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;

  }

  const payload = {};
  payload.openLeads=openLeads;
  payload.caseAllocate=teamLeadCount;
  payload.caseRecover=RecoveredLeadCount;
  payload.casePending=teamLeadCount-RecoveredLeadCount;

  payload.totalAmount=totalAmount;
  payload.totalAmountRecover=totalAmountRecover;
  payload.amountPending=totalAmount-totalAmountRecover;
  
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
  });
}

/*
# purpose:To download Supporting Files
*/

const downloadSupporting = async (req, res) => {
  const { id } = req.params;
  const caseEventData = await CaseEvent.findOne({ where: { leadId:id } });
  const uploadPath = `./uploads/supportings/${caseEventData.dataValues.fileName}`;
  const filePath = path.join(path.dirname(__dirname), uploadPath);
  const { fileName } = caseEventData.dataValues;
  res.download(filePath, fileName);
};

/*
# purpose:To Update lead Contact
*/

const leadContactUpdate = async(req, res) => {
  const result = validationResult(req);
  if (result.errors.length > 0) {
      return res.status(200).json({
          error: true,
          title: result.errors[0].msg,
          errors: result
      });
  }
  let { leadId, type, content } = req.body;
  const ns = {
      leadId: leadId,
      type: type,
      content: content
  };

  let data = await leadsContactUpdate.create(ns);
  const script = await Script.findAll({ where: { } });
  let payload={};
  payload.toast = true
  payload.toastColor = 'green'
  payload.script=script;
  payload.toastText = '';
  req.session.toastTxt='Contact details added successfully';
  res.redirect('/leads/assignLeads/view/'+req.body.leadId);
}

/*
# purpose: Download Report file for all Leads Tabs
*/
const leadReport =async(req,res)=>{

  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  let filterData = JSON.parse(req.body.filterObj);
  var whereSelect = 'L.isDeleted = 0';

  if(res.locals.roleName.name!='admin' || res.locals.roleName.name!='business_head'){
    whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
  }
  

  // if (req.body.search.value) {
  //   whereSelect = whereSelect + ` AND (L.name LIKE '%${req.body.search.value}%' OR L.loanAccountNo LIKE '%${req.body.search.value}%'
  //   OR L.phone LIKE '%${req.body.search.value}%')`
  // }

  if (filterData && filterData.fi) {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId) {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.loanType) {
    whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.loanType}`
  }

  if (filterData && filterData.amountMore && filterData.amountLess) {
    whereSelect = whereSelect + ` AND L.totalDueAmount > ${filterData.amountMore}`
  }
  if (filterData && filterData.amountLess && filterData.amountMore) {
    whereSelect = whereSelect + ` AND L.totalDueAmount < '%${filterData.amountLess}%'`
  }
  if (filterData && filterData.amountMore && filterData.amountLess ) {
    whereSelect = whereSelect + ` AND L.totalDueAmount BETWEEN ${filterData.amountMore} AND ${filterData.amountLess}`
  }


  if (filterData && filterData.callStatus) {
    whereSelect = whereSelect + ` AND L.dispositionId = ${filterData.callStatus}`
  }

  if (filterData && filterData.DPDBucket) {
    whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.DPDBucket}'`
  }

  if (filterData && filterData.paymentStatus) {
    whereSelect = whereSelect + ` AND L.paymentStatus = '${filterData.paymentStatus}'`
  }

  if (filterData && filterData.EmployeeID) {
    let userId=await Users.findOne({ where : {employeeId : filterData.EmployeeID}});
    if(userId!=null){
     whereSelect = whereSelect + ` AND (L.telecallerId = '${userId.dataValues.id}' OR  L.fosId = '${userId.dataValues.id}')`
    }else{
      return res.status(200).json([]);
    }
  }

  if (filterData && filterData.team) {
    whereSelect = whereSelect + ` AND L.teamId = ${filterData.team}`
  }

  if (filterData && filterData.telecaller) {
    whereSelect = whereSelect + ` AND L.telecallerId = ${filterData.telecaller}`
  }

  if (filterData && filterData.telecallerAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.telecallerId IS NOT NULL`
  }

  if (filterData && filterData.FOSAssigned == 'Yes') {
    whereSelect = whereSelect + ` AND L.fosId IS NOT NULL`
  }
  
  if (filterData && filterData.from && filterData.to) {
    let todate = new Date(filterData.to);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + ` AND (L.createdAt >='${new Date(filterData.from).toISOString()}'  AND L.createdAt <= '${todate.toISOString()}')`
  }


  let leadData;
    let StrQuery=`SELECT L.*,P.fileName as pool,F.name as bankName,D.name as dispositionName,SD.name as subDispositionName ,CONCAT(UT.firstName, ' ', UT.lastName) as teamName,CONCAT(UFT.firstName, ' ', UFT.lastName) as FieldCoName, CONCAT(UTele.firstName, ' ', UTele.lastName) as telecallerName, CONCAT(UFos.firstName, ' ', UFos.lastName) as fosName FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    LEFT JOIN teams as T ON L.teamId=T.id
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    LEFT JOIN teams as FT ON L.fosTeamId=FT.id
    LEFT JOIN users as UFT ON FT.teamLeaderId=UFT.id
    LEFT JOIN users as UTele ON L.telecallerId=UTele.id
    LEFT JOIN users as UFos ON L.fosId=UFos.id
    WHERE `+ whereSelect;
    
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    let csvLeadData=[];
    if(leadData.length > 0){
    await Promise.all(leadData.map(async(lead) => {
      csvLeadData.push({
        'Loan Number': lead.loanAccountNo,
        'Pool': lead.pool,
        'Bank Name': lead.bankName,
        'Customer Name': lead.name,
        'Total Due Amt': lead.totalDueAmount,
        'Outstanding Amt': lead.principalOutstandingAmount,
        'DPD': lead.DPDBucket,
        'Location': lead.location,
        'Team Leader': lead.teamName,
        'Field Coordinator': lead.FieldCoName,
        'Tellecaller': lead.telecallerName,
        'FOS': lead.fosName,
        'Email': lead.email,
        'Days Due': lead.daysDue,
        'Disbursement Date': moment(lead.disbursementDate).format('DD-MM-YYYY'),
        'EMI Start Date': lead.emiStartDate?moment(lead.emiStartDate).format('DD-MM-YYYY'): null,
        'Interest Due Amount': lead.interestDueAmount,
        'Penalty Amount': lead.penaltyAmount,
        'OD Value': lead.ODValue,
        'Transaction Type': lead.transactionType,
        'Payment Status': lead.paymentStatus,
        'Telecaller Assigned Date': moment(lead.telecallerAssignedDate).format('DD-MM-YYYY'),
        'FOS Assigned Date': moment(lead.fosAssignedDate).format('DD-MM-YYYY'),
        'Expiry Date': moment(lead.expiryDate).format('DD-MM-YYYY'),
        'Amount Collected': lead.amountCollected,
        'Allocation Date': moment(lead.allocationDate).format('DD-MM-YYYY'),
        'Applicant PanNumber': lead.applicantPanNumber,
        'Applicant DOB': lead.applicantDob,
        'EMI Due Amount': lead.emiDueAmount,
        'Date Of Default': moment(lead.dateOfDefault).format('DD-MM-YYYY'),
        'Allocation DPD': lead.allocationDpd,
        'Disbursement Type': lead.disbursementType,
        'Applicant Pincode': lead.applicantPincode,
        'Loan Type': lead.loanType,
        'Tenure Finished': lead.tenureFinished,
        'Applicant Cibil Score': lead.applicantCibilScore,
        'Applicant Address Type': lead.applicantAddressType,
        'Engine Number': lead.engineNumber,
        'Co-Applicant Name': lead.coApplicantName,
        'Co-Applicant DOB': lead.coApplicantDob,
        'Co-Applicant Address': lead.coApplicantAddress,
        'Co-Applicant City': lead.coApplicantCity,
        'Co-Applicant State': lead.coApplicantState,
        'Co-Applicant Pincode': lead.coApplicantPincode,
        'Loan Disbursement Date': moment(lead.loanDisbursementDate).format('DD-MM-YYYY'),
        'Loan Maturity Date': moment(lead.loanMaturityDate).format('DD-MM-YYYY'),
        'Business Name': lead.businessName,
        'Applicant Address': lead.applicantAddress,
        'Applicant City': lead.applicantCity,
        'Applicant State': lead.applicantState,
        'Make And Model': lead.makeAndModel,
        'Chassis Number': lead.chassisNumber,
        'DispositionName': lead.dispositionName,
        'Sub DispositionName': lead.subDispositionName,
        'Last Updated' :  moment(lead.updatedAt).format('DD-MM-YYYY'),
        'Request Reassign': lead.requestReassign
      })
    }));
  }else{
    csvLeadData.push({
      'Loan Number': '',
      'Pool': '',
      'Bank Name': '',
      'Customer Name': '',
      'Total Due Amt': 0,
      'Outstanding Amt': 0,
      'DPD': '',
      'Location': '',
      'Team Leader': '',
      'Field Coordinator': '',
      'Tellecaller': '',
      'FOS': '',
      'Email': '',
      'Days Due': 0,
      'Disbursement Date': '',
      'EMI Start Date': '',
      'Interest Due Amount': 0,
      'Penalty Amount': 0,
      'OD Value': 0,
      'Transaction Type': '',
      'Payment Status': '',
      'Telecaller Assigned Date': '',
      'FOS Assigned Date': '',
      'Expiry Date': '',
      'Amount Collected': '',
      'Allocation Date': '',
      'Applicant PanNumber': '',
      'Applicant DOB': '',
      'EMI Due Amount': 0,
      'Date Of Default': '',
      'Allocation DPD': '',
      'Disbursement Type': '',
      'Applicant Pincode': '',
      'Loan Type': '',
      'Tenure Finished': '',
      'Applicant Cibil Score': '',
      'Applicant Address Type': '',
      'Engine Number': '',
      'Co-Applicant Name': '',
      'Co-Applicant DOB': '',
      'Co-Applicant Address': '',
      'Co-Applicant City': '',
      'Co-Applicant State': '',
      'Co-Applicant Pincode': '',
      'Loan Disbursement Date': '',
      'Loan Maturity Date':'',
      'Business Name': '',
      'Applicant Address': '',
      'Applicant City': '',
      'Applicant State': '',
      'Make And Model': '',
      'Chassis Number': '',
      'DispositionName': '',
      'Sub DispositionName': '',
      'Last Updated' :  '',
      'Request Reassign': ''
    })
  }

  const csvFields = ['Loan Number','Pool','Bank Name','Customer Name','Total Due Amt','Outstanding Amt','DPD','Location',
  'Team Leader','Field Coordinator','Tellecaller','FOS','Email','Days Due','Disbursement Date','EMI Start Date','Interest Due Amount',
  'Penalty Amount','OD Value','Transaction Type','Payment Status','Telecaller Assigned Date','FOS Assigned Date','Expiry Date',
  'Amount Collected','Allocation Date','Applicant PanNumber','Applicant DOB','EMI Due Amount','Date Of Default','Allocation DPD',
  'Disbursement Type','Applicant Pincode','Loan Type','Tenure Finished','Applicant Cibil Score','Applicant Address Type','Engine Number',
  'Co-Applicant Name','Co-Applicant DOB','Co-Applicant Address','Co-Applicant City','Co-Applicant State','Co-Applicant Pincode','Band',
  'Loan Disbursement Date','Loan Maturity Date','Business Name','Applicant Address','Applicant City','Applicant State','Make And Model',
  'Chassis Number','DispositionName','Sub DispositionName','Last Updated','Request Reassign'];

  const csvParser = new CsvParser({ csvFields });
  const csvData = csvParser.parse(csvLeadData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=LeadReport.csv");
  res.status(200).end(csvData);
};

const viewReceipt = async(req, res) => { 

  const eventId = req.params.eventId;
  const StrQuery = "SELECT fis.name as finame,fis.shortName,fis.fiImage,ce.leadId,ce.additionalField,ce.createdAt,fis.name,l.name, l.email , l.loanId  , l.phone ,l.applicantAddress  FROM caseEvents ce LEFT JOIN leads l ON l.loanAccountNo=ce.leadId LEFT JOIN fis ON fis.id=l.FIId WHERE ce.id="+eventId;
  const data= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
  
  
  if(data.length > 0){
    const payload = {}
    payload.contact = data[0].phone
    payload.address = data[0].applicantAddress
    payload.loanId = data[0].loanId
    payload.finame = data[0].finame
    payload.fiImage = data[0].fiImage
    payload.leadId = data[0].lead
    payload.additionalField = JSON.parse(data[0].additionalField)
    payload.additionalField['Recovered_Amount'] = (payload.additionalField['Recovered_Amount'] != undefined) ? payload.additionalField['Recovered_Amount'] : payload.additionalField['Recovery Amount'];
    if(payload.additionalField['Recovered_Amount'] === undefined){
       payload.additionalField['Recovered_Amount'] = payload.additionalField['recoveredAmount']
    }
    if(payload.additionalField['Recovered_Amount'] === undefined){
      payload.additionalField['Recovered_Amount'] = payload.additionalField['Recovered_Amount']
    }
    payload.createdAt = data[0].createdAt
    payload.name = data[0].name
    payload.email = data[0].email
    let options = { format: 'A4' };
    console.log(payload);
    
    var template = fs.readFileSync(path.resolve(__dirname, "pdfreceipt.html"),{encoding:'utf-8'});
    res.render('pdfreceipt',payload);
    
  }
  else{
    res.status(200).end("Case event not found");
  }
  
  
  
  
};

module.exports = {
  listNewAssign,
  listAllAssign,
  listArchiveLead,
  leadslistAll,
  leadslistNew,
  leadslistArchive,
  addLeads,
  viewLeadsDetails,
  editLeadsDetails,
  updateLeadsDetails,
  deleteLeads,
  uploadLeads,
  uploadFile,
  getuploadLeads,
  leadHistory,
  assignLeadToTeam,
  reassignLeadToTeam,
  getcampaignDetails,
  leadsAddTelecallers,
  saveCaseEvents,
  deleteFile,
  findSubDisposition,
  filterApiData,
  downloadSupporting,
  leadContactUpdate,
  leadReport,
  viewReceipt,
};
