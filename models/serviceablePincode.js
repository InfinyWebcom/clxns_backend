module.exports = (sequelize, Sequelize) => {
  const ServiceablePincode = sequelize.define('serviceablePincode', {
    userId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    pincode: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      required: true,
    },
  });
  return ServiceablePincode;
};