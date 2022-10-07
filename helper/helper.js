/* eslint-disable prefer-const */
// DATABASE
const db = require('../models');

const Roles = db.roles;
const RoleModules = db.rolesModules;
const Modules = db.modules;
const AuditTrail = db.auditTrail;
const { payments } = db;
const Leads = db.leads;
const Fis = db.fis;
const jwt = require('jsonwebtoken');
const base64ToImage = require('base64-to-image');
const fs = require('fs');
const randomstring = require('randomstring');
const moment = require('moment');
const ejs = require('ejs');
// UTILITIES
const email = require('../utils/email');

const getPermissions = async (user, req) => {
  let userModuleArray = [];
  const loginUser = user;
  console.log('\n\nloginUsers -: ', loginUser);
  const roles = await Roles.findOne({ where: { id: loginUser.roleId } });

  const rolesModules = await RoleModules.findAll({ where: { roleId: roles.id }, raw: true });
  // console.log('\n\nUsers rolesModules -: ' ,rolesModules);
  await Promise.all(rolesModules.map(async (rolesmodules) => {
    const modules = await Modules.findOne({ where: { id: rolesmodules.moduleId }, raw: true });
    const moduleName = modules.name;
    if (userModuleArray.indexOf(moduleName) < 0) { userModuleArray.push(moduleName); }
  }));
  // console.log('\n\nUsers ModuleArray -: ' ,userModuleArray);
  return userModuleArray;
};

const saveAuditTrail = async (data) => {
  console.log('saveAuditTrail data---', data);
  const newAudit = {
    userId: data.userId,
    moduleName: data.moduleName,
    tableName: data.tableName,
    action: data.action,
    objectId: data.objectId,
    description: data.description,
  };
  const createAudit = await AuditTrail.create(newAudit);

  console.log('\n\n saveAuditTrail - createAudit :-', createAudit);

  return true;
};

const writeFile = (errLog, folder) => {
  let updatedAt = new Date();
  let date = new Date(updatedAt.getTime() + moment.tz(getTimezone()).utcOffset() * 60000);
  errLog += '########## \r\n';
  createDir(`./${folder}`);
  fs.appendFileSync(`./${folder}/${date.toISOString().slice(0, 10)}.txt`, `${errLog}\r\n`, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
};

const generateToken = (userData, cb) => {
  console.log('userData', userData);
  let token = jwt.sign({
    email: userData.email,
    phone: userData.phone,
    user_id: userData.id,
    roleId: userData.roleId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 1000),
  }, 'clxns');
  cb(token);
};

const getTimezone = (token) => 'Asia/Kolkata';

const base64Upload = (req, res, path, base64Str) => {
  createDir(path);
  let ext = base64Str.substring(base64Str.indexOf('/') + 1, base64Str.indexOf(';base64'));
  picName = randomstring.generate({
    length: 8,
    charset: 'alphanumeric',
  });
  let optionalObj = { fileName: picName, type: ext };
  let newBase64Str = base64Str.replace(/(\r\n|\n|\r)/gm, '');
  let splitbase64 = newBase64Str.substring(newBase64Str.indexOf(',') + 1, newBase64Str.length);
  let base = newBase64Str.includes('base64');
  let Image;
  if (base && splitbase64) {
    Image = base64ToImage(newBase64Str, path, optionalObj);
    return Image.fileName;
  }
};

const createDir = (targetDir) => {
  const path = require('path');
  const { sep } = path;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }
    return curDir;
  }, initDir);
};

const generateReceipt = async (paymentId, userType) => {
  let data = await payments.findOne({ where: { id: paymentId }, include: [{ model: Leads }] });
  console.log('-=-=-=-daat', data);

  // eslint-disable-next-line space-before-blocks
  if (data.dataValues.lead != null){
    let FiId = data.dataValues.lead.FIId;
    let fisData = await Fis.findOne({ where: { id: FiId } });
    let contents = fs.readFileSync('./views/receipt.ejs', 'utf8');
    let paymentDetails = {
      base_url: '123',
      title: 'Receipt',
      date: moment(data.createdAt).format('DD-MM-YYYY'),
      customerName: data.lead.name,
      userName: userType.name,
      totalAmtDue: data.lead.totalDueAmount,
      collectedAmt: data.collectedAmt,
      paymentType: data.paymentMode,
      chequeNo: data.chequeNo,
      paymentStatus: 'Successfully',
      fiName: fisData.dataValues.name,
      employeeId: userType.employeeId,
    };
    let html = ejs.render(contents, paymentDetails);
    if (data.lead.email !== '') {
      let mailData = {
        email: data.lead.email,
        subject: 'Receipt for payment',
        body: html,
      };
      //the below line should be uncommented to activate auto generation of receipt. 
      //email.sendEmail(mailData);
    }
  }
  return true;
};

module.exports = {
  getPermissions,
  saveAuditTrail,
  writeFile,
  generateToken,
  getTimezone,
  base64Upload,
  generateReceipt,
};
