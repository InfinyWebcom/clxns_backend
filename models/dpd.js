module.exports = (sequelize, Sequelize) => {
  const DPD = sequelize.define('dpd', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    shortName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return DPD;
};