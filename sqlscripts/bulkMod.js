const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const Sequelize = require('sequelize');
const dbConfig = require('../config/database.js');

console.log(dbConfig);
const sequelize = new Sequelize('clxns', 'root', '12345678', {
  host: '127.0.0.1',
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  // port: 8086,
  timezone: '+05:30',
  pool: {
    max: 5,
    min: 0,
    acquire: 500000,
    idle: 10000,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Leads = require('../models/leads.js')(sequelize, Sequelize);

const unfoundLeads = [];
fs.createReadStream(path.resolve('Lead.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', (error) => console.error(error))
  .on('data', async (row) => {
    console.log(`${row.loanAccountNo} ---${row['User ID']}`);
    const lead = await Leads.findOne({ where: { loanAccountNo: row.loanAccountNo } });
    if (lead !== null) {
      console.log("loanAccountNo ->"+lead.loanAccountNo+"FOS ID:"+(lead.fosId ? lead.fosId :'NULL' )  + '--->'+row['User ID']);
      lead.loanId = (row.loanAccountNo.indexOf('-')>0)?(row.loanAccountNo.split('-'))[1]:row.loanAccountNo;
      lead.fosId = (row['User ID']!="")?row['User ID']:null;
      lead.save();
      console.log("NEW FOS ID ----"+ lead.fosId); 
    }
  })
  .on('end', (rowCount) => {
    console.log(`Parsed ${rowCount} rows`);
    console.log(unfoundLeads);
  });
