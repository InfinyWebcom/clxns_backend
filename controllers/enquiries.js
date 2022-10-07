// NODE MODULES & DATABASE
const db = require('../models');

const {Op} = db.Sequelize;
const Contact = db.contact_us;
const {
  create, findAll, findOne, update, deleteOne,
} = require('./crud.js')(Contact);

// Actions on each element

const index = async (req, res) => {
  const payload = {};
  payload.title = 'Clxns 1.0.0' ;
  payload.data = 'this is data';
  res.render('admin/enquiries', payload);
};

// List Enqueries - Page
const list = async (req, res) => {
  const contacts = await Contact.findAndCountAll({});

  const AjaxColumns = [
    { title: 'First Name', data: 'first_name' },
    { title: 'Last Name', data: 'last_name' },
    { title: 'Subject', data: 'subject' },
    { title: 'Email', data: 'email' },
    { title: 'Phone', data: 'phone' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'enquiries/enquirieslist';

  const payload = {};

  payload.url = 'enquiries';
  payload.pageHeading = 'Enquiries';
  payload.totalCount = `Total Enquiries: ${contacts.count}`;
  payload.addUrl = 'enquiries/addEnquiries';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this enquiry?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  
  payload.datatable = {
    columns: AjaxColumns,
    apiUrl: apiUrl,
  };

  res.render('admin/main_list', payload);
};

/* List enquiries */
const enquirieslist = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { first_name: { [Op.like]: `%${req.body.search.value}%` } },
        { last_name: { [Op.like]: `%${req.body.search.value}%` } },
        { email: { [Op.like]: `%${req.body.search.value}%` } },
      ],
    };
  }

  const contacts = await Contact.findAndCountAll({ where: searchQuery, limit: length, offset: start });

  contacts.rows.forEach((contact) => {
    
    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions = `<a class='dt-action text-capitalize' href='enquiries/view/${contact.id}'><b>Show</b></a>`;
    }
    if (req.permissionsList.includes('delete')) {
      actions += `<a href="#confirmModal" class='modal-trigger dt-action text-capitalize pointer' onclick="action('enquiries/delete','', ${contact.id})"><b>Delete</b></a>`;
    }
    contact.dataValues.actions = actions;
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: contacts.rows,
    recordsFiltered: contacts.count,
    recordsTotal: contacts.count,
  });
};

// Find a single Contact with an id
const viewEnquiriesDetails = async (req, res) => {
  const { id } = req.params;

  const Contacts = await Contact.findByPk(id)
    .then((data) => data)
    .catch((err) => {
      res.status(500).send({
        error: err,
        message: `Error retrieving Contact with id=${id}`,
      });
    });

    const payload = {};
    payload.url = 'enquiries/enquirieslist';
    payload.Contacts = Contacts;
    
    res.render('admin/components/enquiries/view_enquiries', payload);
};

/* update enquiries By Id  */
const updateById = async (req, res) => {
  const { id } = req.params;

  await Contact.update(req.body, {
    where: { id },
  }).then((num) => {
    console.log(num);
    if (num == 1) {
     res.redirect('/enquiries');
    } else {
      res.send({
        message: `Cannot update Contact with id=${id}. Maybe Contact was not found or req.body is empty!`,
      });
    }
  })
  .catch((err) => {
      res.status(500).send({
        message:
            err.message || 'Some error occurred while retrieving Contacts.',
      });
    });  
};
/* delete enquiries By Id  */
const deleteById = async (req, res) => {

  const { teamId } = req.body;
  
  await Contact.destroy({ where: { id: teamId } })

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });
  
};

module.exports = {
  index,
  list,
  enquirieslist,
  viewEnquiriesDetails,
  create,
  findAll,
  findOne,
  updateById,
  update,
  deleteOne,
  deleteById,
};
