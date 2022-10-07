// NODE MODULES
const moment = require('moment');
const fs = require('fs');
const CsvParser = require("json2csv").Parser;
const path = require('path');
const db = require('../models');
const console = require('console');
// DATABASE
const { Op } = db.Sequelize;
const Leads = db.leads;
const LeadsUploads = db.pools;
const Fis = db.fis;
const ProductType=db.productType;
const Sequelize = require('sequelize');

/*
# purpose: List Sourcing - Page
*/
const listSourcing = async (req, res) => {
  const leadsUploads = await LeadsUploads.findAndCountAll({});

  const AjaxColumnsSuccess = [
    { title: 'Bank Name', data: 'bankName' },
    { title: 'Product Type', data: 'product' },
    { title: 'No of Leads', data: 'noOfLeads'},
    { title: 'Pool Value', data: 'poolValue' },
    { title: 'Total POS Value', data: 'totalPOSValue' },
    { title: 'Total POS Collected', data: 'totalPOSCollected' },
    { title: 'Contactability', data:'contactability' },
    { title: 'Promise Rate', data:'promiseRate' },
    { title: 'Recovery Rate', data:'recoveryRate' },
    { title: 'Collection Efficiency', data:'collectionEfficiency' },
    { title: 'Start date', data:'createdAt' },
    { title: 'End Date', data: 'endDate' },
    { title: 'Uploaded By', data:'uploadedBy' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrlSuccessLeads = 'sourcing/leadSourcingSuccess';

  const payload = {};

  payload.datatableSuccessLeads = {
    columns: AjaxColumnsSuccess,
    apiUrlSuccessLeads,
  };
  
  
  const AjaxColumnsFailed = [
    { title: 'Bank Name', data: 'bankName' },
    { title: 'No of Leads', data: 'noOfLeads' },
    { title: 'Pool Value', data: 'poolValue' },
    { title: 'Attempted on', data:'createdAt' },
    // { title: 'End Date', data: 'endDate' },
    { title: 'UploadedBy', data:'uploadedBy' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrlFailedLeads = 'sourcing/leadSourcingFailed';

  payload.datatableFailedLeads = {
    columns: AjaxColumnsFailed,
    apiUrlFailedLeads,
  };
 
  payload.url = 'sourcing';
  payload.pageHeading = 'Sourcing';
  payload.totalCount = `Total Sourcing: ${leadsUploads.count}`;
  payload.addUrl = '/sourcing/uploadLeads';
  payload.addButtonName = 'Upload CSV';
  payload.displayErrorLogs = true;
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this sourcing?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  
  const fisDatas = await Fis.findAll({ where: {} });
  
  const apiUrlLeadSuccess = 'sourcing/leadSuccessTable';

  // Leads
    const AjaxColumnsLeadsSuccess = [
      { 'title': 'Location', 'data': 'location' },
      { 'title': 'No. of Leads', 'data': 'No of leads' },
    ];
    payload.datatable= {
      url : 'leadSuccessTable',
      columns: AjaxColumnsLeadsSuccess,
      apiUrl: apiUrlLeadSuccess
    };

  res.render('admin/components/sourcing/sourcing_main_list', payload);
};

/*
# purpose: List Success Leads
*/
const leadSourcingSuccess = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;
  searchQuery={ status: 'Success' };

  //let StrQuery = `SELECT (COUNT(*) OVER()) as countLead,P.*, SUM(L.dispositionId = 7) noOfPtp, SUM(L.amountCollected > 0) collectedLeads, SUM(L.principalOutstandingAmount) totalPos, SUM(L.amountCollected) collectedAmt , SUM(L.totalDueAmount) totalDueAmt, SUM(L.dispositionId = 9 OR L.dispositionId = 10 OR L.dispositionId = 11 OR
  //L.dispositionId = 12 OR L.dispositionId = 13 OR L.dispositionId = 14 OR L.dispositionId = 15 OR
  //L.dispositionId = 16) contactedLead, PT.name product FROM pools P LEFT JOIN leads L ON L.poolId=P.id LEFT JOIN productTypes PT ON P.productTypeId=PT.id WHERE P.status='Success'`
  
  let StrQuery = `SELECT (COUNT(*) OVER()) as countLead,P.* ,SUM(L.amountCollected > 0) collectedLeads,SUM(L.amountCollected) collectedAmt ,SUM(L.principalOutstandingAmount) totalPos,SUM(L.totalDueAmount) totalDueAmt, PT.name product FROM pools P LEFT JOIN leads L ON L.poolId=P.id LEFT JOIN productTypes PT ON P.productTypeId=PT.id WHERE P.status='Success' `;
  StrQuery = StrQuery + `GROUP BY P.id ORDER BY createdAt DESC`+ ' LIMIT '+ length + ' OFFSET ' + start;
  console.log(StrQuery);
  let leadsUploads = await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });


  await Promise.all(leadsUploads.map(async(leadsUpload,index) => {
    leadsUpload.dataValues = {};
    let noOfPtp = await Leads.count({where:{'dispositionId':{[Op.in]: [7,21]},'poolId':leadsUpload.id}}); //Number(leadsUpload.noOfPtp) > 0 ?  Number(leadsUpload.noOfPtp) : 0;
    let collectedLeads = Number(leadsUpload.collectedLeads) > 0 ? Number(leadsUpload.collectedLeads) :0;
    let totalPos = Number(leadsUpload.totalPos) > 0 ? Number(leadsUpload.totalPos) : 0;
    let collectedAmt = Number(leadsUpload.collectedAmt) ? Number(leadsUpload.collectedAmt) :0;
    let totalDueAmt = Number(leadsUpload.totalDueAmt) > 0 ? Number(leadsUpload.totalDueAmt) : 0;
    let contactedLead = await Leads.count({where:{'dispositionId':{[Op.in]: [2,3,4,5,7,8,9,10,11,12,13,14,15,20,21,22,23,24,25]},'poolId':leadsUpload.id}}); //Number(leadsUpload.contactedLead) > 0 ? Number(leadsUpload.contactedLead) : 0;
    let actions = '';
    let cssStyle = (leadsUpload.noOfLeads <= 9) ?'style="padding-left: 10px;"':'';
    let cssStyleAnchor = (leadsUpload.noOfLeads > 99) ?'style="margin-left: 10px !important;width: 23px;height: 23px;"':'';
    let cssStyleView = (leadsUpload.noOfLeads > 99) ?'style="margin-left: 27px;width: 23px;height: 23px;"':'style="margin-left: 27px;width: 23px;height: 23px;"';
    let noOfLeads= `<span ${cssStyle} >${leadsUpload.noOfLeads}</span>`;
    if (req.permissionsList.includes('view')) {
      actions += `<a class='dt-action text-capitalize' href='/sourcing/download/${leadsUpload.id}'><b>Download</b></a>`;
    }
    if (req.permissionsList.includes('view')) {
      noOfLeads += `<a ${cssStyleAnchor} onclick="getSourcingDetail('sourcing/getSourcingDetails', ${leadsUpload.id}, '')" href="#successModal" class='btn-floating modal-trigger gradient-45deg-green-teal mr-1 text-capitalize pointer success' ${cssStyleView} data-id='${leadsUpload.id}'><i class="material-icons" style="position: absolute;
      top: -8px;">add</i></a>`;
    }
    leadsUpload.actions = actions;
    leadsUpload.uploadedBy = req.session.user.firstName;
    leadsUpload.poolValue = leadsUpload.poolValue.toLocaleString();
    leadsUpload.createdAt = moment(leadsUpload.createdAt, "YYYY-MM-DD").format('DD-MM-YYYY');
    leadsUpload.product = leadsUpload.product;
    leadsUpload.totalPOSValue = totalPos;
    leadsUpload.totalPOSCollected = collectedAmt;
    let contactability = ((parseInt(contactedLead) / parseInt(leadsUpload.noOfLeads)) * 100).toFixed(2);
    leadsUpload.contactability = `${contactedLead > 0 ? contactability : 0}%`;
    leadsUpload.promiseRate = `${noOfPtp > 0 ? (noOfPtp / contactedLead * 100).toFixed(2) : 0}%`;
    leadsUpload.recoveryRate = `${collectedLeads > 0 ? (Number(((collectedLeads / leadsUpload.noOfLeads) * 100).toFixed(2)) ? ((collectedLeads / leadsUpload.noOfLeads) * 100).toFixed(2) :0) : 0}%`;
    leadsUpload.collectionEfficiency = `${Number(((collectedAmt / totalDueAmt) * 100).toFixed(2)) ? ((collectedAmt / totalDueAmt) * 100).toFixed(2) :0}%`;
    leadsUpload.noOfLeads = noOfLeads;
  }));
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leadsUploads,
    recordsFiltered:(leadsUploads[0]) ? leadsUploads[0].countLead : 0,
    recordsTotal: (leadsUploads[0]) ? leadsUploads[0].countLead : 0,
  });
};

/*
# purpose: List failed Leads
*/
const leadSourcingFailed = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;
  searchQuery={ status: 'Failed' };

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { bankName: { [Op.like]: `%${req.body.search.value}%` } },
        { status: { [Op.like]: `%${req.body.search.value}%` } },
      ],
      [Op.and] : [
        {
          status: { [Op.like]: 'Failed' }
        },
    ]  
    };
  }

  const leadsUploads = await LeadsUploads.findAndCountAll({
    where: searchQuery,
    order: [
      ['createdAt', 'DESC'],
  ],
    limit: length,
    offset: start,
  });

  leadsUploads.rows.forEach((leadsUpload) => {
   
    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions += `<a class='dt-action text-capitalize' href='sourcing/failedLeads/download/${leadsUpload.id}'><b>Download</b></a>`;
    }
    if (req.permissionsList.includes('view')) {
      actions += `<a onclick="getSourcingFailDetail('sourcing/getSourcingDetails', ${leadsUpload.id}, '')" href="#failedModal" class='modal-trigger mr-1 text-capitalize pointer success'><b>View</b></a>`;
      // actions += `<a href="#successModal" class='modal-trigger dt-action text-capitalize pointer' onclick="getSourcingDetail('sourcing/getSourcingDetails', ${leadsUpload.id}, '')"><b>View</b></a>`;
    }
    // if (req.permissionsList.includes('delete')) {
    //   actions += `<ahref="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" onclick="action('sourcing/delete', ${leadsUpload.id}, '')"><b>Delete</b></a>`;
    // }
    leadsUpload.dataValues.actions = actions;
    leadsUpload.dataValues.uploadedBy = req.session.user.firstName;
    leadsUpload.dataValues.createdAt = moment(leadsUpload.dataValues.createdAt).utcOffset('+00:00').format('YYYY-MM-DD hh:mm:ss');
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leadsUploads.rows,
    recordsFiltered: leadsUploads.count,
    recordsTotal: leadsUploads.count,
  });
};

/*
# purpose: upload Leads
*/
const uploadLeads = async (req, res) => {

  const fisDatas = await Fis.findAll({ where: { } });
  const productType = await ProductType.findAll({ where: { } });
  
  const payload = {};
  payload.message = null;
  payload.error2 = null;
  
  payload.fisDatas = fisDatas;
  payload.productType = productType;
  payload.toast = false;
  payload.toastColor = 'green'
  payload.toastText = '';
  res.render('admin/components/sourcing/leads_upload', payload);
};

/*
# purpose: create Source
*/
const createSource = async (userData) => {
  
  const newLeads = {
    bankName: userData.bankName,
    noOfLeads: userData.totalLeads,
    poolValue: userData.totalPoolAmount,
    collectedAmt: 0,
    totalContacted: 0,
    resolvedCases: 0,
    contactability:0,
    promiseRate:0,
    recoveryRate:0,
    collectionEfficiency:0,
    location:userData.locationArray,  
    fileName: userData.fileName,
    productTypeId:userData.productId,
    startDate: userData.startDate,
    endDate: userData.endDate,
    status:userData.status,
    errors:userData.errors,
    isErrorcheck:userData.isErrorcheck,
  };
  
  const leadsUploads = await LeadsUploads.create(newLeads);
  const payload = {};
  payload.leadsUploads = newLeads;
};

/*
# purpose: download Leads
*/
const downloadLeads = async (req, res) => {
  const { id } = req.params;
  const leadsUploads = await LeadsUploads.findOne({ where: { id } });
  const uploadPath = `./uploads/csv_folder/${leadsUploads.dataValues.fileName}`;
  const filePath = path.join(path.dirname(__dirname), uploadPath);
  const { fileName } = leadsUploads.dataValues;
  res.download(filePath, fileName);
};

/*
# purpose: download Lead Templates
*/
const downloadLeadTemplate = async (req, res) => {
  const  fileName  = 'SampleTemplate.csv';
  const uploadPath = `./assets/template_csv/${fileName}`;
  const filePath = path.join(path.dirname(__dirname), uploadPath);

  res.download(filePath, fileName);
};

/*
# purpose: success Leads
*/
const successLeads = async (req, res) => {

  const Id= req.params.id;

  const fisDatas = await Fis.findAll({ where: {} });
  
  const apiUrlLeadSuccess = 'sourcing/leadSuccessTable';

    // Leads
    const AjaxColumnsLeadsSuccess = [
      { 'title': 'Location', 'data': 'location' },
      { 'title': 'No. of Leads', 'data': 'No of leads' },
    ];
    const payload = {};
    payload.filterCount=50;
    payload.deleteText = 'Are you sure you want to delete this customer?';
    payload.datatable= {
      url : 'leadSuccessTable',
      id: Id,
      columns: AjaxColumnsLeadsSuccess,
      apiUrl: apiUrlLeadSuccess
    };
  
  let userName=req.session.user.firstName;
  
  const LeadsUpload = await LeadsUploads.findOne({ where: { id:Id } });
  
  payload.userName = userName;
  payload.LeadsUpload = LeadsUpload;
  payload.fisDatas = fisDatas;
  payload.toast = false;
  payload.toastColor = 'green'
  payload.toastText = '';
  res.render('admin/components/sourcing/leads_success', payload);
};

/*
# purpose: lead Success Table
*/
const leadSuccessTable = async (req, res) => {
  const Id=req.body.id ? req.body.id : req.body.search.value;
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;

  let whereQuery = {};
  let leadSuccessData=[];
  const LeadsUpload = await LeadsUploads.findOne({ where: { id:Id } });
 
  if(LeadsUpload!=null){
    let locations=JSON.parse(LeadsUpload.location);

    let locationName = Object.keys(locations);
   
    locationName.forEach(locationname => {
      leadSuccessData.push(
        { 
          "location" : locationname,
          "No of leads": locations[locationname]},
        );
    });
  
  }
  if (req.body.search.value != '') {
    whereQuery[Op.or] = [
      { location: { [Op.like]: `%${req.body.search.value}%` } },
    ]
  }

  
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leadSuccessData,
    recordsFiltered: leadSuccessData.length >= 10 ? 10 : 10,
    recordsTotal: leadSuccessData.length >= 10 ? 10 : 10
  });
}

/*
# purpose: failed Leads
*/
const failedLeads = async (req, res) => {
  const Id=req.params.id;
  const fisDatas = await Fis.findAll({ where: {} });
  const LeadsUpload = await LeadsUploads.findOne({ where: {id:Id} ,raw:true});
  let errorData=JSON.parse(LeadsUpload.errors);
  let userName=req.session.user.firstName;

  const payload = {};
  payload.userName = userName;
  payload.LeadsUpload = LeadsUpload;
  payload.errorData = errorData;
  payload.fisDatas = fisDatas;
  payload.toast = false;
  payload.toastColor = 'green'
  payload.toastText = '';
  payload.toastColor = 'green'
  payload.id = Id;
  res.render('admin/components/sourcing/leads_failed', payload);
};

/*
# purpose: failed Lead Report
*/
const failedLeadReport =async(req,res)=>{
  const {id}= req.params;
  const LeadsUpload = await LeadsUploads.findOne({ where: {id:id} ,raw:true});
  
  let errorData=JSON.parse(LeadsUpload.errors);
  let errorListData = [];
  
  await Promise.all(errorData.map((errData) => {
    const { LineNo, Error} = errData;
    errorListData.push({ LineNo, Error });
  }));

  const csvFields = ["LineNo", "Error"];
  const csvParser = new CsvParser({ csvFields });
  const csvData = csvParser.parse(errorListData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=failedReport.csv");

  res.status(200).end(csvData);
};

/*
# purpose: Sourcing Details Page
*/
const getSourcingDetails= async(req,res)=>{
 
    const id=req.body.userId;
    const LeadsUpload = await LeadsUploads.findOne({ where: { id:id } });
    
    LeadsUpload.dataValues.userName=req.session.user.firstName;
    const payload={};
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: LeadsUpload
    });
};

module.exports = {
  uploadLeads,
  createSource,
  listSourcing,
  leadSourcingSuccess,
  leadSourcingFailed,
  downloadLeads,
  successLeads,
  failedLeads,
  leadSuccessTable,
  failedLeadReport,
  getSourcingDetails,
  downloadLeadTemplate
};
