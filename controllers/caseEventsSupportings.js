// NODE MODULES & DATABASE
const db = require('../models');
const helper = require('../helper/helper');
const caseEventSupporting = db.caseEventSupporting;
const Sequelize = require('sequelize');
const { Op } = db.Sequelize;

/*
# purpose:To add Supporting in base64Upload 
*/

const addSupporting = (dir, caseId, leadId, imageArr) => {
    let data = {};
    let req, res = 0;
    imageArr.map((value, key) => {
        if(value){
            data.caseEventId = caseId;
            data.leadId = leadId;
            data.image = helper.base64Upload(req, res, dir, value);
            caseEventSupporting.create(data);
        }
    });
}

/*
# purpose:To save date in caseEventSupporting db
*/

const addSupportingFile = (dir, caseId, leadId, imageArr) => {
    let data = {};
    let req, res = 0;
   
    imageArr.map(async (value, key) => {

        console.log("filessssss",value);
        let uploadPath=`./uploads/supportings/${value.name}`;
        await value.mv(uploadPath, async (err) => { return true });
        if(value){
            data.caseEventId = caseId;
            data.leadId = leadId;
            data.image = value.name;
            caseEventSupporting.create(data);
        }
    });
}


module.exports = {
    addSupporting,
    addSupportingFile
};