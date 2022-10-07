module.exports = (sequelize, Sequelize) => {
    const languages = sequelize.define('language', {
      name: {
        type: Sequelize.STRING,
        required: true,
        allowNull: false,
      },
    });
    return languages;
};