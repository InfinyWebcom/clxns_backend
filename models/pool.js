module.exports = (sequelize, Sequelize) => {
  const Pool = sequelize.define('pool', {
    bankName: {
      type: Sequelize.STRING,
    },
    noOfLeads: {
      type: Sequelize.INTEGER,
    },
    poolValue: {
      type: Sequelize.INTEGER,
    },
    collectedAmt: {
      type: Sequelize.INTEGER,
    },
    totalContacted: {
      type: Sequelize.INTEGER,
    },
    resolvedCases: {
      type: Sequelize.INTEGER,
    },
    contactability: {
      type: Sequelize.INTEGER,
    },
    promiseRate: {
      type: Sequelize.INTEGER,
    },
    recoveryRate : {
      type: Sequelize.INTEGER,
    },
    collectionEfficiency : {
      type: Sequelize.INTEGER,
    },
    location:{
      type: Sequelize.TEXT,
      },
    fileName:{
    type: Sequelize.STRING,
    },
    productTypeId:{
      type: Sequelize.INTEGER,
      },
    status:{
    type: Sequelize.ENUM,
    values:['Success','Failed','Processing'],
    },
    startDate: {
      type: Sequelize.STRING,
    },
    endDate: {
      type: Sequelize.STRING,
    },
    errors: {
      type: Sequelize.TEXT('long'),
    },
    isErrorcheck: {
      type: Sequelize.STRING,
      defaultValue: false,
    },
  });
  return Pool;
};
