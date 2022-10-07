/* eslint-disable linebreak-style */
const Sequelize = require('sequelize');
const dbConfig = require('../config/database.js');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  logging: false,
  // port: 8086,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ADD MODELS
db.contact_us = require('./contact_us.js')(sequelize, Sequelize);
db.users = require('./users.js')(sequelize, Sequelize);
db.campaign = require('./campaign.js')(sequelize, Sequelize);
db.leads = require('./leads.js')(sequelize, Sequelize);
db.permissions = require('./permissions.js')(sequelize, Sequelize);
db.teams = require('./teams.js')(sequelize, Sequelize);
db.teamMembers = require('./teamMembers.js')(sequelize, Sequelize);
db.pools = require('./pool.js')(sequelize, Sequelize);
db.fis = require('./fis.js')(sequelize, Sequelize);
db.locations = require('./location')(sequelize, Sequelize);
db.pincodes = require('./pincode')(sequelize, Sequelize);
db.cities = require('./cities.js')(sequelize, Sequelize);
db.caseStatus = require('./caseStatus')(sequelize, Sequelize);
db.callStatus = require('./callStatus')(sequelize, Sequelize);
// db.pools = require('./pools.js')(sequelize, Sequelize);
db.roles = require('./roles.js')(sequelize, Sequelize);
db.modules = require('./modules.js')(sequelize, Sequelize);
db.customer = require('./customer')(sequelize, Sequelize);
db.customerHistory = require('./customer_history')(sequelize, Sequelize);
db.customerAddress = require('./customer_address')(sequelize, Sequelize);
db.customerContact = require('./customer_contact')(sequelize, Sequelize);
db.userLangauge =require('./user_langauge')(sequelize, Sequelize);
db.userExperience =require('./user_experience')(sequelize, Sequelize);
db.dpd =require('./dpd')(sequelize, Sequelize);
db.productType =require('./productType')(sequelize, Sequelize);
db.operatingLocations = require('./operatingLocations')(sequelize, Sequelize);
db.language = require('./language')(sequelize, Sequelize);
db.auditTrail = require('./auditTrail')(sequelize, Sequelize);
db.plan = require('./plan')(sequelize, Sequelize);
db.notification = require('./notification.js')(sequelize, Sequelize);
db.caseEvent = require('./caseEvent.js')(sequelize, Sequelize);
db.script = require('./script.js')(sequelize, Sequelize);
db.serviceablePincode = require('./serviceablePincode')(sequelize, Sequelize);
db.dispositions = require('./dispositions')(sequelize, Sequelize);
db.subDispositions = require('./sub_dispositions')(sequelize, Sequelize);
db.payments = require('./payments')(sequelize, Sequelize);
db.caseEventSupporting = require('./caseEventsSupportings')(sequelize, Sequelize);
db.leadsContactUpdate = require('./leadsContactUpdate')(sequelize, Sequelize);
db.tempLeads = require('./tempLeads.js')(sequelize, Sequelize);
db.fisLogins = require('./fisLogin')(sequelize, Sequelize);
// DEFINE RELATIONSHIPS

db.rolesModules = sequelize.define('rolesModules', {});
db.roles.belongsToMany(db.modules, { through: 'rolesModules', as: 'modules' });
db.modules.belongsToMany(db.roles, { through: 'rolesModules', as: 'roles' });

db.roles.hasMany(db.users, { as: 'users' });
db.users.belongsTo(db.roles, { foreignKey: 'roleId', as: 'roles' });

db.teamMembers = sequelize.define('teamMembers', {});
db.users.belongsToMany(db.teams, { through: 'teamMembers', as: 'teams' });
db.teams.belongsToMany(db.users, { through: 'teamMembers', as: 'users' });
db.teams.belongsTo(db.users, { foreignKey: 'teamLeaderId', as: 'teamLeader' });

db.operatingLocations = sequelize.define('operatingLocations', {});
db.users.belongsToMany(db.locations, { through: 'operatingLocations' ,as: 'locations' });
db.locations.belongsToMany(db.users, { through: 'operatingLocations' ,as: 'users' });

db.campaignMembers = sequelize.define('campaignMembers', {});
db.users.belongsToMany(db.campaign, { through: 'campaignMembers', as: 'campaigns' });
db.campaign.belongsToMany(db.users, { through: 'campaignMembers', as: 'users' });

db.leads.belongsToMany(db.campaign, { through: 'campaignLeads', as: 'campaigns' });
db.campaign.belongsToMany(db.leads, { through: 'campaignLeads', as: 'leads' });

db.leads.belongsTo(db.productType, { foreignKey: 'productTypeId', as: 'productId' });
db.productType.hasMany(db.leads, { foreignKey: 'productTypeId', as: 'productId' });

db.leads.belongsTo(db.fis, { foreignKey: 'FIId' });
db.users.hasMany(db.campaign, { foreignKey: 'user_id', as: 'campaign' });

// db.leadsUpload.hasMany(db.leads, { foreignKey: 'uploaded_id', as: 'leads' });
db.fis.hasMany(db.leads, { foreignKey: 'FIId' });
db.cities.hasMany(db.leads, { foreignKey: { name: 'cityId', allowNull: true } });
db.pools.hasMany(db.leads, { foreignKey: { name: 'poolId', allowNull: true } });
db.users.hasMany(db.leads, { foreignKey: { name: 'FOSAssigned', allowNull: true } });
// db.teams.hasMany(db.leads, { foreignKey: { name: 'teamId', allowNull: true } });
// db.users.hasMany(db.leads, { foreignKey: { name: 'telecallerId', allowNull: true } });
// db.users.hasMany(db.leads, { foreignKey: { name: 'fosId', allowNull: true } });
// db.users.hasMany(db.leads, { foreignKey: { name: 'teamLeaderId', allowNull: true } });

// db.campaign.hasMany(db.leads, { foreignKey: { name: 'campaignId', allowNull: true } });
// db.users.hasMany(db.leads, { foreignKey: { name: 'telecallerAssigned', allowNull: true } });
db.leads.belongsTo(db.users, { foreignKey: 'telecallerAssigned', as: 'telecaller' });

db.teams.belongsTo(db.locations, { foreignKey: 'locationId', as: 'location' });
db.teamMembers.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
db.operatingLocations.belongsTo(db.locations, { foreignKey: 'locationId', as: 'location' });
db.auditTrail.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
db.plan.belongsTo(db.users, { foreignKey: 'fosId', as: 'fos' });

db.plan.belongsTo(db.leads, { foreignKey: 'leadId', as: 'lead'});
db.leads.hasMany(db.plan, { foreignKey: 'leadId', as: 'plans'});

db.caseEvent.belongsTo(db.leads, { foreignKey: 'leadId', targetKey: 'loanAccountNo', as: 'lead'});

// db.dispositions.hasMany(db.subDispositions, { foreignKey: 'dispositionId', as: 'subDisposition' });
db.dispositions.hasMany(db.subDispositions, { as: 'subDispositions' });
db.subDispositions.belongsTo(db.dispositions, { foreignKey: 'dispositionId', as: 'dispositions' });

db.leads.belongsTo(db.dispositions,{ foreignKey: { name: 'dispositionId', allowNull: true } });
db.leads.belongsTo(db.subDispositions, { foreignKey: { name: 'subDispositionId', allowNull: true } });
db.users.belongsTo(db.users, { foreignKey: 'reportingTo', as: 'reporting' });


db.caseEvent.belongsTo(db.dispositions, { foreignKey: 'dispositionId', as: 'dispositions' });


db.caseEvent.belongsTo(db.subDispositions, { foreignKey: { name: 'subDispositionId', allowNull: true } });
db.payments.belongsTo(db.caseEvent, { foreignKey: { name: 'caseEventId' } });
db.caseEvent.hasMany(db.payments, { foreignKey: { name: 'caseEventId' } });

db.payments.belongsTo(db.leads, { foreignKey: 'leadId', targetKey: 'loanAccountNo' });

db.leads.hasMany(db.caseEvent, { foreignKey: 'leadId', as: 'caseEvent'});

db.userExperience.belongsTo(db.users, { foreignKey: 'userId', as: 'userExp' });
db.users.hasMany(db.userExperience, { foreignKey: 'userId', as: 'userExperience'});
module.exports = db;
