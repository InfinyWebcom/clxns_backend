const db = require('../models');
// NODE MODULES
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { check, validationResult, body } = require('express-validator');
const Fis = db.fis;
const FisLogin = db.fisLogins;
const Location = db.locations;
const fs = require('fs');
const path = require('path');
const uploadHandler = require('../utils/upload');
const { Op } = db.Sequelize;

/*
# parameters: email, password
# purpose: login for fi
*/
const login = async (req, res) => {
  let error = false;
  if (req.body.email) {
    const { email, password } = req.body;
    if (email && password) {
      const fiUserLogin = await FisLogin.findOne({ where: { email : email } });
      if (fiUserLogin != null) {
        let FiData=await Fis.findOne({ where: { id : fiUserLogin.fiId } });
        let FiName;
        if(FiData!=null){
          FiName=FiData.name
        }else{
          FiName=''
        }
        const activeFiCheck = await FisLogin.findOne({ where: { email : email ,isDeleted : 0 } });
        if(activeFiCheck==null){
          error = 'User is deactivated, Please contact Admin!';
          const payload = {};
          payload.title = 'Clxns: Login';
          payload.error = error;
          payload.toast = false;
          payload.toastColor = 'green'
          payload.toastText = ''
          res.render('fi_login', payload);
        }
        if (bcrypt.compareSync(req.body.password, fiUserLogin.dataValues.password)) {
          req.session.loggedin = true;
          req.session.email = fiUserLogin.email;
          req.session.fiLogin_id = fiUserLogin.id;
          req.session.roleNameFi = 'FiName';
          req.session.user = fiUserLogin;
          req.session.FiName = FiName;
          res.redirect('/reports');
        } else if (
          !bcrypt.compareSync(req.body.password, fiUserLogin.dataValues.password)
        ) {
          error = 'Incorrect username or password';
        }
      } else {
        error = 'User Not found';
      }
    } else {
      error = 'Please enter Username and Password!';
    }
  }else{
    const payload = {};
    payload.toast = false;
    payload.toastColor = 'green'
    payload.toastText = ''
    payload.title = 'Clxns: Login';
    payload.error = error;
    res.render('fi_login', payload);
  }
  
};

/*
# purpose: logout for fi login
*/
const logout = async (req, res) => {

  req.session.destroy(() => {
    // cannot access session here
    res.redirect('/fis/login');
  });
};

/*
# purpose: list Fis
*/
const list = async (req, res) => {
  const fis = await Fis.findAndCountAll({});
  const AjaxColumns = [
    { title: 'ID', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'Short Name', data: 'shortName' },
    { title: 'Location/Zone', data: 'location' },
    { title: 'Category', data: 'category' },
    { title: 'Description', data: 'description' },
    { title: 'FI Logo', data: 'fiImage' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'masterData/fis/fisList';
  const payload = {};

  payload.url = 'fis';
  payload.pageHeading = 'FIs';
  payload.totalCount = `Total Fis: ${fis.count}`;
  payload.addUrl = 'fis/addFis';
  payload.addButtonName = 'add FIs';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this fis?';
  
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
# purpose: to send Fis data into datatables
*/
const fisList = async (req, res) => {

  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }],
    };
  }

  const fis = await Fis.findAndCountAll({
    where: searchQuery,
    limit: length,
    offset: start,
  });

  fis.rows.forEach((fi) => {
    let actions = '';
    let status=fi.dataValues.isDeleted;
    if (req.permissionsList.includes('edit')) {
      actions = actions + `<a class='dt-action text-capitalize' href='/masterData/fis/edit/${fi.id}'><b>Edit</b></a>`;
    }
    if (fi.dataValues && fi.dataValues.isDeleted==0) {
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to deactivate this FIs?" onclick="action('masterData/fis/delete', ${fi.id}, '${status}')"><b>Deactivate</b></a>`;
    }else {
      actions = actions + `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to activate this FIs?" onclick="action('masterData/fis/delete', ${fi.id}, '${status}')"><b>Activate</b></a>`;
    }

    fi.dataValues.actions = actions;
    var fileUrl = process.env.baseUrl + "fis_Logo/" + fi.dataValues.fiImage
 
    fi.dataValues.fiImage = `<a href='${fileUrl}' target='_blank'>${fi.dataValues.fiImage}</a>`
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: fis.rows,
    recordsFiltered: fis.count,
    recordsTotal: fis.count,
  });
};

/*
# purpose: to add Fis
*/
const addFis=async (req, res )=> {
  const Locations = await Location.findAll({});
  const payload = {};
  payload.Locations = Locations;
  res.render('admin/components/masterData/fis/add_fis',payload)
}

/*
# purpose: to create Fis
*/
const createFis = async (req, res) => {
  let fileType;
  let sampleFile;
  if(req.files!=null){
    fileType = req.files.fiImage.mimetype;
    sampleFile = req.files.fiImage;
  }

  if(req.files!=undefined){
    if (fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
      console.log('Please upload only Image file!');
      const Locations = await Location.findAll({});
      const payload = {};
      payload.Locations = Locations;
      payload.toastText = 'Please upload only Image file!'
      return res.render('admin/components/masterData/fis/add_fis',payload)
    }
      console.log('Image file else');
      
      uploadPath = `./uploads/fis_Logo/${req.files.fiImage.name}`;
      uploadHandler.createDir('./uploads/fis_Logo/');
  
      if (fs.existsSync(uploadPath)) {
        console.log('uploaded file exists');
        const Locations = await Location.findAll({});
        const payload = {};
        payload.Locations = Locations;
        payload.toastText = 'uploaded file exists'
       return res.render('admin/components/masterData/fis/add_fis',payload);
      }
    
    await sampleFile.mv(uploadPath, async (err) => {
      if (err || err !== undefined) {
        console.log('Error in File Uploading Please Check File Uploading Path!');
        const Locations = await Location.findAll({});
        const payload = {};
        payload.Locations = Locations;
        return res.render('admin/components/masterData/fis/add_fis',payload);
      }
    });  
  }

  const newFis = {
    name: req.body.name,
    shortName:req.body.shortName,
    location: req.body.location,
    category: req.body.category,
    description: req.body.description,
    fiImage:req.files.fiImage.name
  };

  const fis = await Fis.create(newFis);

  const payload = {};
  payload.fis = req.body;

  res.redirect('/masterData/fis');
};

/*
# purpose: to edit Fis
*/
const editFis = async (req, res) => {
  const { id } = req.params;

  const fis = await Fis.findOne({ where: { id } });
  const Locations = await Location.findAll({});

  const payload = {};
  payload.fis = fis.dataValues;
  payload.Locations = Locations;

  res.render('admin/components/masterData/fis/edit_fis', payload);
};

/*
# purpose: to update Fis
*/
const updateFis = async (req, res) => {

  const { id } = req.params;

  let fileType;
  let sampleFile;
  if(req.files!=null){
    fileType = req.files.fiImage.mimetype;
    sampleFile = req.files.fiImage;
  }

  if(req.files!=undefined){
    if (fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
      console.log('Please upload only Image file!');
      const Locations = await Location.findAll({});
      const payload = {};
      payload.Locations = Locations;
      payload.toastText = 'Please upload only Image file!'
      return res.render('admin/components/masterData/fis/edit_fis',payload)
    }
      
      uploadPath = `./uploads/fis_Logo/${req.files.fiImage.name}`;
      uploadHandler.createDir('./uploads/fis_Logo/');
  
      // if (fs.existsSync(uploadPath)) {
      //   console.log('uploaded file exists');
      //   const Locations = await Location.findAll({});
      //   const payload = {};
      //   payload.Locations = Locations;
      //   payload.toastText = 'uploaded file exists'
      //  return res.render('admin/components/masterData/fis/edit_fis',payload);
      // }
    
    await sampleFile.mv(uploadPath, async (err) => {
      if (err || err !== undefined) {
        console.log('Error in File Uploading Please Check File Uploading Path!');
        const Locations = await Location.findAll({});
        const payload = {};
        payload.Locations = Locations;
        return res.render('admin/components/masterData/fis/edit_fis',payload);
      }
    });  
  }

  const fisData=await Fis.findOne({  where: { id } });
  let fiImage=fisData.dataValues.fiImage;
   if(req.files && req.files.fiImage){
    fiImage = req.files.fiImage.name;
   }
  await Fis.update({...req.body,fiImage}, {
    where: { id },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/masterData/fis');
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
# purpose: to delete Fis
*/
const deleteFis = async (req, res) => {
  const { userId } = req.body;

  let status=req.body.teamId;
  let statusChange='';
  if(status==0){
    statusChange=1;
  }else{
    statusChange=0;
  }

  await Fis.update({ isDeleted: statusChange }, { where: { id: userId } });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });
};

module.exports = {
  list,
  fisList,
  createFis,
  editFis,
  updateFis,
  deleteFis,
  addFis,
  login,
  logout
};