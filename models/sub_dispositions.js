module.exports = (sequelize, Sequelize) => {
    const SubDisposition = sequelize.define('subDisposition', {
      name: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
      dispositionId: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    });
    return SubDisposition;
  };