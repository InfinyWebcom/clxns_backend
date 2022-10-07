// NODE MODULES & DATABASE
const db = require('../models');

const Dispositions = db.dispositions;
const subDispositions = db.subDispositions;
const Sequelize = require('sequelize');
const { Op } = db.Sequelize;

/*
# purpose: INSERT dispositions in dispositions db 
*/
const loadDispositions = async(req,res) => {
  const sql =
    `INSERT INTO dispositions (id, name, type, setReminder, allowFeedback, isDeleted, createdAt, updatedAt ) VALUES

(2, 'Ringing but No Response/Telecaller Waiting', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(3, 'Switched Off/Not Reachable', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(4, 'Wrong Contact Number', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(5, 'Language Not Communicable', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(6, 'Re-Allocated', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(7, 'Promise to Pay', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(8, 'Settlement/Foreclosure', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(9, 'Broken PTP', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(10, 'Denial/RTP (Refused to Pay)', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(11, 'Reverted over Email/Phone', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(12, 'Recovered', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(13, 'Partially Recovered', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(14, 'Dispute', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(15, 'Customer Deceased', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(16, 'Call Back', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(17, 'Legal Stage/Assigned to Lawyer', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(18, 'Closed/DND (Do Not Disturb)', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(19, 'Assigned to FOS', 'Telecaller', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),

(20, 'Customer Not Found', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(21, 'Promise to Pay', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(22, 'Settlement/Foreclosure', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(23, 'Broken PTP', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(24, 'Denial/RTP (Refused to Pay)', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(25, 'Collected', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(26, 'Partially Collected', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(27, 'Dispute', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(28, 'Customer Deceased', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ),
(29, 'Call Back', 'Fos', 0, 0, 0, '2021-06-21 13:10:10', '2021-06-21 13:10:10' ) `;
  Dispositions.findAll({}).then(data => {
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

/*
# purpose: list dispositions 
*/
const list = async (req, res) => {
  const dis = await Dispositions.findAndCountAll({});
  const AjaxColumns = [
    { title: 'Name', data: 'name' },
    { title: 'Type', data: 'type' },
    { title: 'Set Reminder', data: 'setReminder' },
    { title: 'Allow Feedback', data: 'allowFeedback' },
    // { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'masterData/dispositions/dispositionList';
  const payload = {};

  payload.url = 'dispositions';
  payload.pageHeading = 'Dispositions';
  payload.totalCount = `Total disposition: ${dis.count}`;
  payload.addUrl = 'dispositions/addDisposition';
  payload.addButtonName = 'add Disposition';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this disposition?';
  
  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  
  payload.datatable = {
    columns: AjaxColumns,
    apiUrl,
  };

  res.render('admin/main_list', payload);
};

/*
# purpose: to send dispositions data into datatables
*/
const dispositionList = async (req, res) => {
  
    const length = req.body.length ? parseInt(req.body.length) : 5;
    const start = req.body.start ? parseInt(req.body.start) : 0;
    let searchQuery = null;
  
    if (req.body.search.value != '') {
      searchQuery = {
        [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }],
      };
    }
    if (req.body.search.value != '') {
      searchQuery = { ...searchQuery, isDeleted: 0 };
    } else {
      searchQuery = { isDeleted: 0 };
    }
    const dispositions = await Dispositions.findAndCountAll({
      where: searchQuery,
      limit: length,
      offset: start,
    });

    // dispositions.rows.forEach((fi) => {
    //   let actions = '';
    //   let status= fi.dataValues.isDeleted;
    //   if (req.permissionsList.includes('edit')) {
    //     actions = actions + `<a class='dt-action text-capitalize' href='/masterData/dispositions/edit/${fi.id}'><b>Edit</b></a>`;
    //   }
    //   if (fi.dataValues && fi.dataValues.isDeleted==0) {
    //     actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" onclick="action('masterData/dispositions/delete', ${fi.id}, '${status}')"><b>Delete</b></a>`;
    //   }
  
    //   fi.dataValues.actions = actions;
    // });
  
    return res.status(200).json({
      title: 'Success',
      error: false,
      data: dispositions.rows,
      recordsFiltered: dispositions.count,
      recordsTotal: dispositions.count,
    });
  };

/*
# purpose: to add Disposition page
*/
const addDisposition = async (req, res )=> {
//   const Locations = await Location.findAll({});
  const payload = {};
//   payload.Locations = Locations;
  res.render('admin/components/masterData/dispositions/add_disposition',payload)
}

/*
# purpose: to create Disposition page
*/
const createDis = async (req, res) => {
  const Dis = {
    name: req.body.name,
    type: req.body.type,
    setReminder: req.body.setReminder && req.body.setReminder === 'yes' ? true : false,
    allowFeedback: req.body.allowFeedback && req.body.allowFeedback === 'yes' ? true : false,
    isDeleted: false
  };

  const disposition = await Dispositions.create(Dis);

  const payload = {};
  payload.disposition = req.body;

  res.redirect('/masterData/dispositions');
};

/*
# purpose: to edit Disposition
*/
const editDisposition = async (req, res) => {
  const { id } = req.params;

  const dis = await Dispositions.findOne({ where: { id } });
  const payload = {};
  payload.dis = dis.dataValues;

  res.render('admin/components/masterData/dispositions/edit_disposition', payload);
};

/*
# purpose: to update Disposition
*/
const updateDisposition = async (req, res) => {
  const { id } = req.params;

  const newBody = {
    type: req.body.type,
    name: req.body.name,
    setReminder: req.body.setReminder && req.body.setReminder == 'yes' ? true : false,
    allowFeedback: req.body.allowFeedback && req.body.allowFeedback == 'yes' ? true : false
  }
  await Dispositions.update(newBody, {
    where: { id },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/masterData/dispositions');
      } else {
        res.send({
          message: `Cannot update Contact with id=${id}. Maybe Contact was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Contacts.',
      });
    });
};

/*
# purpose: to delete Disposition
*/
const deleteDisposition = async (req, res) => {
  const { userId } = req.body;

  await Dispositions.update({ isDeleted: true }, { where: { id: userId } });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });
};

/*
# purpose: to list Telecaller Dispositions
*/
const listTelecallerDis = async (req, res) => {
  const userData = req.user;

  let data = await Dispositions.findAll({ where: { type: 'Telecaller' } });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: data
  });
};

module.exports = {
  loadDispositions,
  list,
  dispositionList,
  createDis,
  addDisposition,
  editDisposition,
  updateDisposition,
  deleteDisposition,
  listTelecallerDis
};