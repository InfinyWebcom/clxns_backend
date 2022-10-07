// NODE MODULES & DATABASE
const db = require('../models');

const Location = db.locations;
const { Op } = db.Sequelize;

/*
# purpose: list location
*/
const list = async (req, res) => {
  const location = await Location.findAndCountAll({});

  const AjaxColumns = [
    { title: 'ID', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'masterData/locations/locationList';
  const payload = {};

  payload.url = 'locations';
  payload.pageHeading = 'Location';
  payload.totalCount = `Total Location: ${location.count}`;
  payload.addUrl = 'locations/addLocation';
  payload.addButtonName = 'add Location';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this location?';
  
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
# purpose: to send location data into datatables
*/
const locationList = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }],
    };
  }

  const locations = await Location.findAndCountAll({
    where: searchQuery,
    limit: length,
    offset: start,
  });

  locations.rows.forEach((location) => {
    let actions = '';
    if (req.permissionsList.includes('edit')) {
      actions = actions + `<a class='dt-action text-capitalize' href='/masterData/locations/edit/${location.id}'><b>Edit</b></a>`;
    }
    if (req.permissionsList.includes('delete')) {
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" onclick="action('masterData/locations/delete', ${location.id}, '')"><b>Delete</b></a>`;
    }
    location.dataValues.actions = actions;
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: locations.rows,
    recordsFiltered: locations.count,
    recordsTotal: locations.count,
  });
};

/*
# purpose: to Create Location
*/
const createLocation = async (req, res) => {
  const newLocation = {
    name: req.body.name,
  };

  const location = await Location.create(newLocation);

  const payload = {};
  payload.location = req.body;

  res.redirect('/masterData/locations');
};

/*
# purpose: to edit Location
*/
const editLocation = async (req, res) => {
  const { id } = req.params;

  const location = await Location.findOne({ where: { id } });

  const payload = {};
  payload.location = location.dataValues;

  res.render('admin/components/masterData/location/edit_location', payload);
};

/*
# purpose: to update Location 
*/
const updateLocation = async (req, res) => {
  const { id } = req.params;
  await Location.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/masterData/locations');
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
# purpose: to delete Location 
*/
const deleteLocation = async (req, res) => {
  const { userId } = req.body;
  await Location.destroy({ where: { id: userId } });
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body,
  });
};

module.exports = {
  list,
  locationList,
  createLocation,
  editLocation,
  updateLocation,
  deleteLocation
};