module.exports = (sequelize, Sequelize) => {
  const Cities = sequelize.define('cities', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return Cities;
};