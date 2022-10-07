module.exports = (sequelize, Sequelize) => {
  const Locations = sequelize.define('location', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return Locations;
};