module.exports = (sequelize, Sequelize) => {
  const CustomerContact = sequelize.define('customerContact', {
    customerId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    contactNo: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    note: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return CustomerContact;
};