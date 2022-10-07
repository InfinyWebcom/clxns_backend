module.exports = (sequelize, Sequelize) => {
    const auditTrail = sequelize.define('auditTrail', {
        userId: {
            type: Sequelize.INTEGER,
            unique: false
        },
        moduleName: {
            type: Sequelize.STRING,
        },
        tableName: {
            type: Sequelize.STRING,
        },
        action: {
            type: Sequelize.STRING,
        },
        objectId: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        description: {
            type: Sequelize.STRING,
        }
    });
  
    return auditTrail;
  };
  