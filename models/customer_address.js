module.exports = (sequelize, Sequelize) => {
  const CustomerAddress = sequelize.define('customerAddress', {
    customerId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    addressType: {
      type: Sequelize.ENUM,
      values: ['Primary', 'Secondary'],
    },
    note: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return CustomerAddress;
};