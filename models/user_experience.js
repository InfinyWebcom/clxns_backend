module.exports = (sequelize, Sequelize) => {
  const UserExperience = sequelize.define('userExperience', {
    userId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: true,
    },
    productType: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    dpd: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    }
  });
  return UserExperience;
};