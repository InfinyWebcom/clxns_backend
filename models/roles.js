module.exports = (sequelize, Sequelize) => {
  const Roles = sequelize.define('roles', {
    name: {
      type: Sequelize.STRING,
    },
    displayName: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'active',
    },
    level: {
      type: Sequelize.INTEGER,
    },
    type: {
      type: Sequelize.STRING,
    },
  });
  return Roles;
};
