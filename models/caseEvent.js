module.exports = (sequelize, Sequelize) => {
    const CaseEvent = sequelize.define('caseEvent', {
        // dispositionId: {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        // },
        // subDispositionId: {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        // },
        comments: {
            type: Sequelize.STRING,
        },
        fileName: {
            type: Sequelize.STRING,
        },
        leadId: {
            type: Sequelize.STRING,
        },
        additionalField: {
            type: Sequelize.TEXT,
          },
        nextAction: {
            type: Sequelize.STRING,
        },
        followUp: {
            type: Sequelize.DATE,
        },
        userId:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        location:{
            type: Sequelize.STRING,
            allowNull: true,
        }
    });
  
    return CaseEvent;
};
  