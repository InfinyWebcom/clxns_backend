/* eslint-disable linebreak-style */
module.exports = (sequelize, Sequelize) => {
  const report = sequelize.define('report', {
    role: {
      type: Sequelize.ENUM,
      values: ['leader', 'staff', 'admin', 'disabled'],
    },
    module: {
      type: Sequelize.STRING,
    },
    action: {
      type: Sequelize.STRING,
    },

  }, {
    timestamps: false,
  });

  return report;
};
