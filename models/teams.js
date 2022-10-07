module.exports = (sequelize, Sequelize) => {
    const teams = sequelize.define("teams", {
        name: {
            type: Sequelize.STRING,
        },
        locationId: {
            type: Sequelize.INTEGER,
        },
        description: {
            type: Sequelize.STRING,
        },
        teamLeaderId: {
            type: Sequelize.INTEGER,
        },
        isDeleted: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    return teams;
};