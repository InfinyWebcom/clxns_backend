/* eslint-disable linebreak-style */
module.exports = (sequelize, Sequelize) => {
  const permissions = sequelize.define('permissions', {
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

  return permissions;
};
