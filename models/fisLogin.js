module.exports = (sequelize, Sequelize) => {
  const FisLogin = sequelize.define('fisLogin', {
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    fiId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    isDeleted: {
      type: Sequelize.INTEGER,
      defaultValue: 0
  }
  });
  return FisLogin;
};