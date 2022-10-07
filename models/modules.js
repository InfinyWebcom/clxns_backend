module.exports = (sequelize, Sequelize) => {
  const Modules = sequelize.define('modules', {
    name: {
      type: Sequelize.STRING,
    },
    actions: {
      type: Sequelize.STRING,
    }
  });
  return Modules;
};
