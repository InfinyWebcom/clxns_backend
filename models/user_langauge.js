module.exports = (sequelize, Sequelize) => {
  const UserLangauge = sequelize.define('userLangauge', {
    userId: {
      type: Sequelize.INTEGER,
      required: true,
      allowNull: false,
    },
    language: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });
  return UserLangauge;
};