// NODE MODULES
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { validationResult } = require('express-validator');
const moment = require('moment');
const nodeGeocoder = require('node-geocoder');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const fs = require('fs');
const ejs = require("ejs");
// UTILITIES
const email = require('../utils/email');
const helper = require('../helper/helper');
const emailTemplate = require('../helper/emailTemplate');
const eventSuppContr = require('./caseEventsSupportings');

// DATABASE
const db = require('../models');
const leads = require('../models/leads');
const Op = db.Sequelize.Op;
const Users = db.users;
const Teams = db.teams;
const Roles = db.roles;
const UserExperience=db.userExperience;
const Plan = db.plan;
const Leads = db.leads;
const Modules = db.modules;
const RoleModules = db.rolesModules;
const DPD = db.dpd;
const leadsContactUpdate = db.leadsContactUpdate;
const Fis = db.fis;
const OperatingLocation =db.operatingLocations;
const Notification = db.notification;
const caseEvent = db.caseEvent;
const dispositions = db.dispositions;
const subDispositions = db.subDispositions;
const payments = db.payments;
const caseEventSupporting = db.caseEventSupporting;
const UpdatedContact = db.leadsContactUpdate;
/*
# parameters: mobile, password
# purpose: login for fos
*/
const login = async (req, res) => {
    const result = validationResult(req);

    console.log('login errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    console.log('\n\nUsers req.body -: ', req.body);
    const { email, password } = req.body;
    console.log('\n\nUsers req.body1 -: ', req.body);

    const roles = await Roles.findAll();
    const FOSIndex = roles.findIndex((e) => e.name == 'fos');

    const userData = await Users.findOne({ where: { email: email, roleId: FOSIndex + 1 } });
    console.log('\n\nUsers userData -: ', userData);

    if (!userData || userData.isDeleted == true) {
        return res.status(200).json({
            title: 'User not found',
            flag: 'user_not_found',
            error: true,
        });
    }

    const role = await Roles.findOne({ where: { id: userData.roleId , status:'active'} });
    console.log('\n\nUsers Roles -: ', role);

    if (!role || role == undefined) {
        return res.status(200).json({
            title: 'User permissions denied',
            flag: 'user_permission_denied',
            error: true,
        });
    }

    if (!bcrypt.compareSync(password, userData.password)) {
        return res.status(200).json({
            title: 'You have entered an invalid email or password',
            flag: 'user_password',
            error: true,
        });
    }

    helper.generateToken(userData, (token) => {
        return res.status(200).json({
            title: "Logged in successfully",
            error: false,
            token: token,
            data: userData
        });
    })
};

/*
# parameters: token, deviceToken
# purpose: logout for fos
*/
const logout = async (req, res) => {  
    console.log('userLogout req', req.body)

    let reqUser = req.user;
    console.log('userLogout reqUser', reqUser)

    let userData = reqUser

    console.log('userLogout userData ', userData);

    if (!userData) {
        return res.status(200).json({
            title: 'User not found',
            flag: 'user_not_found',
            error: true
        })
    }

    return res.status(200).json({
        title: 'Logout successful',
        error: false
    });
};
  
/*
# parameters: mobile
# purpose: forgot password for fos
*/
const forgotPassword = async (req, res) => {
    const result = validationResult(req);

    console.log('forgotPassword errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    
    console.log('forgotPassword req.body :-', req.body);

    const { email } = req.body;

    const roles = await Roles.findAll();
    const FOSIndex = roles.findIndex((e) => e.name == 'fos');

    const userData = await Users.findOne({ where: { email: email, roleId: FOSIndex + 1} });
    console.log('\n\nUsers userData -: ', userData);

    if (!userData || userData.isDeleted == true) {
        return res.status(200).json({
            title: 'User not found',
            flag: 'user_not_found',
            error: true,
        });
    }

    const role = await Roles.findOne({ where: { id: userData.roleId, status:'active'} });
    console.log('\n\nUsers Roles -: ', role);

    if (!role || role == undefined) {
        return res.status(200).json({
            title: 'User permissions denied',
            flag: 'user_permission_denied',
            error: true,
        });
    }

    var verifyOtp = randomstring.generate({
        length: 4,
        charset: 'numeric'
    });
    console.log("forgotPassword verifyOtp", verifyOtp)
    
    //mail to user
    var emailData = {
        name: userData.firstName + " " + userData.lastName,
        email: userData.email,
        verifyOtp: verifyOtp
    }
    emailTemplate.getEmailTemplate("forgot_password", emailData)

    const updateUser = await Users.update(
        { otp: verifyOtp, otpExpired: Date.now() + 600000 }, // 10 min
        { where: { email: email, roleId: FOSIndex + 1} },
    );
    console.log("forgotPassword updateUser", updateUser)

    helper.generateToken(userData, (token) => {
        return res.status(200).json({
            title: "OTP sent successfully",
            error: false,
            token: token
        });
    })
}
  
/*
# parameters: verifyOtp, token
# purpose: verify password for fos
*/
const verifyPassword = async (req, res) => {
    const result = validationResult(req);

    console.log('verifyPassword errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }    
    console.log('verifyPassword req.body :-', req.body);

    const decoded = jwt.decode(req.body.token, "clxns");
    console.log("verifyPassword authenticateUser", decoded)

    if (!decoded) {
        return res.status(200).json({
            title: 'User not found',
            error: true
        })
    }
    console.log('verifyPassword Date.now() -: ', new Date() );

    let userData = await Users.findOne({ where: { email: decoded.email, otp: req.body.verifyOtp, otpExpired: { [Op.gte]: new Date() } } });
    console.log('verifyPassword userData -: ', userData);

    if (!userData) {
        return res.status(200).json({
            title: 'OTP entered is not valid or expired',
            flag: 'otp_expired',
            error: true
        })
    }
    if (req.body.email !== decoded.email) {
        return res.status(200).json({
            title: 'Invalid email address.',
            error: true
        })
    }
    if (userData.isDeleted == true) {
        return res.status(200).json({
            title: 'User not found',
            flag: 'user_not_found',
            error: true,
        });
    }
    const updateUser = await Users.update(
        { otp: undefined, otpExpired: undefined },
        { where: { email: decoded.email, otp: req.body.verifyOtp } },
    );
    console.log('verifyPassword updateUser -: ', updateUser);

    helper.generateToken(userData, (token) => {
        return res.status(200).json({
            title: "OTP verified successfully",
            error: false,
            // data: userData,
            token: token
        });
    })
};


/*
# parameters: token
# purpose: To get user details
*/
const getUserDetails = async (req, res) => {
    console.log('getUserDetails req.body ', req.body);

    const result = validationResult(req);
    console.log('getUserDetails errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    let userData = await Users.findOne({ where: { id: req.user.id }, include: [{ model: Users, as: 'reporting' }] });

    return res.status(200).json({
        title: "User details",
        error: false,
        data: userData
    });
}

/*
# parameters: token, leadStatus, assignDate=2021-07-21
# purpose: To get alotted cases list
*/
const getCasesList = async (req, res) => {
    console.log('getCasesList req.body ', req.body);

    let length = req.body.length ? parseInt(req.body.length) : 100;
    let start = req.body.start ? parseInt(req.body.start) : 0;
    let todayDate=moment(new Date()).format('YYYY-MM-DD');
    var query = { fosId: req.user.id }
    if (req.body.leadStatus == "open") {
        query = { fosId: req.user.id, collectionStatus: "Paid" }
    }
    if (req.body.leadStatus == "closed") {
        query = { fosId: req.user.id, collectionStatus: { [Op.ne]:  "Paid" } }
    }
    if (req.body.search && req.body.search != '') {
        query = { ...query, [Op.or]: [{ applicantPincode: { [Op.like]: `%${req.body.search}%` } }, { name: { [Op.like]: `%${req.body.search}%` } },
         { phone: { [Op.like]: `%${req.body.search}%` } }, { loanAccountNo: { [Op.like]: `%${req.body.search}%` } }]}
    }
    if (req.body.dispositionId && req.body.dispositionId != "") {
        query = { ...query, dispositionId: { [Op.eq]: req.body.dispositionId }  }
    }
    if (req.body.subdispositionId && req.body.subdispositionId != '') {
        query = { ...query,  subDispositionId: { [Op.eq]: req.body.subdispositionId } }
    }
    if (req.body.viewPending && req.body.viewPending == 1) {
        query = { ...query, dispositionId: { [Op.eq]: 19 }  }
    }
    let includeQuery = [];
    if (req.body.followUp && req.body.followUp == 1) {
        includeQuery = [{ model: dispositions, as: 'disposition' },{ model: subDispositions, as: 'subDisposition' }
        ,{ model: Fis }, { model: Plan, as: 'plans' }, { model: caseEvent, as: 'caseEvent', where: {followUp: { [Op.gte]:  new Date() }, userId: req.user.id} }];
    }else{
        includeQuery = [{ model: dispositions, as: 'disposition' },{ model: subDispositions, as: 'subDisposition' }
        ,{ model: Fis }, { model: Plan, as: 'plans' }];
    }
    if (req.body.fromDate && req.body.toDate) {
        let from = new Date(req.body.fromDate)
        let to = new Date(req.body.toDate)
        let start_date = moment(from).format('YYYY-MM-DD');
        let end_date = moment(to).format('YYYY-MM-DD');
        console.log('getCasesList date-- ', new Date(start_date), new Date(end_date));
        query.updatedAt = {[Op.and]: [{ [Op.gte]: new Date(start_date)}, { [Op.lte]: new Date(end_date).setUTCHours(23,59,59,999) } ]}
    }
    query.expiryDate ={ [Op.gte]: todayDate };
    console.log("includeQuery---------",includeQuery);
    console.log('query --', query);
    const leads = await Leads.findAndCountAll({ limit: length, offset: start, where: query , include: includeQuery,
        attributes: ["srNo","name","totalDueAmount","loanAccountNo","applicantPincode","fosAssignedDate","amountCollected"],
        order: [['fosAssignedDate', 'DESC']]
        ,logging: console.log});

    console.log("lead---------",leads);

    // const sumAmount = await Leads.sum('totalDueAmount', { where: query })//TOTAL DUE AMOUNT
    // const sumAmount = await leads.rows.length > 0 ? leads.rows.reduce((acc, current) => acc + current.totalDueAmount,0) : 0//TOTAL DUE AMOUNT
    const sumAmount = await leads.rows.length > 0 ?  leads.rows.reduce(function (acc, current) {
        let value = Number(current.totalDueAmount) - Number(current.amountCollected)
        return acc + value;
    }, 0) : 0;
    console.log('getCasesList sumAmount-- ', sumAmount);

    return res.status(200).json({
        title: 'Cases list',
        error: false,
        data: leads.rows,
        total: leads.count,
        collectable: sumAmount
    });
}

/*
# parameters: token, leadId
# purpose: To add case to plan
*/
const addToPlan = async (req, res) => {
    console.log('addToPlan req.body ', req.body);

    const result = validationResult(req);
    console.log('addToPlan errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    var plan_date = moment(req.body.planDate).format('YYYY-MM-DD')

    const newPlan = {
        leadId: req.body.leadId,
        fosId: req.user.id,
        planDate: new Date(plan_date)
    };
    
    const createPlan = await Plan.create(newPlan);
    let id = createPlan.dataValues.id;

    return res.status(200).json({
        title: 'Added successfully',
        error: false,
        data: createPlan
    });
}

/*
# parameters: token
# purpose: To list plan
*/
const listMyPlan = async (req, res) => {
    console.log('listMyPlan req.body ', req.body);

    let length = req.body.length ? parseInt(req.body.length) : 5;
    let start = req.body.start ? parseInt(req.body.start) : 0;

    var query = { fosId: req.user.id }
    var plan_date = req.body.planDate ? new Date(req.body.planDate) : new Date()
    var planDate = moment(plan_date).format('YYYY-MM-DD')

    console.log('listMyPlan plan_date ', planDate, new Date(planDate));
    query.planDate = {[Op.and]: [{ [Op.gte]: new Date(planDate) }, { [Op.lte]: new Date(planDate).setUTCHours(23,59,59,999) } ] }
    //limit: length, offset: start,
    const plans = await Plan.findAndCountAll({ where: query, include: [{ model: Leads, as: 'lead',
    include: [{ model: Fis },{ model: dispositions },{ model: subDispositions }] }] });
    console.log('listMyPlan plans.rows-- ', plans);

    return res.status(200).json({
        title: 'My plans list',
        error: false,
        data: plans.rows,
        total: plans.count
    });
}

/*
# parameters: token, leadId=loanaccountno
# purpose: To get case details
*/
const getCaseDetails = async (req, res) => {
    console.log('getCaseDetails req.body ', req.body);

    const result = validationResult(req);
    console.log('getCaseDetails errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    const leadData = await Leads.findOne({ where: { loanAccountNo: req.body.loanAccountNo },include: [{ model: Fis }] });
    const updatedContact = await UpdatedContact.findAll({ where: { leadId: req.body.loanAccountNo }, order: [['createdAt', 'DESC']] });
    
    console.log('getCaseDetails leadData-- ', leadData);

    return res.status(200).json({
        title: 'Case Details',
        error: false,
        data: leadData,
        updatedContact: updatedContact
    });
}

/*
# parameters: token
# purpose: To list notifications
*/
const notificationListing = async (req, res) => {
    console.log('notificationListing req.body ', req.body);

    let length = req.body.length ? parseInt(req.body.length) : 5;
    let start = req.body.start ? parseInt(req.body.start) : 0;

    const notifications = await Notification.findAndCountAll({ limit: length, offset: start, where: {} });
    
    console.log('notificationListing plans.rows-- ', notifications);

    return res.status(200).json({
        title: 'Notifications list',
        error: false,
        data: notifications.rows,
        total: notifications.count
    });
}

/*
# parameters: token
# purpose: To get statistics data
*/
const getStatisticsData = async (req, res) => {
    let date = new Date()

    let start = moment(date).startOf('day');
    let end = moment(date).endOf('day');
    let weekStart =moment(date.setDate(date.getDate() - 6)).startOf('day');
    let weekEnd =  end;
    let monthStart = moment(date).startOf('month');
    let monthEnd = moment(date).endOf('month');
    console.log('getStatisticsData assign_datenew ',new Date(weekStart),new Date(weekEnd),new Date(monthStart),new Date(monthEnd));
    
    let today = {};
    let actionsToday = {};
    let summaryToday = {};

    let week = {};
    let actionsWeek = {};
    let summaryWeek = {};

    let month = {};
    let actionsMonth = {};
    let summaryMonth = {};

    let todayDate=moment(new Date()).format('YYYY-MM-DD');

    let whereQuery = {};
    whereQuery.fosAssignedDate = { [Op.and]: [{ [Op.gte]: new Date(start) }, { [Op.lte]: new Date(end) }] };
    whereQuery.fosId = req.user.id;
    whereQuery.expiryDate = [{ [Op.gte]: todayDate}];
    let whereSelect={};
    whereSelect.expiryDate = [{ [Op.gte]: todayDate}];
    let todayQuery = `SELECT SUM(pos) pos, SUM(totalDueAmount) totalDueAmount, loanAccountNo, SUM(amountCollected) amountCollected FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(start).toISOString()}" AND
     "${new Date(end).toISOString()}" AND expiryDate >= '${todayDate}'`;
    let weekQuery = `SELECT SUM(pos) pos, SUM(totalDueAmount) totalDueAmount, loanAccountNo, SUM(amountCollected) amountCollected FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(weekStart).toISOString()}" AND
     "${new Date(weekEnd).toISOString()}" AND expiryDate >= '${todayDate}'`;
    let monthQuery = `SELECT SUM(pos) pos, SUM(totalDueAmount) totalDueAmount, loanAccountNo, SUM(amountCollected) amountCollected FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(monthStart).toISOString()}" AND
     "${new Date(monthEnd).toISOString()}" AND expiryDate >= '${todayDate}'`;

     let todayQueryUpdated =  `SELECT SUM(pos) pos, SUM(totalDueAmount) totalDueAmount, loanAccountNo, SUM(amountCollected) amountCollected FROM leads WHERE fosId = ${req.user.id} AND leads.updatedAt BETWEEN "${new Date(start).toISOString()}" AND
     "${new Date(end).toISOString()}" AND expiryDate >= '${todayDate}'`;
     let totalTodayUpdated = await db.sequelize.query(todayQueryUpdated, { type: Sequelize.QueryTypes.SELECT });

    console.log("QueryWeek",weekQuery);
    let totalToday = await db.sequelize.query(todayQuery, { type: Sequelize.QueryTypes.SELECT });
    let totalWeek = await db.sequelize.query(weekQuery, { type: Sequelize.QueryTypes.SELECT });
    let totalMonth = await db.sequelize.query(monthQuery, { type: Sequelize.QueryTypes.SELECT });

    let countTodayQ = `SELECT COUNT(loanAccountNo) count FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(start).toISOString()}" AND
    "${new Date(end).toISOString()}" AND expiryDate >= '${todayDate}'`;
    let countToday = await db.sequelize.query(countTodayQ, { type: Sequelize.QueryTypes.SELECT });

    let countWeekQ = `SELECT COUNT(loanAccountNo) count FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(weekStart).toISOString()}" AND
    "${new Date(weekEnd).toISOString()}" AND expiryDate >= '${todayDate}'`;
    let countWeek = await db.sequelize.query(countWeekQ, { type: Sequelize.QueryTypes.SELECT });

    let countMonthQ = `SELECT COUNT(loanAccountNo) count FROM leads WHERE fosId = ${req.user.id} AND fosAssignedDate BETWEEN "${new Date(monthStart).toISOString()}" AND
    "${new Date(monthEnd).toISOString()}" AND expiryDate >= '${todayDate}'`;
    let countMonth = await db.sequelize.query(countMonthQ, { type: Sequelize.QueryTypes.SELECT });

    today.cases = countToday[0].count;
    today.pos = totalToday.length > 0 ? totalToday[0].pos : 0;
    today.totalAmountDue = totalToday.length > 0 ? totalToday[0].totalDueAmount : 0;
    today.totalColletedAmt = totalTodayUpdated.length > 0 ? totalTodayUpdated[0].amountCollected : 0;

    week.cases = countWeek[0].count;
    week.pos = totalWeek.length > 0 ? totalWeek[0].pos : 0;
    week.totalAmountDue = totalWeek.length > 0 ? totalWeek[0].totalDueAmount : 0;
    week.totalColletedAmt = totalWeek.length > 0 ? totalWeek[0].amountCollected : 0;
    
    month.cases = countMonth[0].count;
    month.pos = totalMonth.length > 0 ? totalMonth[0].pos : 0;
    month.totalAmountDue = totalMonth.length > 0 ? totalMonth[0].totalDueAmount : 0;
    month.totalColletedAmt = totalMonth.length > 0 ? totalMonth[0].amountCollected : 0;
    
    let todayQueryForSummary = `SELECT COUNT(L.loanAccountNo) count, D.name FROM leads L
        LEFT JOIN dispositions as D ON D.id=L.dispositionId
        WHERE fosId = ${req.user.id} AND L.updatedAt BETWEEN "${new Date(start).toISOString()}" AND
        "${new Date(end).toISOString()}" AND L.expiryDate >= '${todayDate}' GROUP BY dispositionId`;
    let weekQueryForSummary = `SELECT COUNT(L.loanAccountNo) count, D.name FROM leads L
        LEFT JOIN dispositions as D ON D.id=L.dispositionId
        WHERE fosId = ${req.user.id} AND L.updatedAt BETWEEN "${new Date(weekStart).toISOString()}" AND
        "${new Date(weekEnd).toISOString()}" AND L.expiryDate >= '${todayDate}' GROUP BY dispositionId`;
    let monthQueryForSummary = `SELECT COUNT(L.loanAccountNo) count, D.name FROM leads L
        LEFT JOIN dispositions as D ON D.id=L.dispositionId
        WHERE fosId = ${req.user.id} AND L.updatedAt BETWEEN "${new Date(monthStart).toISOString()}" AND
        "${new Date(monthEnd).toISOString()}" AND L.expiryDate >= '${todayDate}' GROUP BY dispositionId`;    
    let todaySummary = await db.sequelize.query(todayQueryForSummary, { type: Sequelize.QueryTypes.SELECT });
    let weekSummary = await db.sequelize.query(weekQueryForSummary, { type: Sequelize.QueryTypes.SELECT });
    let monthSummary = await db.sequelize.query(monthQueryForSummary, { type: Sequelize.QueryTypes.SELECT });

    let pendingVisit = [];
    let pendingVisit1 = [];
    let pendingVisit2 = [];

    let pendingFollowUp;
    let pendingFollowUp1;
    let pendingFollowUp2;

    //summary data and actions data

    let caseTodayQ = `SELECT * FROM caseEvents WHERE followUp BETWEEN "${new Date(start).toISOString()}" AND "${new Date(end).toISOString()}" AND 
    userId=${req.user.id} GROUP BY leadId ORDER BY id DESC`
        console.log('caseTodayQ-=-',caseTodayQ)
    let caseListToday = await db.sequelize.query(caseTodayQ, { type: Sequelize.QueryTypes.SELECT });
    console.log('-=-=-=-=-=caseListToday',caseListToday)
    pendingFollowUp = caseListToday.length

    let caseWeekQ = `SELECT * FROM caseEvents WHERE followUp BETWEEN "${new Date(weekStart).toISOString()}" AND "${new Date(weekEnd).toISOString()}" AND 
    userId=${req.user.id} GROUP BY leadId ORDER BY id DESC`
        console.log('caseWeekQ-=-',caseWeekQ)
    let caseListWeek = await db.sequelize.query(caseWeekQ, { type: Sequelize.QueryTypes.SELECT });
    pendingFollowUp1 = caseListWeek.length

    let caseMonthQ = `SELECT * FROM caseEvents WHERE followUp BETWEEN "${new Date(monthStart).toISOString()}" AND "${new Date(monthEnd).toISOString()}" AND 
    userId=${req.user.id} GROUP BY leadId ORDER BY id DESC`
        console.log('caseMonthQ-=-',caseMonthQ)
    let caseListMonth = await db.sequelize.query(caseMonthQ, { type: Sequelize.QueryTypes.SELECT });
    pendingFollowUp2 = caseListMonth.length

    console.log('totalToday2-caseListMonth=-',caseListToday.length,caseListWeek.length,caseListMonth)

    let customerNotFound = 0;
    let promiseToPay = 0;
    let settlementForeclosure = 0;
    let brokenPTP = 0;
    let denialRTP = 0;
    let recovered = 0;
    let partiallyRecovered = 0;
    let dispute = 0;
    let customerDeceased = 0;
    let callBack = 0;
    let totalSummaryCount = 0;
    todaySummary.forEach(item => {
        totalSummaryCount += item.count
        if (item.name == 'Customer Not Found') {
            customerNotFound = item.count;
        } else if (item.name == 'Promise to Pay') {
            promiseToPay = item.count;
        } else if (item.name == 'Settlement/Foreclosure') {
            settlementForeclosure = item.count;
        } else if (item.name == 'Broken PTP') {
            brokenPTP = item.count;
        } else if (item.name == 'Denial/RTP (Refused to Pay)') {
            denialRTP = item.count;
        } else if (item.name == 'Collected') {
            recovered = item.count;
        } else if (item.name == 'Partially Collected') {
            partiallyRecovered = item.count;
        } else if (item.name == 'Dispute') {
            dispute = item.count;
        } else if (item.name == 'Customer Deceased') {
            customerDeceased = item.count;
        } else if (item.name == 'Call Back') {
            callBack = item.count;
        } else if(item.name =='Assigned to FOS'){
            pendingVisit.push(item)
        }
    })
    summaryToday = {
        totalCases: totalSummaryCount,
        customerNotFound: customerNotFound,
        promiseToPay: promiseToPay,
        settlementForeclosure: settlementForeclosure,
        brokenPTP: brokenPTP,
        denialRTP: denialRTP,
        collect: recovered,
        partiallyCollect: partiallyRecovered,
        dispute: dispute,
        customerDeceased: customerDeceased,
        callBack: callBack
    }

    //week
     let customerNotFound1 = 0;
     let promiseToPay1 = 0;
     let settlementForeclosure1 = 0;
     let brokenPTP1 = 0;
     let denialRTP1 = 0;
     let recovered1 = 0;
     let partiallyRecovered1 = 0;
     let dispute1 = 0;
     let customerDeceased1 = 0;
     let callBack1 = 0;
     let totalSummaryCount1 = 0;
    weekSummary.forEach(item => {
        totalSummaryCount1 += item.count
        if (item.name == 'Customer Not Found') {
            customerNotFound1 = item.count;
        } else if (item.name == 'Promise to Pay') {
            promiseToPay1 = item.count;
        } else if (item.name == 'Settlement/Foreclosure') {
            settlementForeclosure1 = item.count;
        } else if (item.name == 'Broken PTP') {
            brokenPTP1 = item.count;
        } else if (item.name == 'Denial/RTP (Refused to Pay)') {
            denialRTP1 = item.count;
        } else if (item.name == 'Collected') {
            recovered1 = item.count;
        } else if (item.name == 'Partially Collected') {
            partiallyRecovered1 = item.count;
        } else if (item.name == 'Dispute') {
            dispute1 = item.count;
        } else if (item.name == 'Customer Deceased') {
            customerDeceased1 = item.count;
        } else if (item.name == 'Call Back') {
            callBack1 = item.count;
        }else if(item.name =='Assigned to FOS'){
            pendingVisit1.push(item)
        }
    })
    summaryWeek = {
        totalCases: totalSummaryCount1,
        customerNotFound: customerNotFound1,
        promiseToPay: promiseToPay1,
        settlementForeclosure: settlementForeclosure1,
        brokenPTP: brokenPTP1,
        denialRTP: denialRTP1,
        collect: recovered1,
        partiallyCollect: partiallyRecovered1,
        dispute: dispute1,
        customerDeceased: customerDeceased1,
        callBack: callBack1
    }

    //month
    let customerNotFound2 = 0;
    let promiseToPay2 = 0;
    let settlementForeclosure2 = 0;
    let brokenPTP2 = 0;
    let denialRTP2 = 0;
    let recovered2 = 0;
    let partiallyRecovered2 = 0;
    let dispute2 = 0;
    let customerDeceased2 = 0;
    let callBack2 = 0;
    let totalSummaryCount2 = 0;
    monthSummary.forEach(item => {
        totalSummaryCount2 += item.count
        if (item.name == 'Customer Not Found') {
            customerNotFound2 = item.count;
        } else if (item.name == 'Promise to Pay') {
            promiseToPay2 = item.count;
        } else if (item.name == 'Settlement/Foreclosure') {
            settlementForeclosure2 = item.count;
        } else if (item.name == 'Broken PTP') {
            brokenPTP2 = item.count;
        } else if (item.name == 'Denial/RTP (Refused to Pay)') {
            denialRTP2 = item.count;
        } else if (item.name == 'Collected') {
            recovered2 = item.count;
        } else if (item.name == 'Partially Collected') {
            partiallyRecovered2 = item.count;
        } else if (item.name == 'Dispute') {
            dispute2 = item.count;
        } else if (item.name == 'Customer Deceased') {
            customerDeceased2 = item.count;
        } else if (item.name == 'Call Back') {
            callBack2 = item.count;
        }else if(item.name =='Assigned to FOS'){
            pendingVisit2.push(item)
        }
    })
    summaryMonth = {
        totalCases: totalSummaryCount2,
        customerNotFound: customerNotFound2,
        promiseToPay: promiseToPay2,
        settlementForeclosure: settlementForeclosure2,
        brokenPTP: brokenPTP2,
        denialRTP: denialRTP2,
        collect: recovered2,
        partiallyCollect: partiallyRecovered2,
        dispute: dispute2,
        customerDeceased: customerDeceased2,
        callBack: callBack2
    }

    actionsToday = {
        pendingVisit: pendingVisit.length,
        pendingFollowUp: pendingFollowUp
    }
    actionsWeek = {
        pendingVisit: pendingVisit1.length,
        pendingFollowUp: pendingFollowUp1
    }
    actionsMonth = {
        pendingVisit: pendingVisit2.length,
        pendingFollowUp: pendingFollowUp2
    }
    let todayData = {
        stats: today,
        actionsData: actionsToday,
        summaryData: summaryToday
    }
    let weekData = {
        stats: week,
        actionsData: actionsWeek,
        summaryData: summaryWeek
    }
    let monthData = {
        stats: month,
        actionsData: actionsMonth,
        summaryData: summaryMonth
    }
    return res.status(200).json({
        title: 'Cases list',
        error: false,
        todayData: todayData,
        weekData: weekData,
        monthData: monthData
    });
}

const getStatisticsData1 = async (req, res) => {
    console.log('getStatisticsData req.body ', req.body);

    var query = { FOSAssigned: req.user.id }

    var assign_date = new Date()
    var start_date = moment(assign_date).format('YYYY-MM-DD')
    console.log('getStatisticsData assign_date ', assign_date, start_date);

    var greaterThan = new Date(start_date)
    var lessThan = new Date(start_date).setUTCHours(23,59,59,999)
    if (req.body.filterStatus && req.body.filterStatus == "today") {
        
    }
    if (req.body.filterStatus && req.body.filterStatus == "week") {
        greaterThan = new Date(start_date).setDate(new Date(start_date).getDate() - 7)
        lessThan = new Date(start_date).setUTCHours(23,59,59,999)
    }
    if (req.body.filterStatus && req.body.filterStatus == "month") {
        greaterThan = new Date(start_date).setDate(new Date(start_date).getDate() - 30)
        lessThan = new Date(start_date).setUTCHours(23,59,59,999)
    }

    var data = {}
    console.log('getStatisticsData greaterThan-- ', new Date(greaterThan), new Date(lessThan), moment(lessThan).format('YYYY-MM-DDT00:00:000Z'));

    var val = moment(lessThan).format('YYYY-MM-DDT00:00:000Z')
    const total = await db.sequelize.query(`SELECT COUNT(*), SUM(amountDue), SUM(pos) FROM leads U WHERE ((U.createdAt >= '${greaterThan}' AND U.createdAt <= '${val}') AND U.FOSAssigned = '${req.user.id}')`, { type: Sequelize.QueryTypes.SELECT })
    console.log('getStatisticsData total-- ', total);
    data.cases = total && total.length > 0 ? total[0]['SUM(amountDue)'] : 0
    data.totalAmountDue = total && total.length > 0 ? total[0]['SUM(amountDue)']: 0
    data.totalPos = total && total.length > 0 ? total[0]['SUM(pos)'] : 0

    var callStatus = 'Pending'
    var fieldVisitStatus = 'Assigned'
    var surrender = 'Surrender'
    var promiseToPay = 'Promise To Pay'
    var reminder = 'Reminder'
    const totalActions = await db.sequelize.query(`SELECT COUNT(CASE WHEN callStatus='${callStatus}' then 1 else NULL end) as pendingCalls, 
    COUNT(CASE WHEN fieldVisitStatus='${fieldVisitStatus}' then 1 else NULL end) as pendingVisits, 
    COUNT(CASE WHEN callStatus='${surrender}' then 1 else NULL end) as surrenderCalls,
    COUNT(CASE WHEN callStatus='${promiseToPay}' then 1 else NULL end) as promiseToPay,
    COUNT(CASE WHEN callStatus='${reminder}' then 1 else NULL end) as reminder 
    FROM leads U WHERE ((U.createdAt >= '${greaterThan}' AND U.createdAt <= '${val}') AND U.FOSAssigned = '${req.user.id}')`, { type: Sequelize.QueryTypes.SELECT })
    console.log('getStatisticsData totalActions-- ', totalActions)

    var actionsData = {}
    actionsData.pendingCalls = totalActions && totalActions.length > 0 ? totalActions[0]['pendingCalls'] : 0
    actionsData.pendingVisits = totalActions && totalActions.length > 0 ? totalActions[0]['pendingVisits'] : 0
    
    var summaryData = {}
    summaryData.surrenderCalls = totalActions && totalActions.length > 0 ? totalActions[0]['surrenderCalls'] : 0
    summaryData.promiseToPay = totalActions && totalActions.length > 0 ? totalActions[0]['promiseToPay'] : 0
    summaryData.reminder = totalActions && totalActions.length > 0 ? totalActions[0]['reminder'] : 0

    return res.status(200).json({
        title: 'Cases list',
        error: false,
        statisticsData: data,
        actionsData: actionsData,
        summaryData: summaryData
    });
}

const caseHistory = (req, res) => {
    const result = validationResult(req);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    // include: [{ model: subDispositions, as: 'subDispositions' }],
    const { loanAccountNo } = req.body;
    caseEvent.findAll({
        where: { leadId: loanAccountNo }, include: [{ model: dispositions, as: 'dispositions' },{ model: subDispositions }, { model: payments }],
        order: [['createdAt', 'ASC']]
    }).then(data => {
        if (!data) {
            res.status(200).json({
                title: 'No Case history found.',
                error: true,
                data: []
            });
        } else {
            res.status(200).json({
                title: 'Success',
                error: false,
                data: data
            });
        }
    })
}

const listFosDis = async (req, res) => {
    const userData = req.user;

    dispositions.findAll({ where: { type: 'Fos' } }).then(async dis => {

        console.log('\n\NDISPOSITIONS :', dis)

        mapCallback(dis, (err, callback) => {
            console.log('\n\nCALLBACK :', callback)

            res.status(200).json({
                title: 'Success',
                error: false,
                data: callback
            });
        });
    })
};

const mapCallback = async (params, callback) => {

    let arr = [];

    await Promise.all(params.map(async (disposition) => {
        let subDisposition = await subDispositions.findAll({ where: { dispositionId: disposition.id } });
        let index = arr.findIndex((val) => val && val.name == disposition['name'])
        console.log('\n\index:', index)
        if (index > -1) {
            arr[index].subStatus.push(subDisposition);
        } else {
            arr.push({ id: disposition['id'], name: disposition['name'], subStatus: subDisposition })
        }
    }));

    console.log('\n\nLENGTH:', arr.length)

    callback(null, arr)
}

const changePassword = (req,res) => {
    const result = validationResult(req);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    let userData = req.user;
    Users.findOne({ where: { phone: userData.phone } }).then(async users => {
        if (users && ((req.body.password).trim() === (req.body.confirmPassword).trim())) {
            if (req.body.oldPassword && !bcrypt.compareSync(req.body.oldPassword, users.password)) {
                return res.status(200).json({
                    title: 'You have entered an invalid old password.',
                    error: true
                });
            } else {
                let newPass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                const updateUser = await Users.update(
                    { password: newPass },
                    { where: { phone: userData.phone } },
                );
                let newData = await Users.findOne({ where: { phone: userData.phone } });
                if (!updateUser) {
                    return res.status(200).json({
                        title: 'Something went wrong in change password.(Error: 805',
                        error: true
                    });
                } else {
                    helper.generateToken(users, (token) => {
                        return res.status(200).json({
                            title: 'Password changed successfully.',
                            error: false,
                            detail: newData,
                            token: token
                        });
                    })
                }
            }

        } else {
            return res.status(200).json({
                title: 'You have entered an invalid password.',
                error: true
            });
        }
    });
}

const listBank = (req, res) => {
    Fis.findAll({ order: [['name', 'ASC']] }).then(data => {
        if (data) {
            res.status(200).json({
                title: 'success',
                error: false,
                data: data
            });
        } else {
            res.status(200).json({
                title: 'No banks found.',
                error: true,
            });
        }
    })
}

const deletePlan = async (req, res) => {
    const result = validationResult(req);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    Plan.destroy({ where: { leadId: req.body.leadId } }).then((num) => {
        if (num === 1) {
            console.log('Deleted successfully');
            res.status(200).json({
                title: 'Plan removed successfully',
                error: false
            });
        } else {
            res.status(200).json({
                title: 'Something went wrong.',
                error: true
            });
        }
    })
}

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
    if (data) {
        res.status(200).json({
            title: `Lead ${type} updated successfully`,
            error: false,
        });
    } else {
        res.status(200).json({
            title: 'Something went wrong.',
            error: true,
        })
    }
}

const saveCheckinData = async (req, res) => {
    console.log('\n\n\nreq.body.saveCheckinData-=-', req.body)
    const result = validationResult(req);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    let leadData = await Leads.findOne({ where: { loanAccountNo: req.body.loanAccountNo}});
    if(leadData){
       const { payment, loanAccountNo, dispositionId, subDispositionId, comments, additionalField, nextAction, followUp, location, supporting } = req.body;
    let dir = './uploads/supportings/';
    let newCaseEvent = {
        dispositionId: dispositionId ? dispositionId : 0,
        comments: comments ? comments : '',
        fileName: supporting && supporting.length > 0 ? helper.base64Upload(req, res, dir, supporting[0]) : '',
        leadId: loanAccountNo,
        nextAction: nextAction ? nextAction : '',
        userId: req.user.id,
        location: location
    };
    if (req.body.followUp && req.body.followUp !== null) {
        newCaseEvent.followUp = followUp ? new Date(followUp) : new Date();
    }
    if (req.body.subDispositionId && req.body.subDispositionId !== null) {
        newCaseEvent.subDispositionId = subDispositionId;
    }
    newCaseEvent.additionalField = JSON.stringify(additionalField);
    let createCaseEvent = await caseEvent.create(newCaseEvent);

    if (supporting && supporting.length > 1) {
        eventSuppContr.addSupporting(dir, createCaseEvent.id, loanAccountNo, supporting); //add entrys to supportings
    }
    let update = {};
    if (req.body.dispositionId && req.body.dispositionId !== null) {
        update.dispositionId = dispositionId;
    }
    update.subDispositionId = subDispositionId ? subDispositionId : null;

    if (payment && Object.keys(payment).length > 0) {
        payment.caseEventId = createCaseEvent.id;
        payment.fosId = req.user.id;
        addPayment(payment, async function (data) {
            let amt = Number(leadData.totalDueAmount) - Number(leadData.amountCollected);
            if(Number(payment.collectedAmt) > amt ){
                caseEvent.destroy({ where: { id: createCaseEvent.id } });
                if (supporting && supporting.length > 1) {
                    caseEventSupporting.destroy({ where: { caseEventId: createCaseEvent.id } }); //delete entrys to supportings
                }
                return res.status(200).json({
                    error: true,
                    title: `Collected amount can't be grater than remaining due amount. i.e. ${amt}`,
                });
            } else if (!data) {
                caseEvent.destroy({ where: { id: createCaseEvent.id } });
                if (supporting && supporting.length > 1) {
                    caseEventSupporting.destroy({ where: { caseEventId: createCaseEvent.id } }); //delete entrys to supportings
                }
                return res.status(200).json({
                    error: true,
                    title: 'Failed to generate payment receipt.',
                });
            } else {
                let col = 0;
                // if(dispositionId == 22 || dispositionId == 25 || dispositionId == 26){
                //     if(payment.amtType.toLowerCase().trim() == 'total due amount'){
                //         col = Number(leadData.totalDueAmount);
                //     } else if (payment.amtType.toLowerCase().trim() == 'principal outstanding amount[pos]'){
                //         col = Number(leadData.principalOutstandingAmount);
                //     } else {
                //         col = Number(payment.collectedAmt);
                //     }
                // } else {
                    col = Number(payment.collectedAmt);
                // }
                update.amountCollected = Sequelize.literal(`amountCollected + ${col}`);
                if(dispositionId == 25){
                    update.paymentStatus = 'Paid';
                    const paymentData = await payments.findOne({ where: { leadId: req.body.loanAccountNo } });
                    let userType={};
                    userType.employeeId=req.user.employeeId;
                    userType.name=req.user.firstName+" "+req.user.lastName;
                    console.log("Payment 2222",payment);
                    let paymentId=paymentData.dataValues.id;
                    await helper.generateReceipt(paymentId,userType);
                }
                if(dispositionId == 26){
                    update.paymentStatus = 'Partially Paid';
                }
                Leads.update(update, {
                    where: { loanAccountNo: loanAccountNo },
                }).then((data) => {
                    if (!data) {
                        res.status(200).json({
                            error: true,
                            title: 'Checkin failed.',
                        });
                    } else {
                        res.status(200).json({
                            error: false,
                            title: 'Checkin saved successfully.',
                        });
                    }
                })
            }
        });
    } else {
        if(createCaseEvent){
            Leads.update(update, {
                where: { loanAccountNo: loanAccountNo },
            }).then((data) => {
                if (!data) {
                    res.status(200).json({
                        error: true,
                        title: 'Checkin failed.',
                    });
                } else {
                    res.status(200).json({
                        error: false,
                        title: 'Checkin saved successfully.',
                    });
                }
            })
        }else{
            res.status(200).json({
                error: true,
                title: 'Checkin failed.',
            });
        }
    }
    } else {
        res.status(200).json({
            error: true,
            title: 'Lead id not found.',
        });
    }
    
}

const addPayment = async (payment, next) => {
    console.log('\n\n\nreq.body.addPayment-=-', payment)
    let dir = './uploads/supportings/';
    let { leadId, loanNo, fosId, amtType, paymentMode, recoveryDate, refNo, chequeNo, remark, supporting, caseEventId, collectedAmt } = payment;
    if (leadId == '' || loanNo == '' || amtType == '' || paymentMode == '' || recoveryDate == '' || collectedAmt == '' || caseEventId == '') {
        next(false)
    } else {
        let newPayment;
        let success = [];
        if (!supporting || supporting.length == 0) {
            let newUser = {
                leadId: leadId,
                loanNo: loanNo,
                fosId: fosId,
                amtType: amtType,
                paymentMode: paymentMode,
                recoveryDate: new Date(recoveryDate),
                refNo: refNo ? refNo : '',
                chequeNo: chequeNo ? chequeNo :'',
                remark: remark ? remark :'',
                supporting: '',
                caseEventId: caseEventId,
                collectedAmt: collectedAmt
            };
            newPayment = await payments.create(newUser);
            success.push(newPayment);
        } else {
            await Promise.all(supporting.map(async (data) => {
                if (data) {
                    let newUser = {
                        leadId: leadId,
                        loanNo: loanNo,
                        fosId: fosId,
                        amtType: amtType,
                        paymentMode: paymentMode,
                        recoveryDate: new Date(recoveryDate),
                        refNo: refNo ? refNo : '',
                        chequeNo: chequeNo ? chequeNo :'',
                        remark: remark ? remark :'',
                        caseEventId: caseEventId,
                        collectedAmt: collectedAmt
                    };
                    newUser.supporting = helper.base64Upload('', '', dir, data);
                    newPayment = await payments.create(newUser);
                    success.push(newPayment);
                }
            }));
        }
        if (success.length > 0) {
            next(true)
        } else {
            next(false)
        }
    }
}


module.exports = {
    login,
    logout,
    forgotPassword,
    verifyPassword,
    getUserDetails,
    getCasesList,
    addToPlan,
    listMyPlan,
    getCaseDetails,
    notificationListing,
    getStatisticsData,
    saveCheckinData,
    caseHistory,
    listFosDis,
    changePassword,
    listBank,
    deletePlan,
    leadContactUpdate,
    addPayment,
};