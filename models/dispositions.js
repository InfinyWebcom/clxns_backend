module.exports = (sequelize, Sequelize) => {
    const Disposition = sequelize.define('disposition', {
      name: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      setReminder: {
        type: Sequelize.BOOLEAN,
        required: true,
        allowNull: false,
      },
      allowFeedback: {
        type: Sequelize.BOOLEAN,
        required: true,
        allowNull: false,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    });
    return Disposition;
  };