module.exports = (sequelize, Sequelize) => {
  const campaign = sequelize.define('campaign', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    startDate: {
      type: Sequelize.DATEONLY,
    },
    endDate: {
      type: Sequelize.DATEONLY,
    },
    isDeleted: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });

  return campaign;
};
