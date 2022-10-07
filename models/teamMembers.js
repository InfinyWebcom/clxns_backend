module.exports = (sequelize, Sequelize) => {
    const teamMembers = sequelize.define("teamMembers", {
        userId: {
            type: Sequelize.STRING,
        },
        teamId: {
            type: Sequelize.INTEGER,
        }
    });

    return teamMembers;
};