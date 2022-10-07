module.exports = (sequelize, Sequelize) => {
  const CaseStatus = sequelize.define('caseStatus', {
  status: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return CaseStatus;
};