/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
/* eslint-disable linebreak-style */
/* eslint-disable indent */
module.exports = {
    HOST: process.env.HOST,
    USER: process.env.DBUSER,
    PASSWORD: process.env.PASSWORD,
    DB: process.env.DB,
    dialect: process.env.dialect,
    dialectOptions: {
        useUTC: false, //for reading from database
        dateStrings: true,
        typeCast: function (field, next) { // for reading from database
          if (field.type === 'DATETIME') {
            return field.string()
          }
            return next()
          },
      },
    timezone: '+05:30',
    pool: {
        max: 5,
        min: 0,
        acquire: 500000,
        idle: 10000
    }
};