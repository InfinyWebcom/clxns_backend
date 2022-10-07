const db = require('../models');

const SubDispositions = db.subDispositions;
const Sequelize = require('sequelize');
const { Op } = db.Sequelize;

/*
# purpose: insert subDispositions in subDispositions DB
*/
const loadSubDispositions = (req,res) => {
    const sql =
      `INSERT INTO subDispositions (id, name, dispositionId, createdAt, updatedAt ) VALUES
  (1, 'Active PTP', 7 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (2, 'Future PTP', 7 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (3, 'Already Paid', 14 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (4, 'Amount Dispute', 14 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (5, 'Fraud/Cheating', 14 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (6, 'Abusive Language', 14 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (7, 'Others', 14 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),

  (8, 'House Locked', 20 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (9, 'Address Not Found', 20 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (10, 'Not Available but Resides here', 20 , '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (11, 'Residence Shifted', 20, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (12, 'Left Message with Family Members', 20, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (13, 'Active PTP', 21, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (14, 'Future PTP', 21, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (15, 'Already Paid', 27, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (16, 'Amount Dispute', 27, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (17, 'Fraud/Cheating', 27, '2021-06-21 13:10:10', '2021-06-21 13:10:10'),
  (19, 'Others', 27, '2021-06-21 13:10:10', '2021-06-21 13:10:10' )`;
  
  SubDispositions.findAll({}).then(data => {
    if (data.length == 0 || data == null || !data) {
      db.sequelize.query(
        sql,
        { type: Sequelize.QueryTypes.INSERT }
      ).then(function (clientInsertId) {
        console.log(clientInsertId);
        return res.status(200).json({
          title: 'success',
          error: false
        });
      });
    } else {
      return res.status(200).json({
        title: 'failed',
        error: false
      });
    }
  })  
  }

module.exports = { loadSubDispositions };