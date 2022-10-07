module.exports = (sequelize, Sequelize) => {
  const CallStatus = sequelize.define('callStatus', {
    status: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return CallStatus;
};