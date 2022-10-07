module.exports = (sequelize, Sequelize) => {
  const Pincodes = sequelize.define('pincode', {
    code: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    serviceable: {
      type: Sequelize.STRING,
      defaultValue: 'No',
    },
    city: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return Pincodes;
};