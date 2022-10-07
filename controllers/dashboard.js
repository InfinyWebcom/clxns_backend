// NODE MODULES & DATABASE
const db = require('../models');
const moment = require('moment');
const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const { Op } = db.Sequelize;
const Leads = db.leads;
const Teams=db.teams;
const Users = db.users;
const Fis = db.fis;
const Pools = db.pools;
const Location = db.locations;
const Roles = db.roles;
const Disposition = db.dispositions;

/*
# purpose: to list Dashboard data
*/

const index = async(req, res) => {
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

  let todayDate=moment(new Date()).format('YYYY-MM-DD');

  let fromDate=moment().startOf('month').format("YYYY-MM-DD");
  let toDate =moment().format("YYYY-MM-DD");
  let todate = new Date(toDate);
  todate.setUTCHours(23,59,59,999);

  var whereSelect = 'L.isDeleted = 0';
  whereSelect = whereSelect + ` AND L.createdAt BETWEEN '${new Date(fromDate).toISOString()}' AND '${todate}'`
  let whereSearchQuery={};
  whereSearchQuery.createdAt = { [Op.and]: [{[Op.gte]: new Date(fromDate).toISOString()}, { [Op.lte]: todate } ]  }

  leads= await Leads.findAndCountAll({ where: whereSearchQuery});

  let teamLeaderId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
    leadData= await Leads.findAndCountAll({ where: whereSearchQuery, attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('totalDueAmount')), 'totalAmount'],
], logging: console.log });
 
  leadCount=(leadData.count > 0)? leadData.rows[0].dataValues.leadCount : 0 ;
  totalAmount=(leadData.count > 0)? leadData.rows[0].dataValues.totalAmount : 0 ;

  let whereQuery={};
  whereQuery.createdAt = { [Op.and]: [{[Op.gte]: new Date(fromDate).toISOString()}, { [Op.lte]: todate } ]  }
  whereQuery[Op.or]= [{teamId:  {[Op.ne]: null}},{fosTeamId: {[Op.ne]: null}}];

  caseAllocate = await Leads.findAndCountAll({ where: whereQuery , attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('totalDueAmount')), 'totalAmount'],
],logging: console.log });
  
   allocateLeadCount=(caseAllocate.count > 0)? caseAllocate.rows[0].dataValues.leadCount : 0 ;
   totalAmountAllocated=(caseAllocate.count > 0)? caseAllocate.rows[0].dataValues.totalAmount : 0 ;
   
  let caseWhereQuery={};
  caseWhereQuery.createdAt = { [Op.and]: [{[Op.gte]: new Date(fromDate).toISOString()}, { [Op.lte]: todate } ]  }
  caseWhereQuery.isDeleted=0;
  caseWhereQuery.amountCollected={ [Op.gt]: 0 };
  caseRecovered = await Leads.findAndCountAll({ where: caseWhereQuery, attributes: [
    [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
    [sequelize.fn('SUM', sequelize.col('amountCollected')), 'totalAmount'],
],logging: console.log });

    recoveredLeadCount=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.leadCount : 0 ;
    totalAmountRecovered=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.totalAmount : 0 ;
  }
  if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){

    let loginUserId=req.session.user.id;
    whereSelect +=` AND UT.id=${loginUserId}`;
    whereSelect +=` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect + ` AND L.expiryDate >= '${todayDate}'`;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

    leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    allocateLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmountAllocated=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect + ` AND L.expiryDate >= '${todayDate}'`;
  
    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
 
    recoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecovered=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
    let loginUserId=req.session.user.id;
    if(res.locals.roleName.name=='field_manager'){
    whereSelect +=` AND (UT.reportingTo=${loginUserId} OR L.fosId=${loginUserId})`;

    let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect + ` AND L.expiryDate >= '${todayDate}'`;

    leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
    

    leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

    allocateLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
    totalAmountAllocated=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
    }

    if(res.locals.roleName.name=='floor_manager'){
      whereSelect +=` AND UT.reportingTo=${loginUserId}`;
      let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ whereSelect + ` AND L.expiryDate >= '${todayDate}'`;

      leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
 
      leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

      allocateLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmountAllocated=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
      }

  
    whereSelect = whereSelect + ` AND L.amountCollected > 0`;
    let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
    LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
    LEFT JOIN users as UT ON T.teamLeaderId=UT.id
    WHERE `+ whereSelect + ` AND L.expiryDate >= '${todayDate}'`;
  
    
    caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });
   
    recoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
    totalAmountRecovered=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
  }

  if(res.locals.roleName.name=='telecaller'){
      let telecallerId=req.session.user.id;
      let teleWhere={};
      teleWhere.telecallerId=telecallerId;
      teleWhere.expiryDate={ [Op.gte]: todayDate}
      const leadsTele = await Leads.findAndCountAll({ where: teleWhere,attributes: [
        [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
        [sequelize.fn('SUM', sequelize.col('totalDueAmount')), 'totalAmount'],
    ], logging: console.log });

      leadCount=(leadsTele.count > 0)? leadsTele.rows[0].dataValues.leadCount : 0 ;
      totalAmount=(leadsTele.count > 0)? leadsTele.rows[0].dataValues.totalAmount : 0 ;
  
      allocateLeadCount=(leadsTele.count > 0)? leadsTele.rows[0].dataValues.leadCount : 0 ;
      totalAmountAllocated=(leadsTele.count > 0)? leadsTele.rows[0].dataValues.totalAmount : 0 ;
    
      let caseWhereQuery={};
      caseWhereQuery.isDeleted=0;
      caseWhereQuery.telecallerId=telecallerId;
      caseWhereQuery.amountCollected={ [Op.gt]: 0 };
      caseRecovered = await Leads.findAndCountAll({ where: caseWhereQuery, attributes: [
        [sequelize.fn('COUNT', sequelize.col('loanAccountNo')), 'leadCount'],
        [sequelize.fn('SUM', sequelize.col('amountCollected')), 'totalAmount'],
    ], logging: console.log });
      
    recoveredLeadCount=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.leadCount : 0 ;
    totalAmountRecovered=(caseRecovered.count > 0)? caseRecovered.rows[0].dataValues.totalAmount : 0 ;

  }
  
    if(res.locals.roleName.name!='admin' || res.locals.roleName.name!='business_head' || res.locals.roleName.name!='field_coordinator'
    || res.locals.roleName.name!='floor_manager' || res.locals.roleName.name!='field_manager' || res.locals.roleName.name!='telecaller'
    || res.locals.roleName.name!='team_leader'){
      let roleId=req.session.user.roleId;
      let userLevel = await Roles.findOne({ where: {id : roleId} });
    }
  
  const teams = await Teams.findAndCountAll({ where: { isDeleted: 0 } });
  const fis = await Fis.findAndCountAll({ where: {} });
  const pools = await Pools.findAndCountAll({ where: {status:"Success"} });
  const locations = await Location.findAndCountAll({ where: {} });

  const payload = {};
  payload.url = 'dashboard';
  payload.leads=leads.rows;
 
  payload.totalCases=leadCount;
  payload.caseAllocate=allocateLeadCount;
  payload.caseRecover=recoveredLeadCount;
  payload.casePending=allocateLeadCount-recoveredLeadCount;
  payload.totalAmount=totalAmount;
  payload.totalAmountAllocated=totalAmountAllocated;
  payload.totalAmountRecover=totalAmountRecovered;
  payload.amountPending=totalAmountAllocated-totalAmountRecovered;

  payload.moment=moment;
  payload.teams=teams.rows;
  payload.fis=fis.rows;
  payload.pools=pools.rows;
  payload.locations=locations.rows;
  res.render('admin/dashboard', payload);
};

/*
# purpose: to filter Dashboard data
*/
const filterData=async(req,res)=>{

  const {filterData}=req.body;

  // console.log("/n/n filterData",filterData);
    let todayDate=moment(new Date()).format('YYYY-MM-DD');
    let whereQuery={};
    var whereSelect = 'L.isDeleted = 0';

    if(res.locals.roleName.name!='admin' || res.locals.roleName.name!='business_head'){
      whereSelect=whereSelect+` AND L.expiryDate >= '${todayDate}'`;
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
      whereSelect = whereSelect + ` AND L.applicantCity = ${filterData.locationId}`
    }
  
    if (filterData && filterData.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${filterData.teamId} OR  L.fosTeamId = ${filterData.teamId})`
      }
      if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='floor_manager'){
        whereSelect = whereSelect + ` AND L.teamId = ${filterData.teamId}`
      }
      if(res.locals.roleName.name=='field_coordinator' || res.locals.roleName.name=='field_manager'){
        whereSelect = whereSelect + ` AND L.fosTeamId = ${filterData.teamId}`
      }
      if(res.locals.roleName.name=='telecaller'){
        whereSelect = whereSelect + ` AND L.teamId = ${filterData.teamId}`
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
    if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
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
    if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){
  
      let loginUserId=req.session.user.id;
      let totalWhere=whereSelect;
      totalWhere +=` AND UT.id=${loginUserId}`;
      totalWhere +=` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
      let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ totalWhere;

      leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

      leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

      let allocateWhere=whereSelect;
      allocateWhere +=` AND UT.id=${loginUserId}`;
      allocateWhere = allocateWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
      let allocateStrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ allocateWhere;

      caseAllocate= await db.sequelize.query(allocateStrQuery, { type: Sequelize.QueryTypes.SELECT });

      allocateLeadCount=(caseAllocate[0].LeadCount!=null) ? caseAllocate[0].LeadCount :0;
      totalAmountAllocated=(caseAllocate[0].totalAmount!=null) ? caseAllocate[0].totalAmount:0;
      
      let caseWhere=whereSelect;
      caseWhere +=` AND UT.id=${loginUserId}`;
      caseWhere = caseWhere + ` AND L.amountCollected > 0`;
      caseWhere = caseWhere + ` AND (L.telecallerId IS NOT NULL OR L.fosId IS NOT NULL)`;
      let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ caseWhere;

      caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });

      recoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
      totalAmountRecovered=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
    }
  
    if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
      let loginUserId=req.session.user.id;
      if(res.locals.roleName.name=='field_manager'){
        let totalWhere=whereSelect;
        totalWhere +=` AND (UT.reportingTo=${loginUserId} OR L.fosId=${loginUserId})`;
        totalWhere = totalWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
        let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
        LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
        LEFT JOIN users as UT ON T.teamLeaderId=UT.id
        WHERE `+ totalWhere;

        leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

        leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
        totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  
        let allocateWhere=whereSelect;
        allocateWhere +=` AND (UT.reportingTo=${loginUserId} OR L.fosId=${loginUserId})`;
        allocateWhere = allocateWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
        let allocateStrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
        LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
        LEFT JOIN users as UT ON T.teamLeaderId=UT.id
        WHERE `+ allocateWhere;

        caseAllocate= await db.sequelize.query(allocateStrQuery, { type: Sequelize.QueryTypes.SELECT });

        allocateLeadCount=(caseAllocate[0].LeadCount!=null) ? caseAllocate[0].LeadCount :0;
        totalAmountAllocated=(caseAllocate[0].totalAmount!=null) ? caseAllocate[0].totalAmount:0;
      }

      if(res.locals.roleName.name=='floor_manager'){
        let totalWhere=whereSelect;
        totalWhere +=` AND UT.reportingTo=${loginUserId}`;
        totalWhere = totalWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
        let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
        LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
        LEFT JOIN users as UT ON T.teamLeaderId=UT.id
        WHERE `+ totalWhere;

        leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

        leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
        totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  
        let allocateWhere=whereSelect;
        allocateWhere +=` AND UT.reportingTo=${loginUserId}`;
        allocateWhere = allocateWhere + ` AND (L.teamId IS NOT NULL OR L.fosTeamId IS NOT NULL)`;
        let allocateStrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
        LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
        LEFT JOIN users as UT ON T.teamLeaderId=UT.id
        WHERE `+ allocateWhere;

        caseAllocate= await db.sequelize.query(allocateStrQuery, { type: Sequelize.QueryTypes.SELECT });

        allocateLeadCount=(caseAllocate[0].LeadCount!=null) ? caseAllocate[0].LeadCount :0;
        totalAmountAllocated=(caseAllocate[0].totalAmount!=null) ? caseAllocate[0].totalAmount:0;
      }

      let caseWhere=whereSelect;
      caseWhere +=` AND UT.reportingTo=${loginUserId}`;
      caseWhere = caseWhere + ` AND L.amountCollected > 0`;
      let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ caseWhere;

      caseRecovered= await db.sequelize.query(caseStrQuery, { type: Sequelize.QueryTypes.SELECT });

      recoveredLeadCount=(caseRecovered[0].RecoveredLeadCount!=null) ? caseRecovered[0].RecoveredLeadCount :0;
      totalAmountRecovered=(caseRecovered[0].totalAmountRecover!=null)?caseRecovered[0].totalAmountRecover:0;
    }
  
    if(res.locals.roleName.name=='telecaller'){
      let telecallerId=req.session.user.id;	
      whereSelect +=` AND L.telecallerId=${telecallerId}`;
      let StrQuery=`SELECT COUNT(L.loanAccountNo) as LeadCount,SUM(L.totalDueAmount) as totalAmount FROM leads as L 
      LEFT JOIN teams as T ON L.teamId=T.id 
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ whereSelect;

      let leads= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });

      leadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmount=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;

      allocateLeadCount=(leads[0].LeadCount!=null) ? leads[0].LeadCount :0;
      totalAmountAllocated=(leads[0].totalAmount!=null) ? leads[0].totalAmount:0;
  
      whereSelect = whereSelect + ` AND L.amountCollected > 0`;
      let caseStrQuery=`SELECT COUNT(L.loanAccountNo) as RecoveredLeadCount,SUM(L.amountCollected) as totalAmountRecover FROM leads as L 
      LEFT JOIN teams as T ON L.teamId=T.id 
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ whereSelect;

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

}

/*
# purpose: to getRecoveredAmt in  donut chart 
*/
const getRecoveredAmt=async(req,res)=>{
   const dateArray=req.body;
    //get leads data
    let leadData;
    let teamLeaderId=req.session.user.id;
    let leadArrData={};
    let arrDate=[];
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

    if ( req.body.fi != '') {
      whereSelect = whereSelect + ` AND L.FIId = ${req.body.fi}`
    }
  
    if (req.body.PoolId != '') {
      whereSelect = whereSelect + ` AND L.poolId = ${req.body.PoolId}`
    }
  
    if (req.body.locationId != '') {
      whereSelect = whereSelect + ` AND L.applicantCity = ${req.body.locationId}`
    }
  
    if (req.body.teamId != '') {
      if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head'){
        whereSelect = whereSelect + ` AND (L.teamId = ${req.body.teamId} OR  L.fosTeamId = ${req.body.teamId})`
      }
      if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='floor_manager'){
        whereSelect = whereSelect + ` AND L.teamId = ${req.body.teamId}`
      }
      if(res.locals.roleName.name=='field_coordinator' || res.locals.roleName.name=='field_manager'){
        whereSelect = whereSelect + ` AND L.fosTeamId = ${req.body.teamId}`
      }
      if(res.locals.roleName.name=='telecaller'){
        whereSelect = whereSelect + ` AND L.teamId = ${req.body.teamId}`
      }
    }
  

  //bar chart data 
  let StrQuery;
  let loginUserId=req.session.user.id;
  if(res.locals.roleName.name=='admin' || res.locals.roleName.name=='business_head' || res.locals.roleName=='FiName'){
    let adminWhere=whereSelect;
    StrQuery=`SELECT SUM(amountCollected) AS amountCollected,
    date_format(updatedAt, "%Y-%m-%d") AS updated_At FROM leads AS L 
    WHERE `+ adminWhere +` GROUP BY updated_At`;
  } 

  if(res.locals.roleName!='FiName'){
    if(res.locals.roleName.name=='team_leader' || res.locals.roleName.name=='field_coordinator'){
      let teamWhere=whereSelect;
      teamWhere +=` AND UT.id=${loginUserId}`;
      teamWhere = teamWhere + ` AND L.amountCollected > 0`;
      StrQuery=`SELECT SUM(amountCollected) AS amountCollected,
      date_format(L.updatedAt, "%Y-%m-%d") AS updated_At FROM leads AS L  
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ teamWhere +` GROUP BY updated_At`;
    }
  
    if(res.locals.roleName.name=='floor_manager' || res.locals.roleName.name=='field_manager'){
      let floorWhere=whereSelect;
      floorWhere +=` AND UT.reportingTo=${loginUserId}`;
      floorWhere = floorWhere + ` AND L.amountCollected > 0`;
      StrQuery=`SELECT SUM(amountCollected) AS amountCollected,
      date_format(L.updatedAt, "%Y-%m-%d") AS updated_At FROM leads AS L
      LEFT JOIN teams as T ON (L.teamId=T.id) OR (L.fosTeamId=T.id)
      LEFT JOIN users as UT ON T.teamLeaderId=UT.id
      WHERE `+ floorWhere +` GROUP BY updated_At`;
    }
  
    if(res.locals.roleName.name=='telecaller'){
      let telecallerId=req.session.user.id;	
      let teleWhere=whereSelect;
      teleWhere +=` AND L.telecallerId=${telecallerId}`;
      teleWhere = teleWhere + ` AND L.amountCollected > 0`;
      StrQuery=`SELECT SUM(amountCollected) AS amountCollected,
      date_format(L.updatedAt, "%Y-%m-%d") AS updated_At FROM leads AS L
      LEFT JOIN teams as T ON L.teamId=T.id 
      LEFT JOIN users as U ON T.teamLeaderId=U.id
      WHERE `+ teleWhere +` GROUP BY updated_At`;
    }
  }



    leadData= await db.sequelize.query(StrQuery, { type: Sequelize.QueryTypes.SELECT });
  
    for(i=fromDate;i<=to_DateNew;i.setDate(i.getDate() + 1)){
         if(req.body.toDate !=""){
          arrDate.push(i.toISOString().slice(0, -14));
         }  
    }

    if(req.body.toDate ==""){
      arrDate.push(new Date(req.body.fromDate).toISOString().slice(0, -14));
     }  

    await Promise.all (arrDate.map( date =>{
     if(leadData.length > 0){
      leadData.map((lead) => {
          if(lead.updated_At==date){
            leadArrData[date]=(lead.amountCollected/10000000);
          }else{
            if(Object.keys(leadArrData).indexOf(date) < 0){
              leadArrData[date]=0;
            }
            
          }
        });
     }else{
      leadArrData[date]=0;
     }
    }));
   

    //donut chart data 
   let donutLabels= await Disposition.findAll({ group: ['name'],raw:true ,logging: console.log});
   let donutDataArr={};

  let donutStrQuery=`SELECT L.dispositionId,D.name, COUNT(L.loanAccountNo) AS count FROM leads AS L LEFT JOIN dispositions D ON L.dispositionId= D.id
  WHERE `+ whereSelect +` AND (L.dispositionId IS NOT NULL OR L.dispositionId IS NULL) GROUP BY L.dispositionId`;

  let donutLeadData = await db.sequelize.query(donutStrQuery, { type: Sequelize.QueryTypes.SELECT });

  let totalCountWhere=`SELECT * FROM leads AS L 
  WHERE `+ whereSelect +` AND (L.dispositionId IS NOT NULL OR L.dispositionId IS NULL)`;
  

  let totalCount = await db.sequelize.query(totalCountWhere, { type: Sequelize.QueryTypes.SELECT });
  if(donutLeadData.length > 0){
    await Promise.all (donutLeadData.map((countData) => {
        if(countData.dispositionId==null){
         donutDataArr['New Leads']=(((countData.count)/totalCount.length)*100).toFixed(2);
        }else{
         donutDataArr[countData.name]=(((countData.count)/totalCount.length)*100).toFixed(2);
        }
    }));
  }
  else{
    donutDataArr['No data available in donuts chart']=0;
  }
  payload={};
  payload.leadArrData=leadArrData;
  payload.donutDataArr=donutDataArr;
  payload.caseCount=totalCount.length;
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: payload,
  });

}

module.exports = {
  index,
  filterData,
  getRecoveredAmt
};
