module.exports = (sequelize, Sequelize) => {
  const Fis = sequelize.define('fis', {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    shortName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    fiImage: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    isDeleted: {
      type: Sequelize.INTEGER,
      defaultValue: 0
  }
  });
  return Fis;
};