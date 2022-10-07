module.exports = (sequelize, Sequelize) => {
  const Script = sequelize.define('script', {
    description: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
  });
  return Script;
};