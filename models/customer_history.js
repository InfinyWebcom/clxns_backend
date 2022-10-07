module.exports = (sequelize, Sequelize) => {
  const CustomerHistory = sequelize.define('customerHistory', {
    customerId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    fiName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    loanAmount: {
      type: Sequelize.INTEGER,
      required: false,
      allowNull: true,
    },
    loanNumber: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    recoveryLevel: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return CustomerHistory;
};