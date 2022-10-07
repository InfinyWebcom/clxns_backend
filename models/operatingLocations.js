module.exports = (sequelize, Sequelize) => {
    const operatingLocations = sequelize.define("operatingLocations", {
        userId: {
            type: Sequelize.STRING,
        },
        locationId: {
            type: Sequelize.INTEGER,
        }
    });

    return operatingLocations;
};