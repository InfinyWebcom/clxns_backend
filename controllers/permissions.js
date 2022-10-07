// NODE MODULES & DATABASE
const db = require('../models');
const users = require('../models/users');

const RoleModules = db.rolesModules;
const { Op } = db.Sequelize;
const Roles = db.roles;
const Modules = db.modules;
const Users = db.users;

/*
# purpose: list Roles
*/
const list = async (req, res) => {
  const roles = await Roles.findAndCountAll({});

  const AjaxColumns = [
    { title: 'ID', data: 'id' },
    { title: 'Name', data: 'displayName' },
    { title: 'Level', data: 'level' },
    { title: 'Type', data: 'type' },
    { title: 'Actions', data: 'actions' },
  ];

  const apiUrl = 'permissions/permissionsList';
  const payload = {};

  payload.url = 'permissions';
  payload.pageHeading = 'Permissions-Roles';
  payload.totalCount = `Total Permissions: ${roles.count}`;
  payload.addUrl = '/permissions/addRoles';
  payload.addButtonName = 'Add Role';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to changed this role?';
  
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
# purpose: to send Roles data into datatables
*/
const permissionsList = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }],
    };
  }

  const roles = await Roles.findAndCountAll({
    where: searchQuery,
    limit: length,
    offset: start,
  });
  
  roles.rows.forEach((role) => { 
    let actions = '';
    if (req.permissionsList.includes('view') && !(role.dataValues.name=='admin')) {
      actions = `<a class='dt-action text-capitalize' href='/permissions/roles/view/${role.id}'><b>Permissions</b></a>`;
    }else{
      actions = `<a class='dt-action text-capitalize' style="color: gray;" ><b>Permissions</b></a style="color: gray;">`;
    }
    // if (req.permissionsList.includes('edit')) {
    //   actions += `<a class='dt-action text-capitalize' href='/permissions/roles/edit/${role.id}'><b>Edit</b></a>`;
    // }
    // if (role.dataValues.users[0] && role.dataValues.users[0].dataValues.roleId != 'undefined' && role.dataValues.status=='active' && (role.dataValues.name=='Admin' || role.dataValues.name=='Telecaller' || role.dataValues.name=='Leader' || role.dataValues.name=='FOS')) {
    //   actions += `<a class="dt-action text-capitalize" style="color: gray;"><b>Deactivate</b></a style="color: gray;">`;
    // } else if(role.dataValues.users[0] && role.dataValues.users[0].dataValues.roleId != 'undefined' && role.dataValues.status=='active'){
    //   actions += `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to deactivate this role?" onclick="action('permissions/roles/status', '${role.id}', '${role.status}')"><b>Deactivate</b></a>`;
    // }
    // else if(  role.dataValues.status=='active'){
    //   actions += `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to deactivate this role?" onclick="action('permissions/roles/status', '${role.id}', '${role.status}')"><b>Deactivate</b></a>`;
    // }
    // else {
    //   actions += `<a href="#confirmModal" class="modal-trigger dt-action text-capitalize pointer" data-msg="Are you sure you want to activate this role?" onclick="action('permissions/roles/status', '${role.id}', '${role.status}')"><b>Activate</b></a>`;
    // }
    role.dataValues.displayName=role.dataValues.displayName.replace('_',' ').toLowerCase().split(' ').map((displayNam)=> {return displayNam[0].toUpperCase() + displayNam.substr(1);}).join(" ");
    role.dataValues.actions = actions;
    role.dataValues.type = role.dataValues.type.toLowerCase().split(' ').map((type)=> {return type[0].toUpperCase() + type.substr(1);}).join(" ");
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: roles.rows,
    recordsFiltered: roles.count,
    recordsTotal: roles.count,
  });
};

/*
# purpose: to create Permissions
*/
const createPermissions = async (req, res) => {
  const newRole = {
    name: (req.body.name).toLowerCase(),
    displayName:(req.body.displayName).toLowerCase(),
    level:req.body.level,
    type:(req.body.type).toLowerCase()
  };

  const role = await Roles.create(newRole);

  const payload = {};
  payload.campaign = req.body;

  res.redirect('/permissions');
};

/*
# purpose: to view Permissions Details
*/
const viewPermissionsDetails = async (req, res) => {
  const { id } = req.params;

  const role = await Roles.findOne({ where: { id } });
  const Module = await Modules.findAll({
    attributes: ['id', 'name', 'actions'],
    raw: true,
  });
  const ModulesArray = [];

  await Promise.all(Module.map(async (module) => {
    let checkAction = false;
    const PermissionCheck = await RoleModules.findOne({
      where: { roleId: req.params.id, moduleId: module.id },
      raw: true,
    });
    
    if (PermissionCheck && PermissionCheck !== null) {
      checkAction = true;
    }
    let contains = false;
    if (ModulesArray.length === 0) {
      ModulesArray.push({
        module: module.name,
        actions: [
          {
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          },
        ],
      });
    } else {
      ModulesArray.map((val) => {
        if (val.module === module.name) {
          contains = true;
          val.actions.push({
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          });
        }
      });
      if (!contains) {
        ModulesArray.push({
          module: module.name,
          actions: [
            {
              id: module.id,
              name: module.actions,
              isCheck: checkAction,
            },
          ],
        });
      }
    }
  }));
 
  const ModulesArrayData = ModulesArray;
  
  const payload = {};
  payload.ModulesArray = ModulesArray;
  payload.role = role.dataValues;
  payload.addUrl = '/permissions/roles/addPermissionsAll';
  res.render('admin/components/permissions/roles/view_Permissions', payload);
};

/*
# purpose: to update Permissions Modules
*/
const updatePermissionsModules = async (req, res) => {
  const { id } = req.params;
  const ModulesId = req.body.moduleId;

  // console.log('\n\nUpdatePermissions Length :-', ModulesId.length);

  const ArrayList = [];
  const RoleModulesArray = await RoleModules.findAll({
    where: { roleId: id },
    raw: true,
  });

  await Promise.all(RoleModulesArray.map(async (roleModules) => {
    ArrayList.push(
      roleModules.moduleId,
    );
  }));
  const NewArrayList = ArrayList.map(String);
  // console.log('\n\nNewArrayList ModulesArray Length:-', NewArrayList.length);
  
  if ((ModulesId && (ModulesId.length > 0)) || (!NewArrayList)) {
    if (NewArrayList && ModulesId.length < NewArrayList.length) {
      NewArrayList.map(async (arrayList) => {
        
        if (!ModulesId.includes(arrayList)) {
          await RoleModules.destroy({ where: { moduleId: arrayList, roleId: id, } });
        }
      });
    }
    if (ModulesId && ModulesId.length > NewArrayList.length) {
      ModulesId.forEach(async (modulesId) => {
        
        if (!NewArrayList.includes(modulesId)) {
          await RoleModules.findOrCreate({ where: { roleId: id, moduleId: modulesId } });
        }
      });
    }
  } else {
    RoleModulesArray.map(async (roleModulesArray) => {
      await RoleModules.destroy({
        where: {
          roleId: roleModulesArray.roleId,
          moduleId: roleModulesArray.moduleId,
        },
      });
    });
  }
  res.redirect('/permissions');
};

/*
# purpose: to edit Permissions Roles
*/
const editPermissionsRoles = async (req, res) => {
  const { id } = req.params;

  const role = await Roles.findOne({ where: { id } });

  const payload = {};
  payload.role = role.dataValues;

  res.render('admin/components/permissions/roles/edit_roles', payload);
};

/*
# purpose: to update Permissions Roles
*/
const updatePermissionsRoles = async (req, res) => {
 
  const { id } = req.params;
  await Roles.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num == 1) {
        res.redirect('/permissions');
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

//delete roles
/*
const deletePermissionsRoles = async (req, res) => {
  const { userId } = req.body;
  console.log('\n\nLeads - deleteById - BODY :-', req.body);
  await Roles.destroy({ where: { id: userId } });
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body,
  });
};
*/

/*
# purpose: to permissionRole Status
*/
const permissionRoleStatus=async(req,res)=>{
  const { userId,teamId } = req.body;
  let status=teamId;
  let statusChange='';
  if(status=='active'){
    statusChange='inactive'
  }else{
    statusChange='active'
  }

  await Roles.update({ status: statusChange }, { where: { id: userId } });
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body,
  });
};

/*
# purpose: to modules Permissions List
*/
const modulesPermissionsList = async (req, res) => {
  
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;
  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }],
    };
  }

  const modules = await Modules.findAndCountAll({
    where: searchQuery,
    limit: length,
    offset: start,
  });
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: modules.rows,
    recordsFiltered: modules.count,
    recordsTotal: modules.count,
  });
};

/*
# purpose: role Permissions
*/
const rolePermissions = async (req, res) => {

  const role = await Roles.findOne({ where: { name: req.body.role }, raw: true});

  
  const Module = await Modules.findAll({
    attributes: ['id', 'name', 'actions'],
    raw: true,
  });

  const ModulesArray = [];

  await Promise.all(Module.map(async (module) => {
    let checkAction = false;
    const PermissionCheck = await RoleModules.findOne({
      where: { roleId: role.id, moduleId: module.id },
      raw: true,
    });
    if (PermissionCheck && PermissionCheck !== null) {
      checkAction = true;
    }
    let contains = false;
    if (ModulesArray.length === 0) {
      ModulesArray.push({
        module: module.name,
        actions: [
          {
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          },
        ],
        isCheck: checkAction,
      });
    } else {
      ModulesArray.map((val) => {
        if (val.module === module.name) {
          contains = true;
          val.actions.push({
            id: module.id,
            name: module.actions,
            isCheck: checkAction,
          });
        }
      });
      if (!contains) {
        ModulesArray.push({
          module: module.name,
          actions: [
            {
              id: module.id,
              name: module.actions,
              isCheck: checkAction,
            },
          ],
          isCheck: checkAction,
        });
      }
    }
  }));

  const ModulesArrayData = ModulesArray;
  

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: ModulesArrayData
  });

}


module.exports = {
  list,
  permissionsList,
  createPermissions,
  viewPermissionsDetails,
  editPermissionsRoles,
  updatePermissionsRoles,
  updatePermissionsModules,
  // deletePermissionsRoles,
  modulesPermissionsList,
  permissionRoleStatus,
  rolePermissions
};
