// NODE MODULES & DATABASE
const db = require('../models');
const moment = require('moment');
const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const { Op } = db.Sequelize;
const Pincode = db.pincodes;

/*
# purpose: list Pincode
*/
const list = async (req, res) => {
  const pincode = await Pincode.findAndCountAll({});

  const AjaxColumns = [
    { title: 'ID', data: 'id' },
    { title: 'Pincode', data: 'code' },
    { title: 'Serviceable', data: 'serviceable' },
    { title: 'City', data: 'city' },
    { title: 'State', data: 'state' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'masterData/pincodes/pincodeList';
  const payload = {};

  payload.url = 'pincodes';
  payload.pageHeading = 'Pincode';
  payload.totalCount = `Total Pincode: ${pincode.count}`;
  payload.addUrl = 'pincodes/addPincode';
  payload.addButtonName = 'Add';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this pincode?';
  
  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  
  payload.datatable = {
    columns: AjaxColumns,
    apiUrl,
  };

  let strQuery=`UPDATE pincodes SET serviceable='Yes' WHERE code IN (SELECT pincode FROM serviceablePincodes GROUP BY pincode)`;

  let updatePincode=await db.sequelize.query(strQuery, {
    type: sequelize.QueryTypes.UPDATE
  })

  const pincodeServiceable = await Pincode.findAndCountAll({ where: { serviceable : 'Yes' }});
  console.log('pincodeServiceable',pincodeServiceable);
  payload.pincodeCount=pincode.count ? pincode.count : 0;

  payload.pincodeServiceable=pincodeServiceable.count ? pincodeServiceable.count : 0;

  res.render('admin/main_list', payload);
};

/*
# purpose: to send Pincode data into datatables
*/
const pincodeList = async (req, res) => {
  console.log('\n\nRoles - RolesList - BODY :-', req.body);

  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { code: { [Op.like]: `%${req.body.search.value}%` } },
        { city: { [Op.like]: `%${req.body.search.value}%` } },
        { state: { [Op.like]: `%${req.body.search.value}%` } }
      ]
    };
  }

  const pincodes = await Pincode.findAndCountAll({
    where: searchQuery,
    limit: length,
    offset: start,
  });
  console.log('\n\nRoll - rolelist :-', pincodes);
  pincodes.rows.forEach((pincode) => {
    console.log('\n\nRoll - rolelist - forEach :-', pincode);
    let actions = '';
    if (req.permissionsList.includes('edit')) {
      actions = actions + `<a class='dt-action text-capitalize' href='/masterData/pincodes/edit/${pincode.id}'><b>Edit</b></a>`;
    }
    if (req.permissionsList.includes('delete')) {
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" onclick="action('masterData/pincodes/delete', ${pincode.id}, '')"><b>Delete</b></a>`;
    }
    pincode.dataValues.actions = actions;
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: pincodes.rows,
    recordsFiltered: pincodes.count,
    recordsTotal: pincodes.count,
  });
};

/*
# purpose: to Create Pincode
*/
const createPincode = async (req, res) => {
  const newPincode = {
    code: req.body.code,
    serviceable: req.body.serviceable,
    city: req.body.city,
    state: req.body.state,
  };

  const pincode = await Pincode.create(newPincode);

  console.log('\n\nPincodes - createPincode :-', pincode);

  const payload = {};
  payload.pincode = req.body;

  res.redirect('/masterData/pincodes');
};

/*
# purpose: to edit Pincode
*/
const editPincode = async (req, res) => {
  const { id } = req.params;

  const pincode = await Pincode.findOne({ where: { id } });

  const payload = {};
  payload.pincode = pincode.dataValues;

  res.render('admin/components/masterData/pincode/edit_pincode', payload);
};

/*
# purpose: to update Pincode
*/
const updatePincode = async (req, res) => {
  console.log('\n\nUpdatePermissionsDetails :-', req.body);
  const { id } = req.params;
  await Pincode.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/masterData/pincodes');
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
# purpose: to delete Pincode
*/
const deletePincode = async (req, res) => {
  const { userId } = req.body;
  console.log('\n\nLeads - deleteById - BODY :-', req.body);
  await Pincode.destroy({ where: { id: userId } });
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body,
  });
};

module.exports = {
  list,
  pincodeList,
  createPincode,
  editPincode,
  updatePincode,
  deletePincode
};