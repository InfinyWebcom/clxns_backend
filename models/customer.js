module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define('customer', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    contactNo: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    rating: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    isDeleted: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });
  return Customer;
};