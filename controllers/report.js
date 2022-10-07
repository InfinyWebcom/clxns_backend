const db = require('../models');
const moment = require('moment');
const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const csv = require('fast-csv');
const CsvParser = require("json2csv").Parser;
const fs = require('fs');
const path = require('path');
const { Op } = db.Sequelize;
const Leads = db.leads;
const Teams=db.teams;
const TeamMember = db.teamMembers;

const Users = db.users;
const Fis = db.fis;
const Pools = db.pools;
const Location = db.locations;
const Roles = db.roles;
const Disposition = db.dispositions;
const CollectionStatus = db.caseStatus;
const CallStatus = db.callStatus;
const ProductType=db.productType;
const DPDBucket = db.dpd;
const LeadsUploads = db.pools;
/*
# purpose: listing all report section page
*/
const index = async(req, res) => {
  let lead;
  let leadData;
  let caseAllocate;
  let caseRecovered;
  let leadCount=0;
  let allocateLeadCount=0;
  let recoveredLeadCount=0;
  let totalAmount=0;
  let totalAmountAllocated=0;
  let totalAmountRecovered=0;
  let whereQuery={};
  let caseWhereQuery={};
  whereQuery.isDeleted=0;

  lead= await Leads.findAndCountAll({ where: { isDeleted: 0 }});

  let FisId;
  if(res.locals.roleName=='FiName'){
    FisId=req.session.user.fiId;
    whereQuery.FIId=FisId;
    caseWhereQuery.FIId=FisId;
  }
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    leadData= await Leads.findAndCountAll({ where: whereQuery, attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('totalDueAmount')), 'totalAmount'],
], logging: console.log });
 
  leadCount=(leadData.count > 0)? leadData.rows[0].dataValues.leadCount : 0 ;
  totalAmount=(leadData.count > 0)? leadData.rows[0].dataValues.totalAmount : 0 ;

  whereQuery[Op.or]= [{teamId:  {[Op.ne]: null}},{fosTeamId: {[Op.ne]: null}}];

   caseAllocate = await Leads.findAndCountAll({ where: whereQuery , attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('totalDueAmount')), 'totalAmount'],
],logging: console.log });
  
   allocateLeadCount=(caseAllocate.count > 0)? caseAllocate.rows[0].dataValues.leadCount : 0 ;
   totalAmountAllocated=(caseAllocate.count > 0)? caseAllocate.rows[0].dataValues.totalAmount : 0 ;
  

  
  caseWhereQuery.isDeleted=0;
  caseWhereQuery.amountCollected={ [Op.gt]: 0 };
  caseRecovered = await Leads.findAndCountAll({ where: caseWhereQuery, attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('amountCollected')), 'totalAmount'],
],logging: console.log });

    recoveredLeadCount=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.leadCount : 0 ;
    totalAmountRecovered=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.totalAmount : 0 ;
  }

  const teams = await Teams.findAndCountAll({ where: { isDeleted: 0 } });
  const pools = await Pools.findAndCountAll({ where: {status:"Success"} });
  const locations = await Location.findAndCountAll({ where: {} });

  const teamOne = await Teams.findOne({ where: { isDeleted: 0 } });


  const payload = {};
  payload.url = 'reports';
  payload.leads=lead.rows;
  payload.addButtonName='admin'
  payload.addUrl='./addReport'
  payload.teamOne=teamOne;
 
  payload.totalCases=leadCount;
  payload.caseAllocate=allocateLeadCount;
  payload.caseRecover=recoveredLeadCount;
  payload.casePending=allocateLeadCount-recoveredLeadCount;
  payload.totalAmount=totalAmount;
  payload.totalAmountAllocated=totalAmountAllocated;
  payload.totalAmountRecover=totalAmountRecovered;
  payload.amountPending=totalAmountAllocated-totalAmountRecovered;
  payload.teams=teams.rows;
  payload.pools=pools.rows;
  payload.locations=locations.rows;


  //Customer base Lead Listing Data
  let AjaxColumns = [
    { title: 'State', data: 'stateName' },
    { title: 'Pincode Coverage', data: 'serviceable' },
    { title: 'No of Account', data: 'leadCount' },
    { title: 'Total Amount', data: 'totalAmount' }
  ];

const apiUrlAllLeads = 'reports/customerList';

payload.datatable = {
  filter: 'leads',
  columns: AjaxColumns,
  apiUrl:apiUrlAllLeads,
  id:res.locals.roleName=='FiName' ? FisId :null
};

  //MIS report Leads Listing Data
  let AjaxColumnsMIS = [
    { title: 'Employee ID', data: 'agentName' },
    { title: 'Agent Role', data: 'agentRole' },
    { title: 'Case Count', data: 'leadCount' },
    { title: 'Due Amt', data: 'totalAmount' },
    { title: 'Collected', data: 'leadCount' },
    { title: 'No of Events', data: 'eventCount' },
    { title: 'PTP', data: 'ptpCount' },
    { title: 'RTP', data: 'rtpCount' },
    { title: 'BTP', data: 'btpCount' },
    { title: 'Last Disposition', data: 'lastDisposition' },
    { title: 'Last Sub-Disposition', data: 'subStatus' },
    { title: 'Last Comment', data: 'lastComment' },
    { title: 'Collection Efficiency', data: 'colEfficiency' },
  ];

const apiUrlMISLeads = 'reports/misReportList';

payload.datatableMIS = {
  filter: 'leads',
  columns: AjaxColumnsMIS,
  apiUrl:apiUrlMISLeads,
  id:res.locals.roleName=='FiName' ? FisId :null
};

payload.pageHeading = 'All Leads';
payload.addUrl = 'reports/addLeads';
payload.Content = 'Reports Management';
payload.permissionsList = req.permissionsList;
payload.deleteText = 'Are you sure you want to delete this lead?';

payload.toast = false
payload.toastColor = 'green'
payload.toastText = ''

const Dispositions = await CallStatus.findAll({ where: { }});
payload.Dispositions = Dispositions;

//year drop-down
let years=[];
let currentMonth=moment().format("MM");
let current_year;
// let years=['2021-2022','2020-2021'];
if(currentMonth < 4){
  current_year=moment().subtract(1,"year").format("YYYY");
}else{
  current_year=moment().format("YYYY");
}

for (let i = current_year; i >= 2020; i--) {
  years.push(
    i +'-'+ moment(`${i}`).add(1,"year").format("YYYY")
  )
  current_year--;
}

// console.log("years",years)
payload.years=years;

const fis = await Fis.findAll({ where: { isDeleted: 0 } });
payload.fis=fis;
const productTypes = await ProductType.findAll({ where: { } });
payload.productTypes=productTypes;
const leadsUpload = await LeadsUploads.findAll({ where: { status:'Success' } });
payload.leadsUploads=leadsUpload;

const dpdBucket = await DPDBucket.findAll({ where: { } });
payload.dpdBuckets=dpdBucket;
payload.moment=moment;
res.render('admin/components/reports/admin_report', payload);
};

/*
# purpose: filterData 
*/
const filterData=async(req,res)=>{
    const {filterData}=req.body;

    let whereQuery={};
    var whereSelect = 'L.isDeleted = 0';

    if(res.locals.roleName=='FiName'){
      let FiId=req.session.user.fiId;
      whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
    }

    if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
      let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
      let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
      let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date);
      let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
      let todate = new Date(filterData.toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
    }

    if (filterData && filterData.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
    }
  
    if (filterData && filterData.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
    }
  
    if (filterData && filterData.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
    }
  
    if (filterData && filterData.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
        whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
      }
    }
  
  
    //get leads data

    let leads;
    let leadData;
    let caseAllocate;
    let caseRecovered;
    let leadCount=0;
    let allocateLeadCount=0;
    let recoveredLeadCount=0;
    let totalAmount=0;
    let totalAmountAllocated=0;
    let totalAmountRecovered=0;
   
    leads= await Leads.findAndCountAll({ where: { isDeleted: 0 }});
  
    let teamLeaderId=req.session.user.id;
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
      let totalWhere=whereSelect;
      let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON L.teamId=T.id
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ totalWhere;
     
      leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
   
      leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

      let allocateWhere=whereSelect;
      allocateWhere = allocateWhere + ` AND (L.telecallerId IS NOT NULL OR L.fosId IS NOT NULL)`;
      let allocateStrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON L.teamId=T.id
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ allocateWhere;
    
      caseAllocate= await db.sequelize.query(allocateStrQuery, { type: Sequelize.QueryTypes.SELECT });
      

      allocateLeadCount=(caseAllocate[0].LeadCount!=null) ? caseAllocate[0].LeadCount :0;
      totalAmountAllocated=(caseAllocate[0].totalAmount!=null) ? caseAllocate[0].totalAmount:0;

      let caseWhere=whereSelect;
      caseWhere = caseWhere + ` AND L.amountCollected > 0`;
      caseWhere = caseWhere + ` AND (L.telecallerId IS NOT NULL OR L.fosId IS NOT NULL)`;
      let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
      LEFT JOIN teams as T ON L.teamId=T.id 
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ caseWhere;
     
      caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
      recoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
      totalAmountRecovered=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
    }
   
  let payload={};
  payload.totalCases=leadCount;
  payload.caseAllocate=allocateLeadCount;
  payload.caseRecover=recoveredLeadCount;
  payload.casePending=allocateLeadCount-recoveredLeadCount;
  payload.totalAmount=totalAmount;
  payload.totalAmountAllocated=totalAmountAllocated;
  payload.totalAmountRecover=totalAmountRecovered;
  payload.amountPending=totalAmountAllocated-totalAmountRecovered;
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
  });

};

/*
# purpose: customerList state base tables 
*/

const customerList = async (req, res) => {
    
    const user = req.session.user;
    let todayDate=moment(new Date()).format('YYYY-MM-DD');
    const length = req.body.length ? parseInt(req.body.length) : 10;
    const start = req.body.start ? parseInt(req.body.start) : 0;
    let filterData=(req.body.responseType=='csv') ? JSON.parse(req.body.filterObj) : req.body.filterObj;
   
    let date =  new Date().getFullYear();
    let fromDate=moment().startOf('month').format("YYYY-MM-DD");
    let toDate =moment().format("YYYY-MM-DD");
   
   

    let whereQuery = {};
    var whereSelect = 'L.isDeleted = 0';
    if(!filterData){
     
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${fromDate}' AND '${toDate}'`
    }
    if(res.locals.roleName=='FiName'){
      let FiId=req.body.id;
      whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
    }
   
    if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
      let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
      let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
      let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date);
      let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
      let todate = new Date(filterData.toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
    }

    if (filterData && filterData.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
    }
  
    if (filterData && filterData.productId != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.productId}`
    }
  
    if (filterData && filterData.dispositionId != '') {
      if(filterData.dispositionId==7){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${7} OR L.dispositionId = ${21})`
      }else if(filterData.dispositionId==8){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${8} OR L.dispositionId = ${22})`
      }else if(filterData.dispositionId==9){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${9} OR L.dispositionId = ${23})`
      }else if(filterData.dispositionId==10){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${10} OR L.dispositionId = ${24})`
      }else if(filterData.dispositionId==12){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${12} OR L.dispositionId = ${25})`
      }else if(filterData.dispositionId==13){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${13} OR L.dispositionId = ${26})`
      }else if(filterData.dispositionId==14){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${14} OR L.dispositionId = ${27})`
      }else if(filterData.dispositionId==15){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${15} OR L.dispositionId = ${28})`
      }else if(filterData.dispositionId==16){
        whereSelect = whereSelect + ` AND (L.dispositionId = ${16} OR L.dispositionId = ${29})`
      }else{
        whereSelect = whereSelect + ` AND L.dispositionId =  ${filterData.dispositionId}`
      }
    }

  
    let totalTeamLeads=[];
    let leadPincode=[];
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
      let leadData;
      let PincodeState;
      let StrQuery=`SELECT (COUNT(*) OVER()) as countAllLead,COUNT(L.loanAccountNo) as countLead,SUM(L.totalDueAmount) as totalAmount,COUNT(SP.pincode) as serviceable,L.applicantState AS stateName FROM leads as L
      LEFT JOIN serviceablePincodes as SP ON L.applicantPincode=SP.pincode
      WHERE `+ whereSelect +` group by applicantState ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;
     
      console.log("city StrQuery",StrQuery);
      leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

      let StrPicodeQuery=`SELECT applicantPincode,applicantState FROM leads as L
       WHERE  `+ whereSelect +` group by applicantPincode`;
     
      console.log("city StrPicodeQuery",StrPicodeQuery);
      PincodeState= await db.sequelize.query(StrPicodeQuery, { type: Sequelize.QueryTypes.SELECT });

      await Promise.all(PincodeState.map(async(state) => {
        leadPincode.push(state.applicantState);
      }))
     console.log("leadPincode",leadPincode);
   
     let arrLocation = leadPincode.map(ele => ele.replace("\n", "").toUpperCase());
     let uniqsLocation =await arrLocation.reduce((acc, val) => {
        acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
        return acc;
      }, {});

     console.log("State=====:",JSON.stringify(uniqsLocation));

     let uniqeData=Object.keys(uniqsLocation);
     console.log("uniqeData",uniqeData);

     await Promise.all(uniqeData.map(async(stateData) => {
      await Promise.all(leadData.map(async(lead) => {
        if(lead.stateName==stateData){
          let loanAcontNo = '';
          lead.stateName=(lead.stateName!='')?lead.stateName:'N/A',
          lead.serviceable=uniqsLocation[stateData],
          lead.leadCount = lead.countLead;
          lead.totalAmount = lead.totalAmount;
        }
        }));
      }));

      return res.status(200).json({
        title: 'Success',
        error: false,
        data: leadData,
        recordsFiltered: (leadData[0]) ? leadData[0].countAllLead :0,
        recordsTotal:(leadData[0]) ? leadData[0].countAllLead :0,
      });
    }
  
};

/*
# purpose: customer Report 
*/

const customerReportDownload = async (req, res) => {
  
  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 10;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let filterData=JSON.parse(req.body.filterObj);

  let date =  new Date().getFullYear();
  let fromDate=moment().startOf('month').format("YYYY-MM-DD");
  let toDate =moment().format("YYYY-MM-DD");
 
  

  let whereQuery = {};
  var whereSelect = 'L.isDeleted = 0';
  if(!filterData){
    
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${fromDate}' AND '${toDate}'`
  }
  if(res.locals.roleName=='FiName'){
    let FiId=req.body.id;
    whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
  }
 
  if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
    let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
    let todate = new Date(filterData.toDate);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.productId != '') {
    whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.productId}`
  }

  if (filterData && filterData.dispositionId != '') {
    if(filterData.dispositionId==7){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${7} OR L.dispositionId = ${21})`
    }else if(filterData.dispositionId==8){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${8} OR L.dispositionId = ${22})`
    }else if(filterData.dispositionId==9){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${9} OR L.dispositionId = ${23})`
    }else if(filterData.dispositionId==10){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${10} OR L.dispositionId = ${24})`
    }else if(filterData.dispositionId==12){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${12} OR L.dispositionId = ${25})`
    }else if(filterData.dispositionId==13){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${13} OR L.dispositionId = ${26})`
    }else if(filterData.dispositionId==14){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${14} OR L.dispositionId = ${27})`
    }else if(filterData.dispositionId==15){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${15} OR L.dispositionId = ${28})`
    }else if(filterData.dispositionId==16){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${16} OR L.dispositionId = ${29})`
    }else{
      whereSelect = whereSelect + ` AND L.dispositionId =  ${filterData.dispositionId}`
    }
  }

  

  let totalTeamLeads=[];

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    let leadData;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as countLead,SUM(L.totalDueAmount) as totalAmount,L.applicantState AS stateName FROM leads as L
    WHERE `+ whereSelect +` group by applicantState ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start;
    
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    await Promise.all(leadData.map(async(lead) => {
      
      let loanAcontNo = '';
      lead.stateName=(lead.stateName!='')?lead.stateName:'N/A',
      lead.leadCount = lead.countLead ? lead.countLead : 0;
      lead.totalAmount = lead.totalAmount ? lead.totalAmount : 0;
    }));
   
      let csvLeadData=[];
      if(leadData.length > 0){
        await Promise.all(leadData.map(async(lead) => {
          csvLeadData.push({
            'State': (lead.stateName!='')?lead.stateName:'N/A',
            'No of Lead Count': lead.countLead ? lead.countLead : 0,
            'Total Amount': lead.totalAmount ? lead.totalAmount : 0
          })
        }));
      }else{
        csvLeadData.push({
          'State': '',
          'No of Lead Count':  0,
          'Total Amount':  0
        })
      }

      const csvFields = ['State','No of Lead Count','Total Amount'];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvLeadData);
      // fs.writeFileSync('LeadReportCustomer.csv',csvData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=LeadReportCustomer.csv");
      // res.status(200).sendFile(process.cwd()+'/LeadReportCustomer.csv');
      res.status(200).end(csvData);
 
  }

};

/*
# purpose: misReportList 
*/

const misReportList = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 10;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let filterData=req.body.filterObj;
  
  let date =  new Date().getFullYear();
  let fromDate=moment().startOf('month').format("YYYY-MM-DD");
  let toDate =moment().format("YYYY-MM-DD");
 
  

  let whereQuery = {};
  var whereSelect = 'L.isDeleted = 0';
  if(!filterData){
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${fromDate}' AND '${toDate}'`
  }
  if(res.locals.roleName=='FiName'){
    let FiId=req.body.id;
    whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
  }
 
  if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
    let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
    let todate = new Date(filterData.toDate);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.locationId != '') {
    whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
  }

  if (filterData && filterData.teamId != '') {
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
      whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
    }
  }

 

  let totalTeamLeads=[];

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    let leadData;
    let StrQuery=`(SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.employeeId as agentId,L.dispositionId,COUNT(L.srNo) as Lcount,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,SUM(L.totalDueAmount) as totalAmt,SUM(L.amountCollected) as collectAmt FROM leads AS L 
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.telecallerId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect +` AND L.telecallerId IS NOT NULL AND L.teamId IS NOT NULL AND (L.dispositionId =25 OR L.dispositionId =12) GROUP BY L.telecallerId )
    UNION
    (SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.employeeId as agentId,L.dispositionId,COUNT(L.srNo) as Lcount,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,SUM(L.totalDueAmount) as totalAmt,SUM(L.amountCollected) as collectAmt FROM leads AS L
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.telecallerId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect +` AND L.telecallerId IS NOT NULL AND L.teamId IS NOT NULL AND (L.dispositionId =7 OR L.dispositionId =21) GROUP BY L.telecallerId )
    UNION
    (SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.employeeId as agentId,L.dispositionId,COUNT(L.srNo) as Lcount,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,SUM(L.totalDueAmount) as totalAmt,SUM(L.amountCollected) as collectAmt FROM leads AS L
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.telecallerId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect +` AND L.telecallerId IS NOT NULL AND L.teamId IS NOT NULL AND (L.dispositionId =9 OR L.dispositionId =23) GROUP BY L.telecallerId )
    UNION
    (SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.employeeId as agentId,L.dispositionId,COUNT(L.srNo) as Lcount,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,SUM(L.totalDueAmount) as totalAmt,SUM(L.amountCollected) as collectAmt FROM leads AS L 
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.telecallerId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect +` AND L.telecallerId IS NOT NULL AND L.teamId IS NOT NULL AND (L.dispositionId =10 OR L.dispositionId =24) GROUP BY L.telecallerId ORDER BY srNo ASC`+ ' LIMIT '+ length + ' OFFSET ' + start + `)`
    
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    

    let StrTeleQuery=`SELECT DISTINCT telecallerId,U.employeeId as agentId,COUNT(L.loanAccountNo) as LeadCount FROM leads AS L
    LEFT JOIN users as U ON L.telecallerId=U.id 
    WHERE `+ whereSelect +` AND L.telecallerId IS NOT NULL GROUP BY telecallerId`;
    
    let leadTeleData= await db.sequelize.query(StrTeleQuery, { type: Sequelize.QueryTypes.SELECT });
    

    let StrFosQuery=`SELECT DISTINCT fosId,U.employeeId as agentId,COUNT(L.loanAccountNo) as LeadCount FROM leads as L
    LEFT JOIN users as U ON L.fosId=U.id 
    WHERE L.fosId IS NOT NULL GROUP BY fosId`;
    
    let leadFosData= await db.sequelize.query(StrFosQuery, { type: Sequelize.QueryTypes.SELECT });
    

    let totalAgent=[...leadTeleData,...leadFosData];
    

    await Promise.all(leadData.map(async(lead) => {
      totalAgent.forEach(agent => {
        let loanAcontNo = '';
        if(agent.agentId==lead.agentId){
          lead.agentName=lead.agentId ? lead.agentId : '';
          lead.agentRole=lead.RoleName ? lead.RoleName : '';
          lead.leadCount = lead.Lcount ?  lead.Lcount : 0;
          lead.totalAmount = lead.totalAmt ? lead.totalAmt :0;
          lead.collectAmount = lead.collectAmt ? lead.collectAmt :0;
          lead.eventCount = lead.collectAmt ? 0 :0;
          lead.ptpCount = lead.collectAmt ? 0 :0;
          lead.rtpCount = lead.collectAmt ? 0 :0;
          lead.btpCount = lead.collectAmt ? 0 :0;
          lead.lastDisposition = lead.lastStatus ? lead.lastStatus :0;
          lead.subStatus = lead.subStatus ? lead.subStatus :0;
          lead.lastComment = lead.lastComment ? lead.lastComment :0;
          lead.colEfficiency = lead.collectAmt ? (lead.collectAmt/lead.totalAmt).toFixed(2) :0;
        }
      }); 
    }));
 

    return res.status(200).json({
      title: 'Success',
      error: false,
      data: leadData,
      recordsFiltered: (leadData) ? leadData.length :0,
      recordsTotal: (leadData) ? leadData.length :0,
    });
  }

};

/*
# purpose: misAgent Report 
*/

const misAgentReport = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 10;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let filterData=JSON.parse(req.body.filterObj);
  
  let date =  new Date().getFullYear();
  let fromDate=moment().startOf('month').format("YYYY-MM-DD");
  let toDate =moment().format("YYYY-MM-DD");
 


  let whereQuery = {};
  var whereSelect = 'L.isDeleted = 0';
  if(!filterData){
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${fromDate}' AND '${toDate}'`
  }
  if(res.locals.roleName=='FiName'){
    let FiId=req.body.id;
    whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
  }
 

  if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
    let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
    let todate = new Date(filterData.toDate);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.locationId != '') {
    whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
  }

  if (filterData && filterData.teamId != '') {
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
      whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
    }
  }



  let totalTeamLeads=[];

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    let leadData;
    let StrQuery=`SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.id as userId,L.fosTeamId as teamName,U.employeeId as agentId,L.dispositionId,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,L.totalDueAmount as totalAmt,L.amountCollected as collectAmt, L.telecallerId, L.fosId FROM leads AS L
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.fosId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect;
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    console.log("StrQueryAgent",StrQuery);
    
    let leadFinalData=[];
    /* 
     leadFinalData['F78130']={
       name:'akash',
       
     }
    */
     let temp;
     let empUserid=[];
     await Promise.all(leadData.map(async(lead) => {
      let Leadcount=0;
      if(leadFinalData[lead.userId]===undefined){
        empUserid.push(lead.userId); 
        if(lead.fosId!=null){
          leadFinalData[lead.userId]={
            "Employee ID" : lead.agentId ? lead.agentId : '',
            "Employee Name" : lead.agentName ? lead.agentName : '',
            "Agent Role": lead.RoleName ? lead.RoleName : '',
            "Case Count" : Leadcount+1,
            "Due Amt" : lead.totalAmt ? lead.totalAmt :0,
            "Collected" : lead.collectAmt ? lead.collectAmt :0,
            "PTP" : (lead.dispositionId=='21') ? 1 : 0,//for fos ptp count
            "RTP" :(lead.dispositionId=='24') ? 1 : 0,//for fos rtp count
            "BTP" : (lead.dispositionId=='23') ? 1 : 0,//for fos btp count
            "Collection Efficiency" : lead.collectAmt ? ((lead.collectAmt/lead.totalAmt)*100) :0,
          }
        }else{
          leadFinalData[lead.userId]={
            "Employee ID" : lead.agentId ? lead.agentId : '',
            "Employee Name" : lead.agentName ? lead.agentName : '',
            "Agent Role": lead.RoleName ? lead.RoleName : '',
            "Case Count" : Leadcount+1,
            "Due Amt" : lead.totalAmt ? lead.totalAmt :0,
            "Collected" : lead.collectAmt ? lead.collectAmt :0,
            "PTP" : (lead.dispositionId=='7') ? 1 : 0,//for telecaller ptp count
            "RTP" :(lead.dispositionId=='10') ? 1 : 0,//for telecaller rtp count
            "BTP" : (lead.dispositionId=='9') ? 1 : 0,//for telecaller btp count
            "Collection Efficiency" : lead.collectAmt ? ((lead.collectAmt/lead.totalAmt)*100) :0,
          }
        }

      }else{
       temp= leadFinalData[lead.userId];
       leadFinalData[lead.userId]['Case Count']=temp['Case Count']+1;
       leadFinalData[lead.userId]['Due Amt']=temp['Due Amt']+lead.totalAmt;
       leadFinalData[lead.userId]['Collected']=temp['Collected']+lead.collectAmt;
       leadFinalData[lead.userId]['Collection Efficiency']=((leadFinalData[lead.userId]['Collected']/leadFinalData[lead.userId]['Due Amt'])*100).toFixed(2);
      if(lead.fosId!=null){
       if(lead.dispositionId=='21'){
        leadFinalData[lead.userId]['PTP']=temp['PTP']+1;//for fos ptp count
       }
       if(lead.dispositionId=='24'){
        leadFinalData[lead.userId]['RTP']=temp['RTP']+1;//for fos rtp count
       }
       if(lead.dispositionId=='23'){
        leadFinalData[lead.userId]['BTP']=temp['BTP']+1;//for fos btp count
       }
      }else{
        if(lead.dispositionId=='7'){
         leadFinalData[lead.userId]['PTP']=temp['PTP']+1;//for telecaller ptp count
        }
        if(lead.dispositionId=='10'){
         leadFinalData[lead.userId]['RTP']=temp['RTP']+1;//for telecaller rtp count
        }
        if(lead.dispositionId=='9'){
         leadFinalData[lead.userId]['BTP']=temp['BTP']+1;//for telecaller btp count
        }
      }
      }
  
      }));
    
    // Last disposition, Last sub disposition, Last update , Last comment 
    // need to take it from case event table 
    await Promise.all(empUserid.map(async(userId) => {
      let strCase=`SELECT (COUNT(*) OVER()) as countLead,caseEvents.id,caseEvents.comments,caseEvents.dispositionId,subDispositionId,userId,D.name as Disposition,SD.name as subDisposition FROM caseEvents
      LEFT JOIN dispositions as D on caseEvents.dispositionId=D.id
      LEFT JOIN subDispositions as SD on caseEvents.subDispositionId=SD.id
      WHERE userId =${userId} ORDER BY caseEvents.id DESC LIMIT 0,1`;
     
     let caseEventData= await db.sequelize.query(strCase, { type: Sequelize.QueryTypes.SELECT });
     
     leadFinalData[userId]['Last Disposition'] = caseEventData[0] ? caseEventData[0].Disposition :'';
     leadFinalData[userId]['Last Sub-Disposition'] = caseEventData[0] ? caseEventData[0].subDisposition :'';
     leadFinalData[userId]['No of Events'] = caseEventData[0] ? caseEventData[0].countLead :0;
     leadFinalData[userId]['last comment'] = caseEventData[0] ? caseEventData[0].comments :'';
    
     }));
    
    let csvLeadData=[];
      if(Object.keys(leadFinalData).length>0){
        csvLeadData=Object.values(leadFinalData);
      }else{
        csvLeadData.push({
          "Employee ID" : '',
          "Employee Name" : '',
          "Agent Role": '',
          "Case Count" : '',
          "Due Amt" : '',
          "Collected": '',
          "No of Events" : '',
          "PTP" : '',
          "RTP" : '',
          "BTP": '',
          "Last Disposition": '',
          "Last Sub-Disposition" : '',
          "Last Comment" : '',
          "Collection Efficiency" :''
          });
      }
 
      const csvFields = [ "Employee ID","Employee Name","Agent Role", "Case Count","Due Amt","Collected","No of Events","PTP","RTP","BTP","Last Disposition","Last Sub-Disposition","Last Comment","Collection Efficiency"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvLeadData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=LeadReportMIS.csv");
      res.status(200).end(csvData);
  }

};

/*
# purpose: customer Case Report 
*/

const customerCaseReport = async (req, res) => {

  const user = req.session.user;
  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  const length = req.body.length ? parseInt(req.body.length) : 10;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let filterData=JSON.parse(req.body.filterObj);

  let date =  new Date().getFullYear();
  let fromDate=moment().startOf('month').format("YYYY-MM-DD");
  let toDate =moment().format("YYYY-MM-DD");
 

  let whereQuery = {};
  var whereSelect = 'L.isDeleted = 0';
  if(!filterData){
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${fromDate}' AND '${toDate}'`
  }
  if(res.locals.roleName=='FiName'){
    let FiId=req.body.id;
    whereSelect=whereSelect+` AND L.FIId = '${FiId}'`;
  }
 

  if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
    let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
    let todate = new Date(filterData.toDate);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  if (filterData && filterData.fi != '') {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId != '') {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.locationId != '') {
    whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
  }

  if (filterData && filterData.teamId != '') {
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
      whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
    }
  }

 

  let totalTeamLeads=[];

  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    let leadData;
    let StrQuery=`SELECT L.*,F.name as fiName FROM leads as L
    LEFT JOIN fis as F ON L.FIId=F.id
    WHERE `+ whereSelect;
   
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
  
    let leadFinalData=[];
    // Last disposition, Last sub disposition, Last update , Last comment 
    // need to take it from case event table 
    let countTele=0;
    let countfos=0;
    await Promise.all(leadData.map(async(lead) => {
      let strCase=`SELECT R.name as Role,caseEvents.leadId,caseEvents.id,caseEvents.comments,caseEvents.followUp,caseEvents.dispositionId,subDispositionId,userId,D.name as Disposition,SD.name as subDisposition FROM caseEvents
      LEFT JOIN dispositions as D on caseEvents.dispositionId=D.id
      LEFT JOIN subDispositions as SD on caseEvents.subDispositionId=SD.id
      LEFT JOIN users as U on caseEvents.userId=U.id
      LEFT JOIN roles as R on U.roleId=R.id
      WHERE leadId ='${lead.loanAccountNo}' ORDER BY caseEvents.id`;
     
     let caseEventData= await db.sequelize.query(strCase, { type: Sequelize.QueryTypes.SELECT });
     
     if(caseEventData.length>0){
     await Promise.all(caseEventData.map(async(caseEvent) => {
        leadFinalData.push({
          'Account No.' : lead.loanAccountNo,
          'Customer Name' : lead.name,
          'FI Name' : lead.fiName,
          'Total Due' : lead.totalDueAmount,
          'Collected' : lead.amountCollected,
          'Call intensity' : caseEvent.Role=='telecaller' ? countTele+1 :0,
          'Field intensity' :  caseEvent.Role=='fos' ? countfos+1 :0,
          'Call status' : caseEvent.Role=='telecaller' ? caseEvent.Disposition :'',
          'Field status' : caseEvent.Role=='fos' ? caseEvent.Disposition :'',
          'Follow up date' :(caseEvent && (caseEvent.Disposition=='Wrong Contact Number' || caseEvent.Disposition=='Promise to Pay' || caseEvent.Disposition=='Settlement/Foreclosure' || caseEvent.Disposition=='Call Back' || caseEvent.Disposition=='Legal Stage/Assigned to Lawyer')) ? moment(caseEvent.followUp).format('DD-MM-YYYY'): '',
         })
       }));
      }else{
        leadFinalData.push({
          'Account No.' : lead.loanAccountNo,
          'Customer Name' : lead.name,
          'FI Name' : lead.fiName,
          'Total Due' : lead.totalDueAmount,
          'Collected' : lead.amountCollected,
          'Call intensity' : '',
          'Field intensity' : '',
          'Call status' : '',
          'Field status' : '',
          'Follow up date' :  '',
         })
      }

     }));
     
    let csvLeadData=[];
      if(Object.keys(leadFinalData).length>0){
        csvLeadData=leadFinalData;
      }else{
        csvLeadData.push({
          "Account No." : '',
          "Customer Name": '',
          "FI Name" : '',
          "Total Due" : '',
          "Collected": '',
          "Call intensity" : '',
          "Field intensity": '',
          "Call status" : '',
          "Field status" : '',
          'Follow up date':''
          });
      }
     
      const csvFields = [ "Account No.","Customer Name", "FI Name","Total Due","Collected","Call intensity","Field intensity","Call status","Field status","Follow up date"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvLeadData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=LeadCaseReport.csv");
      res.status(200).end(csvData);
  }

};

/*
# purpose: getFI Count 
*/

const getFICount=async(req,res)=>{
  
   const dateArray=req.body;
    //get leads data
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'fis.isDeleted = 0';

    if(!req.body.hasOwnProperty('fromYear') && !req.body.hasOwnProperty('toYear')){
      req.body.fromYear=new Date().getFullYear();
      req.body.toYear=new Date().getFullYear();
    }

    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }
  
    

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT count(*) as count,SUBSTRING(date_format(createdAt, '%M'),1,3) AS month FROM fis 
    WHERE `+ adminWhere +` GROUP BY MONTH(createdAt)`;
    console.log("StrQuery FI",StrQuery);
  } 

    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    

    let countTotalFI=0;
    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

    await Promise.all (arrMonths.map( month =>{
     if(month.length > 0){
      leadData.map((lead) => {
          if(lead.month==month){
            countTotalFI=countTotalFI+lead.count;
            leadDataSet1[month]=(lead.count);
          }else{
            if(Object.keys(leadDataSet1).indexOf(month) < 0){
              leadDataSet1[month]=0;
            } 
          }
        });
     }else{
      leadDataSet1[month]=0;
     }
    }));
    
    // let keys = Object.keys(leadDataSet1);
    // let Value = Object.values(leadDataSet1);
    // let currentDate;
    // await Promise.all (arrMonths.map( (month,index) =>{
    //   leadDataSet2[month]=0;
    //   if(month=='Jan' || month=='Feb' || month=='Mar'){
    //      currentDate=moment().month(month).year( new Date().getFullYear()+ 1).format("YYYY-MM-DD");
    //   }else{
    //      currentDate=moment().month(month).format("YYYY-MM-DD");
    //   }
      
    //   let nextMonth=new Date().getMonth()+ 1;
    //   let nextYearDate=moment().month(nextMonth).format('YYYY-MM-DD'); 
    //   console.log("currentDate : nextYearDate",currentDate,nextYearDate);
    //     Value.map((lead,index1) => {
    //       if( currentDate < nextYearDate ){
    //       if(index1 < index){
    //         leadDataSet2[month]+=(lead)? Number(lead):0
    //       }
    //      }else{
    //       leadDataSet2[month]=0;
    //      }
    //     });
    //  }));
     
     console.log("leadDataSet1",leadDataSet1);
    
    payload={};
    payload.totalFI=countTotalFI;   
    payload.leadDataSet1=leadDataSet1;
    
   
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: payload,
    });
}

/*
# purpose: fisCount Report 
*/

const fisCountReport=async(req,res)=>{
  
   const dateArray=req.body;
    //get leads data
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let filterData=JSON.parse(req.body.filterObj);
    
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'fis.isDeleted = 0';

    if (filterData && filterData.fromYear != '' && filterData.toYear != '') {
      let fromDate=( filterData.fromYear !='' ) ? moment(filterData.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( filterData.toYear !='' ) ? moment(filterData.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }
  
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT * FROM fis 
    WHERE `+ adminWhere;
   
  } 

    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    

    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

    payload={};
    payload.leadDataSet1=leadData;
    let csvLeadData=[];
    if(leadData.length > 0){
      await Promise.all(leadData.map(async(leadData) => {
        csvLeadData.push({
        'FI Name':leadData.name ? leadData.name : '',
        'Created on':moment(leadData.createdAt).format('YYYY-MM-DD') ? moment(leadData.createdAt).format('YYYY-MM-DD') : '',
        'Category':leadData.category ? leadData.category :'',
        'Location':leadData.location ? leadData.location :''
        })
      }));
    }else{
      csvLeadData.push({
        'FI Name':'',
        'Created on':'',
        'Category':'',
        'Location':''
        })
    }

    const csvFields = ['FI Name','Created on','Category','Location'];
    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(csvLeadData);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=fiReport.csv");
    res.status(200).end(csvData);
}

/*
# purpose: getPortfolio Analysis 
*/

const getPortfolioAnalysis=async(req,res)=>{
  
   const dateArray=req.body;
    //get leads data
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if ( req.body.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${req.body.fi}`
    }

    if (req.body.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${req.body.locationId}'`
    }
  
    if (req.body.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${req.body.teamId} OR  L.fosTeamId = ${req.body.teamId})`
      }
    }

    if ( req.body.productId != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${req.body.productId}`
    }

    if ( req.body.dpdId != '') {
      whereSelect = whereSelect + ` AND L.DPDBucket = '${req.body.dpdId}'`
    }
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as LeadCount,
    SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    WHERE `+ adminWhere +` GROUP BY date_format(createdAt, '%M')`;
     
  } 

    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    

   
    let arrMonths=['Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec','Jan','Feb','Mar'];
   // Dataset1
    await Promise.all (arrMonths.map( month =>{
     if(month.length > 0){
      leadData.map((lead) => {
          if(lead.month==month){
            leadDataSet1[month]=(lead.totalAmount/100000);
          }else{
            if(Object.keys(leadDataSet1).indexOf(month) < 0){
              leadDataSet1[month]=0;
            }
            
          }
        });
     }else{
      leadDataSet1[month]=0;
     }
    }));
   
   // Dataset2
    await Promise.all (arrMonths.map( month =>{
      if(month.length > 0){
       leadData.map((lead) => {
           if(lead.month==month){
            leadDataSet2[month]=(lead.LeadCount);
           }else{
             if(Object.keys(leadDataSet2).indexOf(month) < 0){
               leadDataSet2[month]=0;
             }
             
           }
         });
      }else{
        leadDataSet2[month]=0;
      }
     }));

    payload={};
    payload.leadDataSet1=leadDataSet1;
    payload.leadDataSet2=leadDataSet2;
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: payload,
    });

}

/*
# purpose: portfolio Report 
*/

const portfolioReport=async(req,res)=>{
  
   const dateArray=req.body;
    //get leads data
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let filterData=JSON.parse(req.body.filterObj);


    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (filterData && filterData.fromYear != ''  && filterData.toYear != '') {
      let fromDate=( filterData.fromYear !='' ) ? moment(filterData.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( filterData.toYear !='' ) ? moment(filterData.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if (filterData && filterData.fi != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.fi}`
    }

    if (filterData && filterData.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
    }
  
    if (filterData && filterData.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
      }
    }

    if (filterData && filterData.productId != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.productId}`
    }

    if (filterData && filterData.dpdId != '') {
      whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.dpdId}'`
    }
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT L.createdAt as createdOn,F.name as fiName,PT.name as productName,P.fileName as poolName,P.poolValue as poolValue,
    COUNT(L.amountCollected) as LeadCount,SUM(L.amountCollected) as totalColAmount,P.noOfLeads as noOfLeads FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN productTypes as PT ON L.productTypeId=PT.id
    WHERE `+ adminWhere +` GROUP BY poolId`;
  } 

    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
  
   
    let arrMonths=['Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec','Jan','Feb'];
   // Dataset1
    
   let csvLeadData=[];
    if(leadData.length > 0){
      await Promise.all(leadData.map(async(leadData) => {
        csvLeadData.push({
        'Uploaded on':moment(leadData.createdOn).format('YYYY-MM-DD') ? moment(leadData.createdOn).format('YYYY-MM-DD') : '',
        'FI Name':leadData.fiName ? leadData.fiName : '',
        'Product':leadData.productName ? leadData.productName : '',
        'Pool Id/Name':leadData.poolName ? leadData.poolName : '',
        'Pool Value':leadData.poolValue ? leadData.poolValue : 0,
        'No. of Accounts':leadData.noOfLeads ? leadData.noOfLeads : 0
        })
      }));
    }else{
      csvLeadData.push({
        'Uploaded on':'',
        'FI Name':'',
        'Product':'',
        'Pool Id/Name':'',
        'Pool Value':0,
        'No. of Accounts':0
        })
    }
   
    const csvFields = ['Uploaded on','FI Name','Product', 'Pool Id/Name','Pool Value','No. of Leads'];
    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(csvLeadData);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=portfolioReport.csv");
    res.status(200).end(csvData);
}

/*
# purpose: getOverall Collection 
*/

const getOverallCollection=async(req,res)=>{

   const dateArray=req.body;
    //get leads data
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet={};
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if ( req.body.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${req.body.fi}`
    }
  
    if (req.body.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${req.body.PoolId}`
    }
  
    if (req.body.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${req.body.locationId}'`
    }
  
    if (req.body.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${req.body.teamId} OR  L.fosTeamId = ${req.body.teamId})`
      }
    }

    if ( req.body.productId != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${req.body.productId}`
    }

    if ( req.body.dpdId != '') {
      whereSelect = whereSelect + ` AND L.DPDBucket = '${req.body.dpdId}'`
    }
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    adminWhere = adminWhere + ` AND L.amountCollected > 0`;
    StrQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as RecoveredLeadCount,
    SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    WHERE `+ adminWhere +` GROUP BY date_format(createdAt, '%M')`;
   
  } 
console.log("StrQuery OVERALLL----",StrQuery);
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
   

    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

    await Promise.all (arrMonths.map( month =>{
      if(month.length > 0){
       leadData.map((lead) => {
           if(lead.month==month){
            leadDataSet[month]=(lead)? Number(lead.totalAmountRecover/100000) : 0;
           }else{
             if(Object.keys(leadDataSet).indexOf(month) < 0){
              leadDataSet[month]=0;
             } 
           }
         });
      }else{
       leadDataSet[month]=0;
      }
     }));

    payload={};
    payload.leadDataSet=leadDataSet;

    return res.status(200).json({
      title: 'Success',
      error: false,
      data: payload,
    });
}

/*
# purpose: overallReport 
*/

const overallReportDownload=async(req,res)=>{
 
   const dateArray=req.body;
    //get leads data
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet=[];
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let filterData=JSON.parse(req.body.filterObj);
   
    
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (filterData && filterData.fromYear != ''  && filterData.toYear != '') {
      let fromDate=( filterData.fromYear !='' ) ? moment(filterData.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( filterData.toYear !='' ) ? moment(filterData.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if (filterData && filterData.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
    }
  
    if (filterData && filterData.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
    }
  
    if (filterData && filterData.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
    }
  
    if (filterData && filterData.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
      }
    }

    if (filterData && filterData.productId != '') {
      whereSelect = whereSelect + ` AND L.productTypeId = ${filterData.productId}`
    }

    if (filterData && filterData.dpdId != '') {
      whereSelect = whereSelect + ` AND L.DPDBucket = '${filterData.dpdId}'`
    }
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT L.createdAt as createdOn,F.name as fiName,PT.name as productName,P.fileName as poolName,P.poolValue as poolValue,
    COUNT(L.amountCollected) as LeadCount,SUM(L.amountCollected) as totalColAmount,P.noOfLeads as noOfLeads FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    LEFT JOIN fis as F ON L.FIId=F.id
    LEFT JOIN productTypes as PT ON L.productTypeId=PT.id
    WHERE `+ adminWhere +` GROUP BY poolId`;
   
  } 

    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });


    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
     
    let csvLeadData=[];
    if(leadData.length > 0){
      await Promise.all(leadData.map(async(leadData) => {
        csvLeadData.push({
        'Uploaded on':moment(leadData.createdOn).format('YYYY-MM-DD') ? moment(leadData.createdOn).format('YYYY-MM-DD') :'',
        'FI Name':leadData.fiName ? leadData.fiName : '',
        'Product':leadData.productName ? leadData.productName :'',
        'Pool Id/Name':leadData.poolName ? leadData.poolName :'',
        'Pool Value':leadData.poolValue ? leadData.poolValue :0,
        'No. of Accounts':leadData.noOfLeads ? leadData.noOfLeads : 0,
        'Amount Collected':leadData.totalColAmount ? leadData.totalColAmount : 0,
        'No. of Accounts - Collected':leadData.LeadCount ? leadData.LeadCount : 0
        })
      }));
    }else{
      csvLeadData.push({
        'Uploaded on':'',
        'FI Name':'',
        'Product':'',
        'Pool Id/Name':'',
        'Pool Value':0,
        'No. of Accounts':0,
        'Amount Collected':0,
        'No. of Accounts - Collected':0
        })
    }
   
      const csvFields = ['Uploaded on','FI Name','Product', 'Pool Id/Name','Pool Value','No. of Leads','Amount Collected','No. of Accounts - Collected'];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvLeadData);
     
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=LeadOverallReport.csv");
      res.status(200).end(csvData);
}

/*
# purpose: getAgent 
*/

const getAgent=async(req,res)=>{

   const dateArray=req.body;
    //get leads data
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet={};
    let date =  new Date().getFullYear();
    let from_date=( req.body.fromDate !='' ) ? moment(req.body.fromDate).format('YYYY-MM-DD') :  moment(req.body.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =( req.body.toDate !='' ) ? moment(req.body.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"):  new Date(moment(req.body.fromDate).add('1','day').format('YYYY-MM-DD'));
    let to_Date =( req.body.toDate !='' ) ?  moment(req.body.toDate).format('YYYY-MM-DD') : toDate;
    let to_DateNew = new Date(to_Date);
    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (req.body.fromDate != ''  && req.body.toDate == '') {
      let from_date = moment(req.body.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(req.body.fromDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.updatedAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (req.body.toDate != ''  && req.body.fromDate == '') {
      let from_date = moment(req.body.toDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date); 
      let to_date = moment(req.body.toDate).add('1','day').format('YYYY-MM-DD');
      let toDate = new Date(to_date); 
      whereSelect = whereSelect + ` AND L.updatedAt BETWEEN '${from_date}' AND '${to_date}'`
    }

    if (req.body.fromDate != '' && req.body.toDate != '') {
      let from_date = moment(req.body.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date);
      let toDate =moment(req.body.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
      let todate = new Date(req.body.toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + `  AND (L.updatedAt >='${from_date}'  AND L.updatedAt <= '${todate.toISOString()}')`
    }

    let whereTeleFosSelect;
    if (req.body.fromDate != '' && req.body.toDate != '') {
      let from_date = moment(req.body.fromDate).format('YYYY-MM-DD');
      let fromDate = new Date(from_date);
      let toDate =moment(req.body.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
      let todate = new Date(req.body.toDate);
      todate.setUTCHours(23,59,59,999);
      whereTeleFosSelect = `(caseEvents.createdAt >='${from_date}'  AND caseEvents.createdAt <= '${todate.toISOString()}')`
    }

  //bar chart data 
  let StrTeleQuery;
  let StrFosQuery;
  let strTeleCase;
  let strFosCase;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminTeleWhere=whereSelect;
    adminTeleWhere = adminTeleWhere + ` AND L.teamId IS NOT NULL`;
    adminTeleWhere = adminTeleWhere + ` AND L.amountCollected > 0`;
    adminTeleWhere = adminTeleWhere + ` AND L.fosId IS NULL`;
    StrTeleQuery=`SELECT (COUNT(*) OVER()) as teleCount,
    SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    WHERE `+ adminTeleWhere +` GROUP BY telecallerId`;
    console.log("teleQuery",StrTeleQuery);
    let adminFosWhere=whereSelect;
    adminFosWhere = adminFosWhere + ` AND L.fosTeamId IS NOT NULL`;
    adminFosWhere = adminFosWhere + ` AND L.amountCollected > 0`;
    StrFosQuery=`SELECT (COUNT(*) OVER()) as fosCount,
    SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    WHERE `+ adminFosWhere +` GROUP BY fosId`;


    strTeleCase=`SELECT COUNT(caseEvents.id) as TCount,U.roleId FROM caseEvents
    LEFT JOIN users AS U ON caseEvents.userId=U.id
    WHERE `+ whereTeleFosSelect +` AND U.roleId !=7`;
    console.log("strTeleCase",strTeleCase);

  
    strFosCase=`SELECT COUNT(caseEvents.id) AS FCount,U.roleId FROM caseEvents
    LEFT JOIN users AS U ON caseEvents.userId=U.id
    WHERE `+ whereTeleFosSelect +` AND U.roleId=7`;
    console.log("strFosCase",strFosCase);
  } 
  console.log("StrFosQuery",StrFosQuery);
  let leadTeleCaseData= await db.sequelize.query(strTeleCase, { type: Sequelize.QueryTypes.SELECT });
  let leadFosCaseData= await db.sequelize.query(strFosCase, { type: Sequelize.QueryTypes.SELECT });

  let leadTeleData= await db.sequelize.query(StrTeleQuery, { type: Sequelize.QueryTypes.SELECT });
  let leadFosData= await db.sequelize.query(StrFosQuery, { type: Sequelize.QueryTypes.SELECT });
   let teleAvgCollection=0;
   let teleCollect=0;
   let teleCont;
   let fosAvgCollection=0;
   let fosCollect=0;
   let fosCont;

   await Promise.all (leadTeleData.map(teleData => {
    teleCollect=teleCollect + parseInt(teleData.totalAmountRecover);
    teleCont=(leadTeleCaseData[0]) ? leadTeleCaseData[0].TCount : 0;
  }));

  await Promise.all (leadFosData.map(fosData => {
    fosCollect=fosCollect + parseInt(fosData.totalAmountRecover);
    fosCont= (leadFosCaseData[0]) ? leadFosCaseData[0].FCount : 0;
  }));

  // console.log("tele =======",teleCollect,teleCont,fosCollect,fosCont);
   
  teleAvgCollection=(leadTeleData[0]) ? (teleCollect/teleCont).toFixed(2) :0;
  fosAvgCollection=(leadFosData[0]) ? (fosCollect/fosCont).toFixed(2) :0;

  payload={};
  payload.teleAvgCollection=teleAvgCollection;
  payload.fosAvgCollection=fosAvgCollection;
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
  });

}

/*
# purpose: getAgent Productivity 
*/

const getAgentProductivity=async(req,res)=>{
   const dateArray=req.body;
    //get leads data
    let leadTeleData,leadFosData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};
    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;
    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    let whereTeleFosSelect;
    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereTeleFosSelect = `caseEvents.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

  //bar chart data 
  let StrTeleQuery;
  let StrFosQuery;
  let strTeleCase;
  let strFosCase;
  let teleCont;
  let fosCont;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminTeleWhere=whereSelect;
    adminTeleWhere = adminTeleWhere + ` AND L.teamId IS NOT NULL`;
    adminTeleWhere = adminTeleWhere + ` AND L.amountCollected > 0`;
    StrTeleQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,
    COUNT(L.loanAccountNo) as teleCount,
    SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    WHERE `+ adminTeleWhere +` GROUP BY date_format(createdAt, '%M')`;

    let adminFosWhere=whereSelect;
    adminFosWhere = adminFosWhere + ` AND L.fosTeamId IS NOT NULL`;
    adminFosWhere = adminFosWhere + ` AND L.amountCollected > 0`;
    StrFosQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,
    COUNT(L.loanAccountNo) as fosCount,
    SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    WHERE `+ adminFosWhere +` GROUP BY date_format(createdAt, '%M')`;

    strTeleCase=`SELECT COUNT(caseEvents.id) as TCount,U.roleId FROM caseEvents
    LEFT JOIN users AS U ON caseEvents.userId=U.id
    WHERE `+ whereTeleFosSelect +` AND U.roleId !=7`;
    console.log("strTeleCase",strTeleCase);

  
    strFosCase=`SELECT COUNT(caseEvents.id) AS FCount,U.roleId FROM caseEvents
    LEFT JOIN users AS U ON caseEvents.userId=U.id
    WHERE `+ whereTeleFosSelect +` AND U.roleId=7`;
    console.log("strFosCase",strFosCase);
  } 

  let leadTeleCaseData= await db.sequelize.query(strTeleCase, { type: Sequelize.QueryTypes.SELECT });
  let leadFosCaseData= await db.sequelize.query(strFosCase, { type: Sequelize.QueryTypes.SELECT });
 
  teleCont=(leadTeleCaseData[0]) ? leadTeleCaseData[0].TCount : 0;
  fosCont= (leadFosCaseData[0]) ? leadFosCaseData[0].FCount : 0;

    leadTeleData= await db.sequelize.query(StrTeleQuery, { type: Sequelize.QueryTypes.SELECT });


    leadFosData= await db.sequelize.query(StrFosQuery, { type: Sequelize.QueryTypes.SELECT });


    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

    await Promise.all (arrMonths.map( month =>{
      if(month.length > 0){
        leadTeleData.map((lead) => {
           if(lead.month==month){
            leadDataSet1[month]=(lead)? (Number(lead.totalAmountRecover/teleCont)).toFixed(2) : 0;
           }else{
             if(Object.keys(leadDataSet1).indexOf(month) < 0){
              leadDataSet1[month]=0;
             } 
           }
         });
      }else{
        leadDataSet1[month]=0;
      }
     }));

    await Promise.all (arrMonths.map( month =>{
      if(month.length > 0){
        leadFosData.map((lead) => {
           if(lead.month==month){
            leadDataSet2[month]=(lead)? (Number(lead.totalAmountRecover/fosCont)).toFixed(2) : 0;
           }else{
             if(Object.keys(leadDataSet2).indexOf(month) < 0){
              leadDataSet2[month]=0;
             } 
           }
         });
      }else{
        leadDataSet2[month]=0;
      }
     }));
  
    payload={};
    payload.leadDataSet1=leadDataSet1;
    payload.leadDataSet2=leadDataSet2;
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: payload,
    });
}

/*
# purpose: agentProduct Report 
*/

const agentProductReport=async(req,res)=>{

   const dateArray=req.body;
    //get leads data
    let leadTeleData,leadFosData;
    let teamLeaderId=req.session.user.id;
    let leadDataSet1={};
    let leadDataSet2={};
    
    let date =  new Date().getFullYear();
    let filterData=JSON.parse(req.body.filterObj);

   
    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (filterData && filterData.fromYear != ''  && filterData.toYear != '') {
      let fromDate=( filterData.fromYear !='' ) ? moment(filterData.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( filterData.toYear !='' ) ? moment(filterData.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }


  //bar chart data 
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let leadData;
    let StrQuery=`SELECT CONCAT(U.firstName, ' ', U.lastName) as agentName,U.id as userId,L.fosTeamId as teamName,U.employeeId as agentId,L.dispositionId,R.name as RoleName,
    D.name as caseStatus,SD.name as subStatus,CE.comments AS lastComment,L.totalDueAmount as totalAmt,L.amountCollected as collectAmt, L.telecallerId, L.fosId FROM leads AS L
    LEFT JOIN caseEvents as CE ON L.dispositionId=CE.dispositionId
    LEFT JOIN users as U ON L.fosId=U.id
    LEFT JOIN roles as R ON U.roleId=R.id
    LEFT JOIN dispositions as D ON L.dispositionId=D.id
    LEFT JOIN subDispositions as SD ON L.subDispositionId=SD.id
    WHERE `+ whereSelect;
    
  
    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    let leadFinalData=[];
    /* 
     leadFinalData['F78130']={
       name:'akash',
       
     }
    */
     let temp;
     let empUserid=[];
     await Promise.all(leadData.map(async(lead) => {
      let Leadcount=0;
      if(leadFinalData[lead.userId]===undefined){
        empUserid.push(lead.userId); 
        if(lead.fosId!=null){
          leadFinalData[lead.userId]={
            "Employee ID" : lead.agentId ? lead.agentId : '',
            "Employee Name":lead.agentName ? lead.agentName : '',
            "Agent Role": lead.RoleName ? lead.RoleName : '',
            "Case Count" : Leadcount+1,
            "Due Amt" : lead.totalAmt ? lead.totalAmt :0,
            "Collected" : lead.collectAmt ? lead.collectAmt :0,
            "PTP" : (lead.dispositionId=='21') ? 1 : 0,//for fos ptp count
            "RTP" :(lead.dispositionId=='24') ? 1 : 0,//for fos rtp count
            "BTP" : (lead.dispositionId=='23') ? 1 : 0,//for fos btp count
            "Collection Efficiency" : lead.collectAmt ? ((lead.collectAmt/lead.totalAmt)*100) :0,
          }
        }else{
          leadFinalData[lead.userId]={
            "Employee ID" : lead.agentId ? lead.agentId : '',
            "Employee Name":lead.agentName ? lead.agentName : '',
            "Agent Role": lead.RoleName ? lead.RoleName : '',
            "Case Count" : Leadcount+1,
            "Due Amt" : lead.totalAmt ? lead.totalAmt :0,
            "Collected" : lead.collectAmt ? lead.collectAmt :0,
            "PTP" : (lead.dispositionId=='7') ? 1 : 0,//for telecaller ptp count
            "RTP" :(lead.dispositionId=='10') ? 1 : 0,//for telecaller rtp count
            "BTP" : (lead.dispositionId=='9') ? 1 : 0,//for telecaller btp count
            "Collection Efficiency" : lead.collectAmt ? ((lead.collectAmt/lead.totalAmt)*100) :0,
          }
        }
      }else{
        temp= leadFinalData[lead.userId];
        leadFinalData[lead.userId]['Case Count']=temp['Case Count']+1;
        leadFinalData[lead.userId]['Due Amt']=temp['Due Amt']+lead.totalAmt;
        leadFinalData[lead.userId]['Collected']=temp['Collected']+lead.collectAmt;
        leadFinalData[lead.userId]['Collection Efficiency']=((leadFinalData[lead.userId]['Collected']/leadFinalData[lead.userId]['Due Amt'])*100).toFixed(2);
        if(lead.fosId!=null){
       if(lead.dispositionId=='21'){
        leadFinalData[lead.userId]['PTP']=temp['PTP']+1;//for fos ptp count
       }
       if(lead.dispositionId=='24'){
        leadFinalData[lead.userId]['RTP']=temp['RTP']+1;//for fos rtp count
       }
       if(lead.dispositionId=='23'){
        leadFinalData[lead.userId]['BTP']=temp['BTP']+1;//for fos btp count
       }
      }else{
        
        if(lead.dispositionId=='7'){
         leadFinalData[lead.userId]['PTP']=temp['PTP']+1;//for telecaller ptp count
        }
        if(lead.dispositionId=='10'){
         leadFinalData[lead.userId]['RTP']=temp['RTP']+1;//for telecaller rtp count
        }
        if(lead.dispositionId=='9'){
         leadFinalData[lead.userId]['BTP']=temp['BTP']+1;//for telecaller btp count
        }
      }
      }
  
      }));
    
    // Last disposition, Last sub disposition, Last update , Last comment 
    // need to take it from case event table 
    await Promise.all(empUserid.map(async(userId) => {
      let strCase=`SELECT (COUNT(*) OVER()) as countLead,caseEvents.id,caseEvents.comments,caseEvents.dispositionId,subDispositionId,userId,D.name as Disposition,SD.name as subDisposition FROM caseEvents
      LEFT JOIN dispositions as D on caseEvents.dispositionId=D.id
      LEFT JOIN subDispositions as SD on caseEvents.subDispositionId=SD.id
      WHERE userId =${userId} ORDER BY caseEvents.id DESC LIMIT 0,1`;
  
     let caseEventData= await db.sequelize.query(strCase, { type: Sequelize.QueryTypes.SELECT });
    
     leadFinalData[userId]['Last Disposition'] = caseEventData[0] ? caseEventData[0].Disposition :'';
     leadFinalData[userId]['Last Sub-Disposition'] = caseEventData[0] ? caseEventData[0].subDisposition :'';
     leadFinalData[userId]['No of Events'] = caseEventData[0] ? caseEventData[0].countLead :0;
     leadFinalData[userId]['last comment'] = caseEventData[0] ? caseEventData[0].comments :'';
    
     }));

    let csvLeadData=[];
      if(Object.keys(leadFinalData).length>0){
        csvLeadData=Object.values(leadFinalData);
      }else{
        csvLeadData.push({
          "Employee ID" : '',
          "Employee Name":'',
          "Agent Role": '',
          "Case Count" : '',
          "Due Amt" : '',
          "Collected": '',
          "No of Events" : '',
          "PTP" : '',
          "RTP" : '',
          "BTP": '',
          "Last Disposition": '',
          "Last Sub-Disposition" : '',
          "Last Comment" : '',
          "Collection Efficiency" :''
          });
      }
  
      const csvFields = [ "Employee ID","Employee Name","Agent Role", "Case Count","Due Amt","Collected","No of Events","PTP","RTP","BTP","Last Disposition","Last Sub-Disposition","Last Comment","Collection Efficiency"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(csvLeadData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=LeadReportAgent.csv");
      res.status(200).end(csvData);
  }
}

/*
# purpose: getCollection Efficiency 
*/
const getCollectionEfficiency=async(req,res)=>{

   const dateArray=req.body;
    //get leads data
    let leadDataCollect;
    let teamLeaderId=req.session.user.id;
    let datasetB0={},datasetB1={},datasetB2={}, datasetB3={},datasetB4={},datasetB5={},datasetB6={},datasetB7={};

    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let fromYear=( req.body.fromYear !='' ) ? req.body.fromYear : date ;
    let toYear = ( req.body.toYear !='' ) ? req.body.toYear : date ;
    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (req.body.fromYear != ''  && req.body.toYear != '') {
      let fromDate=( req.body.fromYear !='' ) ? moment(req.body.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( req.body.toYear !='' ) ? moment(req.body.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if ( req.body.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${req.body.fi}`
    }
  
    if (req.body.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${req.body.PoolId}`
    }
  
    if (req.body.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${req.body.locationId}'`
    }
  
    if (req.body.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${req.body.teamId} OR  L.fosTeamId = ${req.body.teamId})`
      }
    }
  

  //bar chart data 
  let StrQuery;
  let StrQueryDPD;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    if(req.body.teamId == ''){
      adminWhere = adminWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
    }
    adminWhere = adminWhere + ` AND L.amountCollected > 0`;
    StrQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as RecoveredLeadCount,
    SUM(L.amountCollected) as totalAmountRecover,DPDBucket FROM leads as L 
    WHERE `+ adminWhere +` GROUP BY date_format(createdAt, '%M'),DPDBucket`;
 

    let adminDPDWhere=whereSelect;
    if(req.body.teamId == ''){
      adminDPDWhere = adminDPDWhere + ` AND (L.teamId IS NULL OR L.fosTeamId IS NULL)`;
    }
    StrQueryDPD=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as LeadCount,
    SUM(L.totalDueAmount) as totalAmount,DPDBucket FROM leads as L 
    WHERE `+ adminDPDWhere +` GROUP BY date_format(createdAt, '%M'),DPDBucket`;
  } 

    leadDataCollect= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    let leadDataTotal= await db.sequelize.query(StrQueryDPD, { type: Sequelize.QueryTypes.SELECT });
  

    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
    let dpdBucket=['B0','B1','B2','B3','B4','B5','B6','B7','Write-Off'];
    let allDataSet={};
    await Promise.all(dpdBucket.map(dpd => {
      let dpd2=(dpd=='Write-Off') ? 'WriteOff':dpd;
      allDataSet[dpd2]={};
      arrMonths.map(async (month) =>{
       
        let TotalDpd=await leadDataTotal.filter(val=>val.month==month && val.DPDBucket==dpd);
        let TotalCollect=await leadDataCollect.filter(val=>val.month==month && val.DPDBucket==dpd);
    
        if(TotalDpd[0] && TotalCollect[0]){
          allDataSet[dpd2][month]=TotalCollect[0].totalAmountRecover/TotalDpd[0].totalAmount;
        }else{
          allDataSet[dpd2][month]=0;
        }
      });
     }));

    payload={};
    payload.leadDataSetB0=allDataSet.B0;
    payload.leadDataSetB1=allDataSet.B1;
    payload.leadDataSetB2=allDataSet.B2;
    payload.leadDataSetB3=allDataSet.B3;
    payload.leadDataSetB4=allDataSet.B4;
    payload.leadDataSetB5=allDataSet.B5;
    payload.leadDataSetB6=allDataSet.B6;
    payload.leadDataSetB7=allDataSet.B7;
    payload.leadDataSetWriteOff=allDataSet.WriteOff;
    return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
  });

}
/*
# purpose: collection Efficiency Report
*/
const collectionEfficiencyReport=async(req,res)=>{

   const dateArray=req.body;
    //get leads data
    let leadDataCollect;
    let teamLeaderId=req.session.user.id;
    let datasetB0={},datasetB1={},datasetB2={}, datasetB3={},datasetB4={},datasetB5={},datasetB6={},datasetB7={};

    let date =  new Date().getFullYear();
    let next=  new Date().getFullYear() + 1;
    let filterData=JSON.parse(req.body.filterObj);

    let whereQuery={};
    whereQuery.isDeleted = 0;
    var whereSelect = 'L.isDeleted = 0';

    if (filterData && filterData.fromYear != ''  && filterData.toYear != '') {
      let fromDate=( filterData.fromYear !='' ) ? moment(filterData.fromYear,"YYYY-MM-DD").format('YYYY-04-01'): moment(date, "YYYY-MM-DD").format('YYYY-04-01') ;
      let toDate = ( filterData.toYear !='' ) ? moment(filterData.toYear, "YYYY-MM-DD").format('YYYY-03-31') :  moment(next, "YYYY-MM-DD").format('YYYY-03-31') ;
      let todate = new Date(toDate);
      todate.setUTCHours(23,59,59,999);
      whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate.toISOString()}'`
    }

    if (filterData && filterData.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
    }
  
    if (filterData && filterData.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
    }
  
    if (filterData && filterData.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
    }
  
    if (filterData && filterData.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
      }
    }
  

  //bar chart data 
  let StrQuery;
  let StrQueryDPD;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    let adminWhere=whereSelect;
    if(req.body.teamId == ''){
      adminWhere = adminWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
    }
    adminWhere = adminWhere + ` AND L.amountCollected > 0`;
    StrQuery=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as RecoveredLeadCount,
    SUM(L.amountCollected) as totalAmountRecover,DPDBucket FROM leads as L 
    WHERE `+ adminWhere +` GROUP BY date_format(createdAt, '%M'),DPDBucket`;

    let adminDPDWhere=whereSelect;
    if(req.body.teamId == ''){
      adminDPDWhere = adminDPDWhere + ` AND (L.teamId IS NULL OR L.fosTeamId IS NULL)`;
    }
    StrQueryDPD=`SELECT SUBSTRING(date_format(createdAt, '%M'),1,3) AS month,COUNT(L.loanAccountNo) as LeadCount,
    SUM(L.totalDueAmount) as totalAmount,DPDBucket FROM leads as L 
    WHERE `+ adminDPDWhere +` GROUP BY date_format(createdAt, '%M'),DPDBucket`;
  } 

    leadDataCollect= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    
    let leadDataTotal= await db.sequelize.query(StrQueryDPD, { type: Sequelize.QueryTypes.SELECT });

    let arrMonths=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
    let dpdBucket=['B0','B1','B2','B3','B4','B5','B6','B7','Write-Off'];
    let allDataSet={};
    let efficiencyCsv=[];
    await Promise.all(dpdBucket.map(dpd => {
      let dpd2=(dpd=='Write-Off') ? 'WriteOff':dpd;
      allDataSet[dpd2]={};
      arrMonths.map(async (month) =>{
       
        let TotalDpd=await leadDataTotal.filter(val=>val.month==month && val.DPDBucket==dpd);
        let TotalCollect=await leadDataCollect.filter(val=>val.month==month && val.DPDBucket==dpd);
    
        if(TotalDpd[0] && TotalCollect[0]){
          allDataSet[dpd2][month]=((TotalCollect[0].totalAmountRecover/TotalDpd[0].totalAmount)*100).toFixed(2);
          efficiencyCsv.push({
            'DPD Bucket':dpd2,
            'Month':month,
            'Month(Total Due)':TotalDpd[0].totalAmount,
            'Month(Collected Amount)':TotalCollect[0].totalAmountRecover,
            'Efficiency':((TotalCollect[0].totalAmountRecover/TotalDpd[0].totalAmount)*100).toFixed(2)
          })
        }else{
          allDataSet[dpd2][month]=0;
          efficiencyCsv.push({
            'DPD Bucket':dpd2,
            'Month':month,
            'Month(Total Due)':0,
            'Month(Collected Amount)':0,
            'Efficiency':0
          })
        }
      });
     }));
  
    let csvLeadData=efficiencyCsv;
    const csvFields = ['DPD Bucket','Month','Month(Total Due)','Month(Collected Amount)','Efficiency'];
    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(csvLeadData);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=LeadOverallReport.csv");
    res.status(200).end(csvData);

}

/*
# purpose: getTeamMembers
*/
const getTeamMembers=async(req,res)=>{
 
  const { teamId } = req.body;

  const members = await TeamMember.findAll({ where: { teamId: teamId }, include: [{ model: Users, as: 'user' }] });
  
  let teamMemberArr=[];
const teams = await Teams.findAndCountAll({ where: { isDeleted: 0 } });
let payload={};
payload.teams=teams.rows;
payload.teamMemberArr=teamMemberArr;
payload.isteamSelect=req.body.isteamSelect;
console.log("Team Member",teamMemberArr);
return res.status(200).json({
  title: 'Success',
  error: false,
  data: payload,
});
}

/*
# purpose: getMembers
*/

const getMembers=async(req,res)=>{
;
  const { teamId } = req.body;

  const members = await TeamMember.findAll({ where: { teamId: teamId }, include: [{ model: Users, as: 'user' }] });

  let teamMemberArr=[];
  await Promise.all(members.map(async(member) => {
  teamMemberArr.push({
    id:member.user.dataValues.id,
    name:member.user.dataValues.firstName+" "+member.user.dataValues.lastName
  })
}));
const teams = await Teams.findAndCountAll({ where: { isDeleted: 0 } });
let payload={};
payload.teamMemberArr=teamMemberArr;
payload.isteamSelect=req.body.isteamSelect;

return res.status(200).json({
  title: 'Success',
  error: false,
  data: payload,
});
}

/*
# purpose: getPoolName
*/
const getPoolName=async(req,res)=>{
 
  const { FIId } = req.body;

let poolArr=[];
const fis = await Fis.findAndCountAll({ where: { isDeleted: 0 } });
let payload={};
payload.fis=fis.rows;
payload.poolsArr=poolArr;
payload.isFiSelect=req.body.isFiSelect;
console.log("poolArr",poolArr);
return res.status(200).json({
  title: 'Success',
  error: false,
  data: payload,
});
}

/*
# purpose: getPool
*/

const getPool=async(req,res)=>{
;
  const { FIId } = req.body;
  let StrQuery;
  let poolData;
  let poolArr=[];
  if(FIId!=''){
    StrQuery=`SELECT P.id,P.fileName as poolName FROM leads as L
    LEFT JOIN pools as P ON L.poolId=P.id
    WHERE L.FIId=${FIId} AND P.status='Success' GROUP BY poolId`;
    poolData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    console.log("data======",poolData);

    await Promise.all(poolData.map(async(pooldata) => {
      poolArr.push({
      id:pooldata.id,
      name:pooldata.poolName
    })
  }));
  }
  
 

const fis = await Fis.findAndCountAll({ where: { isDeleted: 0 } });
let payload={};
payload.poolsArr=poolArr;
payload.isFiSelect=req.body.isFiSelect;

return res.status(200).json({
  title: 'Success',
  error: false,
  data: payload,
});
}

/*
# purpose: Download Report file for all Leads Tabs
*/
const misLeadReport =async(req,res)=>{

  let todayDate=moment(new Date()).format('YYYY-MM-DD');
  let filterData = JSON.parse(req.body.filterObj);
  var whereSelect = 'L.isDeleted = 0';


  if (filterData && filterData.fromDate != ''  && filterData.toDate == '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.fromDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.toDate != ''  && filterData.fromDate == '') {
    let from_date = moment(filterData.toDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date); 
    let to_date = moment(filterData.toDate).add('1','day').format('YYYY-MM-DD');
    let toDate = new Date(to_date); 
    whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${from_date}' AND '${to_date}'`
  }

  if (filterData && filterData.fromDate != '' && filterData.toDate != '') {
    let from_date = moment(filterData.fromDate).format('YYYY-MM-DD');
    let fromDate = new Date(from_date);
    let toDate =moment(filterData.toDate+'23:59:00', "YYYY-MM-DD hh:mm:ss"); 
    let todate = new Date(filterData.toDate);
    todate.setUTCHours(23,59,59,999);
    whereSelect = whereSelect + `  AND (L.createdAt >='${from_date}'  AND L.createdAt <= '${todate.toISOString()}')`
  }

  
  if (filterData && filterData.fi) {
    whereSelect = whereSelect + ` AND L.FIId = ${filterData.fi}`
  }

  if (filterData && filterData.PoolId) {
    whereSelect = whereSelect + ` AND L.poolId = ${filterData.PoolId}`
  }

  if (filterData && filterData.locationId) {
    whereSelect = whereSelect + ` AND L.applicantCity = '${filterData.locationId}'`
  }

  if (filterData && filterData.teamId) {
    whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR L.fosTeamId = ${filterData.teamId})`
  }

  if (filterData && filterData.agentId) {
    whereSelect = whereSelect + ` AND (L.telecallerId = ${filterData.agentId} OR L.fosId = ${filterData.agentId})`
  }

  if (filterData && filterData.dispositionId != '') {
    if(filterData.dispositionId==7){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${7} OR L.dispositionId = ${21})`
    }else if(filterData.dispositionId==8){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${8} OR L.dispositionId = ${22})`
    }else if(filterData.dispositionId==9){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${9} OR L.dispositionId = ${23})`
    }else if(filterData.dispositionId==10){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${10} OR L.dispositionId = ${24})`
    }else if(filterData.dispositionId==12){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${12} OR L.dispositionId = ${25})`
    }else if(filterData.dispositionId==13){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${13} OR L.dispositionId = ${26})`
    }else if(filterData.dispositionId==14){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${14} OR L.dispositionId = ${27})`
    }else if(filterData.dispositionId==15){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${15} OR L.dispositionId = ${28})`
    }else if(filterData.dispositionId==16){
      whereSelect = whereSelect + ` AND (L.dispositionId = ${16} OR L.dispositionId = ${29})`
    }else{
      whereSelect = whereSelect + ` AND L.dispositionId =  ${filterData.dispositionId}`
    }
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
    console.log("StrQuery reportLeads===",StrQuery);
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

module.exports = {
  index,
  filterData,
  customerList,
  customerReportDownload,
  getTeamMembers,
  getMembers,
  getPool,
  getPoolName,
  getFICount,
  fisCountReport,
  getPortfolioAnalysis,
  portfolioReport,
  getOverallCollection,
  overallReportDownload,
  getAgent,
  getAgentProductivity,
  agentProductReport,
  getCollectionEfficiency,
  collectionEfficiencyReport,
  misReportList,
  misAgentReport,
  customerCaseReport,
  misLeadReport
};
