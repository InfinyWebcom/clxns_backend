// NODE MODULES
const moment = require('moment');
const Sequelize = require('sequelize');
// DATABASE
const db = require('../models');
const Op = db.Sequelize.Op;
const CampaignMembers = db.campaignMembers;
const Campaign = db.campaign;
const Leads = db.leads;
const Users = db.users;
const Roles = db.roles;
const Teams = db.teams;
const TeamMember = db.teamMembers;
const Language = db.language;

/*
# purpose: list campaign
*/
const list = async (req, res) => {

  const campaign = await Campaign.findAndCountAll({ where: { isDeleted: 0 } });

  const AjaxColumns = [
    { 'title': 'Name', 'data': 'name' },
    // { 'title': 'Status', 'data': 'status' },
    { 'title': 'Total Leads', 'data': 'totalLeads' },
    { 'title': 'Total Amount', 'data': 'totalAmt' },
    { 'title': 'Start Date', 'data': 'createdAt' },
    { 'title': 'End Date', 'data': 'endDate' },
    { 'title': 'Actions', 'data': 'actions' },
  ];

  const apiUrl = 'campaign/campaignList';

  let payload = {};

  payload.url = 'campaign';
  payload.pageHeading = 'Campaigns';
  payload.totalCount = `Total Campaigns: ${campaign.count}`;
  payload.addUrl = 'campaign/addCampaign';
  payload.addButtonName = 'Add Campaign';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this campaign?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  payload.datatable = {
    url : 'campaign',
    filter: 'campaign',
    columns: AjaxColumns,
    apiUrl: apiUrl
  };

  const AjaxColumnsCompleted = [
    { 'title': 'Name', 'data': 'name' },
    { 'title': 'Total Leads', 'data': 'totalLeads' },
    { 'title': 'Total Amount', 'data': 'totalAmt' },
    { 'title': 'Start Date', 'data': 'createdAt' },
    { 'title': 'End Date', 'data': 'endDate' },
    { 'title': 'Actions', 'data': 'actions' },
  ];
  const apiUrlCompleted = 'campaign/campaignList';
  payload.completedDatatable = {
    url : 'campaign',
    filter: 'campaign',
    columns: AjaxColumnsCompleted,
    apiUrl: apiUrlCompleted
  };

  // res.render('admin/main_list', payload);
  res.render('admin/components/campaign/view_campaign_list', payload);

};

/*
# purpose: to send campaign data into datatables
*/
const campaignList = async (req, res) => {

  console.log('\n\nCampaign - CampaignList - BODY :-', req.body);

  const user = req.session.user;

  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let whereQuery = { status: "Active"};

  if (req.body.filterObjNew && req.body.filterObjNew.tableName == "Completed") {
    whereQuery = { status: {[Op.ne]:  "Active"} };
  }

  if (req.body.filterObj) {
    whereQuery.name = req.body.filterObj.searchValue ? { [Op.like]: `%${req.body.filterObj.searchValue}%` } : undefined;
    if (req.body.filterObj.from_date != undefined && req.body.filterObj.to_date != undefined) {

      var from_date = moment(req.body.filterObj.from_date, "DD/MM/YYYY")
      var to_date = moment(req.body.filterObj.to_date, "DD/MM/YYYY")
      console.log('\n\nTeams - campaignList - both :-', from_date);    

      whereQuery.createdAt = { [Op.and]: [{[Op.gte]: from_date}, { [Op.lte]: to_date } ]  }
    }
    else if (req.body.filterObj.from_date != undefined) {
      var from_date = moment(req.body.filterObj.from_date, "DD/MM/YYYY")
      console.log('\n\nTeams - campaignList - from_date :-', from_date);    

      whereQuery.createdAt = { [Op.gte]: from_date }
    }
    else if (req.body.filterObj.to_date != undefined) {
      var to_date = moment(req.body.filterObj.to_date, "DD/MM/YYYY")
      console.log('\n\nTeams - campaignList - to_date :-', to_date);    

      whereQuery.createdAt = { [Op.lte]: to_date }
    }
  }

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  const campaignMembers = await CampaignMembers.findAll({ where: { userId: user.id } });
  console.log('\n\nCampaign - CampaignList - campaignMembers :-', campaignMembers);

  let campaingIds = [];

  if (user.roleId == roles[TelecallerIndex].id) {

    whereQuery[Op.or] = [];

    campaignMembers.forEach(campaign => {
      whereQuery[Op.or].push({ id: campaign.dataValues.campaignId });
    })

  }

  console.log('\n\nCampaign - CampaignList - campaingIds :-', campaingIds);

  if (req.body.search.value != '') {
    whereQuery[Op.or] = [
      { name: { [Op.like]: `%${req.body.search.value}%` } }
    ]
  }

  console.log('\n\nCampaign - CampaignList - whereQuery :-', whereQuery);

  const campaigns = await Campaign.findAndCountAll({ where: whereQuery, limit: length, offset: start });

  console.log('\n\nCampaign - CampaignList - campaigns :-', campaigns);
  // campaigns.rows.forEach(campaign => {
  for (const campaign of campaigns.rows) {
    
    const leads = await Leads.findAndCountAll({ where: { campaignId: campaign.id }});
    campaign.dataValues.totalLeads = leads.count;    

    let totalAmt = leads.rows.reduce((acc, lead) => {      
      return acc + lead.dataValues.amountDue
    }, 0);
    console.log('\n\nCampaign - campaignlist totalAmt:-', totalAmt);

    campaign.dataValues.totalAmt = totalAmt;

    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions = `<a class='dt-action text-capitalize' href='campaign/view/${campaign.id}'><b>View</b></a>`;
    }
    if (req.permissionsList.includes('delete')) {
      actions = actions + `<a href="#confirmModal" class='modal-trigger dt-action text-capitalize pointer' onclick="action('campaign/delete', '', ${campaign.id})"><b>Delete</b></a>`;
    }
    campaign.dataValues.actions = actions;
    campaign.dataValues.createdAt = moment(campaign.dataValues.createdAt).format('YYYY-MM-DD');
  };

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: campaigns.rows,
    recordsFiltered: campaigns.count,
    recordsTotal: campaigns.count
  });

};

/*
# purpose: to Create campaign
*/
const createCampaign = async (req, res) => {

  console.log('createCampaign req.body ', req.body);
  console.log('createCampaign new Date(req.body.end_date) ', req.body.end_date, new Date(req.body.end_date));
  console.log('createCampaign new Date(req.body.end_date) ', moment(req.body.end_date, "DD/MM/YYYY"));

  const newCampaign = {
    name: req.body.name,
    description: req.body.description,
    status: 'Active',
    endDate: moment(req.body.end_date, "DD/MM/YYYY")
  };

  const campaignCreated = await Campaign.create(newCampaign);
  const id = campaignCreated.dataValues.id;

  // const payload = {};
  // payload.campaign = req.body;
  // res.redirect('/campaign');

  const user = req.session.user;
  const roles = await Roles.findAll();
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');

  const campaign = await Campaign.findOne({ where: { id } });
  const leads = await Leads.findAndCountAll({ where: { isDeleted: 0 } });
  const leadsOneData = await Leads.findOne({ where: { isDeleted: 0 } });
  let payload = {};

  campaign.dataValues.createdAt = moment(campaign.dataValues.createdAt).format('YYYY-MM-DD')

  campaign.dataValues.totalLeads = 0;
  campaign.dataValues.collectableAmt = 0;
  campaign.dataValues.collectedAmt = 0;

  payload.url = 'campaign';
  payload.permissionsList = req.permissionsList;
  payload.campaign = campaign.dataValues;
  payload.leads = leads.rows;
  payload.leadsData = leadsOneData;
  const apiUrlLeads = 'campaign/campaignLeads';
  const apiUrlTelecallers = 'campaign/campaignTelecallers';
  const apiUrlAddTelecallers = 'campaign/campaignAddTelecallers';

  // Leads
  const AjaxColumnsLeads = [
    { 'title': 'Customer Name', 'data': 'name' },
    { 'title': 'Loan Number', 'data': 'loanAccountNo' },
    { 'title': 'Loan Amount', 'data': 'amountDue' },
    { 'title': 'Phone', 'data': 'phone' },
    { 'title': 'Assigned To', 'data': 'telecallerName' },
    { 'title': 'Action', 'data': 'actions' }
  ];
  payload.filterCount = 50;
  payload.datatableLeads = {
    filter: 'campaign',
    id: req.params.id,
    columns: AjaxColumnsLeads,
    apiUrl: apiUrlLeads
  };

  // Telecallers
  const AjaxColumnsTelecallers = [
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Address', 'data': 'address' },
    { 'title': 'Location', 'data': 'location' },
    { 'title': 'Leads Allocated', 'data': 'leadsAllocated' },
    { 'title': 'Action', 'data': 'actions' }
  ];

  payload.datatableTelecallers = {
    filter: 'campaign',
    id: req.params.id,
    columns: AjaxColumnsTelecallers,
    apiUrl: apiUrlTelecallers
  };
  payload.displayTelecaller = true;
  if (user.roleId == roles[TelecallerIndex].id) {
    payload.displayTelecaller = false;
  }

  // Telecallers
  const AjaxColumnsAddTelecallers = [
    { 'title': '', 'data': 'checkbox' },
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Address', 'data': 'address' },
    { 'title': 'Location', 'data': 'location' },
  ];

  payload.datatableAddTelecallers = {
    id: req.params.id,
    columns: AjaxColumnsAddTelecallers,
    apiUrl: apiUrlAddTelecallers
  };

  const campaignTelecallers = await Campaign.findAll({ where: { id: id }, include: [{ model: Users, as: 'users', where: { isDeleted: 0 } }] });

  payload.campaignTelecallers = campaignTelecallers.length > 0 && campaignTelecallers[0].users ? campaignTelecallers[0].users : []
  payload.deleteText = '';

  payload.toast = true
  payload.toastColor = 'green'
  payload.toastText = 'Campaign created successfully'

  //team
  const teams = await Teams.findAll( { where: { isDeleted: 0 } });
  payload.teams = teams;

  res.render('admin/components/campaign/view_campaign', payload);

};

/*
# purpose: to view Campaign Details
*/
const viewCampaignDetails = async (req, res) => {

  const { id } = req.params;

  const user = req.session.user;
  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  const campaign = await Campaign.findOne({ where: { id } });
  const leads = await Leads.findAndCountAll({ where: { isDeleted: 0 } });
  const leadsOneData = await Leads.findOne({ where: { isDeleted: 0 } });
  let payload = {};

  campaign.dataValues.createdAt = moment(campaign.dataValues.createdAt).format('YYYY-MM-DD')
  console.log('campaign.dataValues.endDate *---', campaign.dataValues.endDate);
  campaign.dataValues.endDate = campaign.dataValues.endDate ? moment(campaign.dataValues.endDate).format('YYYY-MM-DD') : "NA"

  payload.url = 'campaign';
  payload.permissionsList = req.permissionsList;
  payload.campaign = campaign.dataValues;
  payload.leads = leads.rows;
  payload.leadsData = leadsOneData;
  const apiUrlLeads = 'campaign/campaignLeads';
  const apiUrlTelecallers = 'campaign/campaignTelecallers';
  const apiUrlAddTelecallers = 'campaign/campaignAddTelecallers';

  //get total leads count and total count
  const totalLeads = await Leads.findAndCountAll({ where: { campaignId: id }});
  campaign.dataValues.totalLeads = totalLeads.count;    

  let totalAmt = totalLeads.rows.reduce((acc, lead) => {
    return acc + lead.dataValues.amountDue
  }, 0);

  console.log('\n\nCampaign - viewCampaignDetails totalAmt:-', totalAmt);
  campaign.dataValues.totalAmt = totalAmt;

  let collectableAmt = leads.rows.filter((lead) => {
    return (lead.dataValues.collectionStatus == "Pending" || lead.dataValues.collectionStatus == null)
  }).reduce((acc, leadValue) => {
    return acc + leadValue.dataValues.amountDue
  }, 0)
  console.log('\n\nCampaign - viewCampaignDetails collectableAmt:-', collectableAmt);
  campaign.dataValues.collectableAmt = collectableAmt;

  let collectedAmt = leads.rows.filter((lead) => {
    return (lead.dataValues.collectionStatus == "Paid")
  }).reduce((acc, leadValue) => {
    return acc + leadValue.dataValues.amountDue
  }, 0)
  console.log('\n\nCampaign - viewCampaignDetails collectableAmt:-', collectedAmt);
  campaign.dataValues.collectedAmt = collectedAmt;

  //team
  const teams = await Teams.findAll( { where: { isDeleted: 0 } });
  payload.teams = teams;

  // Leads
  const AjaxColumnsLeads = [
    { 'title': 'Customer Name', 'data': 'name' },
    { 'title': 'Loan Number', 'data': 'loanAccountNo' },
    { 'title': 'Loan Amount', 'data': 'amountDue' },
    { 'title': 'Phone', 'data': 'phone' },
    { 'title': 'Assigned To', 'data': 'telecallerName' },
    { 'title': 'Action', 'data': 'actions' }
  ];
  payload.filterCount = 50;
  payload.datatableLeads = {
    url : 'campaignDetails',
    filter: 'campaign',
    id: req.params.id,
    columns: AjaxColumnsLeads,
    apiUrl: apiUrlLeads
  };

  // Telecallers
  const AjaxColumnsTelecallers = [
    { 'title': 'First Name', 'data': 'firstName' },
    { 'title': 'Last Name', 'data': 'lastName' },
    { 'title': 'Role', 'data': 'address' },
    { 'title': 'Team', 'data': 'address' },
    // { 'title': 'Address', 'data': 'address' },
    // { 'title': 'Location', 'data': 'location' },
    { 'title': 'Leads Allocated', 'data': 'leadsAllocated' },
    { 'title': 'Action', 'data': 'actions' }
  ];

  payload.datatableTelecallers = {
    url : 'campaignDetails',
    filter: 'campaign',
    id: req.params.id,
    columns: AjaxColumnsTelecallers,
    apiUrl: apiUrlTelecallers
  };
  payload.displayTelecaller = true;
  if (user.roleId == roles[TelecallerIndex].id) {
    payload.displayTelecaller = false;
  }

  // Telecallers
  const AjaxColumnsAddTelecallers = [
    // { 'title': '', 'data': 'checkbox' },
    { 'title': 'First Name', 'data': 'user.firstName' },
    { 'title': 'Last Name', 'data': 'user.lastName' },
    { 'title': 'Address', 'data': 'user.address' },
    { 'title': 'Location', 'data': 'user.location' },
  ];

  payload.datatableAddTelecallers = {
    url : 'campaignDetails',
    id: req.params.id,
    columns: AjaxColumnsAddTelecallers,
    apiUrl: apiUrlAddTelecallers
  };

  const campaignTelecallers = await Campaign.findAll({ where: { id: id }, include: [{ model: Users, as: 'users', where: { isDeleted: 0 } }] });

  console.log('\n\n\n\nCcampaignTelecallers', campaignTelecallers);

  payload.campaignTelecallers = campaignTelecallers.length > 0 && campaignTelecallers[0].users ? campaignTelecallers[0].users : []
  payload.deleteText = '';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''

  res.render('admin/components/campaign/view_campaign', payload);
};

/*
# purpose: to edit Campaign Details
*/
const editCampaignDetails = async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findOne({ where: { id } });

  const payload = {};
  payload.campaign = campaign.dataValues;

  res.render('admin/components/edit_campaign', payload);
};

/*
# purpose: to update Campaign Details
*/
const updateCampaignDetails = async (req, res) => {
  console.log('\n\nUpdateUserDetails :-', req.body);
  const { id } = req.params;
  await Campaign.update(req.body, {
    where: { id },
  }).then((num) => {
    if (num == 1) {
      res.redirect('/campaign');
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

/*
# purpose: to delete Campaign
*/
const deleteCampaign = async (req, res) => {

  console.log('\n\nTeams - testApi - BODY :-', req.body);

  const { teamId, userId } = req.body;

  await Campaign.destroy({ where: { id: teamId } })

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: req.body
  });

};

/*
# purpose: to campaign Leads
*/
const campaignLeads = async (req, res) => {
  console.log('\n\nCampaigns - CampaignList req.body :-', req.body);
  const user = req.session.user;

  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObjLeads;
  const campaignId = req.body.id;
  console.log('\n\nCampaigns - CampaignList - ID :-', campaignId);
  let whereQuery = {};

  whereQuery.isDeleted = 0;
  whereQuery.campaignId = campaignId;

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  if (user.roleId == roles[TelecallerIndex].id) {
    whereQuery.telecallerAssigned = user.id;
  }

  if (req.body.search.value != '') {
    whereQuery[Op.or] = [
      { name: { [Op.like]: `%${req.body.search.value}%` } },
      { loanAccountNo: { [Op.like]: `%${req.body.search.value}%` } },
      { phone: { [Op.like]: `%${req.body.search.value}%` } },
    ]
  }

  if (filterData && filterData.serailIdFrom != '' && filterData.serailIdTo == '') {
    whereQuery.srNo = { [Op.gte]: filterData.serailIdFrom };
  }
  if (filterData && filterData.serailIdFrom == '' && filterData.serailIdTo != '') {
    whereQuery.srNo = { [Op.lte]: filterData.serailIdTo };
  }
  if (filterData && filterData.serailIdFrom != '' && filterData.serailIdTo != '') {
    whereQuery.srNo = { [Op.between]: [filterData.serailIdFrom, filterData.serailIdTo] }
  }
  if (filterData && filterData.loanType != '') {
    whereQuery.productType = filterData.loanType;
  }
  if (filterData && filterData.amountMore != '' && filterData.amountLess == '') {
    whereQuery.amountDue = { [Op.gte]: filterData.amountMore };
  }
  if (filterData && filterData.amountLess != '' && filterData.amountMore == '') {
    whereQuery.amountDue = { [Op.lte]: filterData.amountLess };
  }
  if (filterData && filterData.amountMore != '' && filterData.amountLess != '') {
    whereQuery.amountDue = { [Op.between]: [filterData.amountMore, filterData.amountLess] }
  }
  if (filterData && filterData.amountOutstanding != '') {
    whereQuery.amountOutstanding = { [Op.gte]: filterData.amountOutstanding };
  }
  if (filterData && filterData.daysDue != '') {
    whereQuery.daysDue = { [Op.gte]: filterData.daysDue };
  }
  if (filterData && filterData.callStatus != '') {
    whereQuery.callStatus = filterData.callStatus;
  }
  if (filterData && filterData.closeStatus != '') {
    whereQuery.closeStatus = filterData.closeStatus;
  }
  if (filterData && filterData.collectionStatus != '') {
    whereQuery.collectionStatus = filterData.collectionStatus;
  }
  if (filterData && filterData.telecallerAssigned != '') {
    whereQuery.telecallerAssigned = filterData.telecallerAssigned;
  }
  if (filterData && filterData.FOSAssigned != '') {
    whereQuery.FOSAssigned = filterData.FOSAssigned;
  }

  console.log('\n\nCampaigns - CampaignList - whereQuery :-', whereQuery);

  const leads = await Leads.findAndCountAll({ where: whereQuery, limit: length, offset: start, include: [{ model: Users, as: 'telecaller' }] });
  // const leads = await Leads.findAndCountAll({ where: whereQuery, limit: length, offset: start, include: [{ model: Users, as: 'telecaller', where: { isDeleted: 0 } }] });

  console.log('\n\nCampaign - Leads - Include :-', JSON.parse(JSON.stringify(leads, null, 2)));

  leads.rows.forEach((lead) => {
    let actions = '';

    if (lead.dataValues.telecaller && user.roleId != roles[TelecallerIndex].id) {
      lead.dataValues.telecallerName = `${lead.dataValues.telecaller.firstName} ${lead.dataValues.telecaller.lastName}`
      actions = `<a class="modal-trigger" href="#reassignModal" onclick="reassignLead('${lead.dataValues.telecallerName}', '${lead.loanAccountNo}')"><b>Reassign</b></a>`;
    }
    else {
      lead.dataValues.telecallerName = ''
      if (user.roleId != roles[TelecallerIndex].id) {
        actions += `<a class="modal-trigger" href="#assignModal" onclick="assignLead('${lead.loanAccountNo}')"><b>Assign</b></a>`;
      }
    }
    actions += `<a class='dt-action' href="/leads/newLeads/view/${lead.loanAccountNo}" style="padding:7px;"><b>View</b></a>`;
    lead.dataValues.actions = actions;

  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: leads.rows,
    recordsFiltered: leads.count,
    recordsTotal: leads.count
  });

}

/*
# purpose: to campaign Telecallers
*/
const campaignTelecallers = async (req, res) => {
  console.log('\n\campaignTelecallers - req.body :-', req.body);

  let campaignId = req.body.id;

  const campaignDetails = await Campaign.findOne({ where: { id: campaignId }, raw: true });
  console.log('\n\nCampaign - campaignId :-', campaignId);

  let telecallerListArray = [];
  let leadAssign = 'false';

  const leads = await Leads.findAll({ where: { campaignId: campaignId } });
  console.log('\n\nCampaign -Length :-', leads.length);

  if (leads.length > 0) {
    leadAssign = 'true';
  }
  else {
    leadAssign = 'false';
  }

  var whereQuery = {}

  if (req.body.search.value != '') {
    whereQuery[Op.or] = [
      { name: { [Op.like]: `%${req.body.search.value}%` } }
    ]
  }

  const campaignMembers = await CampaignMembers.findAll({ where: { campaignId: campaignId }, raw: true });

  await Promise.all(campaignMembers.map(async (eachMember) => {

    const telecaller = await Users.findOne({ where: { id: eachMember.userId, isDeleted: 0 }, raw: true });

    if (telecaller) {

      const allocatedLeadsCount = await Leads.count({ where: { telecallerAssigned: eachMember.userId }, distinct: true })

      let actions = '';

      if (allocatedLeadsCount > 0) {
        actions = `<a style="color: gray;">Remove</a style="color: gray;">`;
      }
      else {
        actions += `<a class="modal-trigger" href="#removeTelecallerModal" onclick="removeFromCampaign('${telecaller.id}', '${campaignDetails.name}')">Remove</a>`;
      }

      telecallerListArray.push({
        firstName: telecaller.firstName,
        lastName: telecaller.lastName,
        address: telecaller.address,
        location: telecaller.location,
        leadAssigned: leadAssign,
        leadsAllocated: allocatedLeadsCount,
        actions: actions
      });
    }

  }));

  const languages = await Language.findAll({});
  console.log('\n\nTeams - viewTeamDetails - languages :-', languages);

  console.log('\n\nCampaignMembers telecallerListArray', telecallerListArray);

  return res.status(200).json({
    title: 'Success',
    error: false,
    languages: languages,
    data: telecallerListArray,
    recordsFiltered: campaignMembers.length,
    recordsTotal: campaignMembers.length
  });

}

/*
# purpose: to campaign Add Telecallers
*/
const campaignAddTelecallers = async (req, res) => {
  console.log('\n campaignAddTelecallers - req.body :-', req.body);

  let campaignId = req.body.id;

  console.log('\n\nCampaign - campaignId :-', campaignId);
  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = {};

  const roles = await Roles.findAll();
  const AdminIndex = roles.findIndex((e) => e.name === 'Admin');
  const LeaderIndex = roles.findIndex((e) => e.name === 'Leader');
  const TelecallerIndex = roles.findIndex((e) => e.name === 'Telecaller');
  const FOSIndex = roles.findIndex((e) => e.name === 'FOS');

  if (req.body.search.value != '') {
    searchQuery = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${req.body.search.value}%` } },
        { lastName: { [Op.like]: `%${req.body.search.value}%` } },
        { address: { [Op.like]: `%${req.body.search.value}%` } }
      ]
    }
  }

  const role = await Roles.findOne({ where: { name: "telecaller" } });
  console.log('\n\nCampaign - Roles - BODY :-', role);

  // const telecallers = await db.sequelize.query(`SELECT * FROM users U WHERE (U.firstName LIKE '%${req.body.search.value}%' AND U.roleId != '${roles[AdminIndex].id}' AND U.roleId != '${roles[LeaderIndex].id}' AND U.roleId != '${roles[FOSIndex].id}' AND U.isDeleted != 1 AND U.id NOT IN (SELECT userId FROM campaignMembers CM WHERE CM.campaignId="${campaignId}")) LIMIT ${length} OFFSET ${start}`, { type: Sequelize.QueryTypes.SELECT });
  // console.log('\n\nCampaign - telecallersList :-', telecallers);

  /*
  telecallers.forEach(telecaller => {
    console.log('\n\nCampaign - telecallerList :-', telecaller);
    telecaller.checkbox = `<label><input type='checkbox' id="myCheck" name="telecallerId[]" value='${telecaller.id}' onchange="checkboxFunc('${telecaller.firstName}', '${telecaller.id}')"/><span></span></label>`
  });*/
  
  const { filterTeam } = req.body;

  var telecallers = []
  if (filterTeam != undefined && filterTeam != "") {
    telecallers = await TeamMember.findAll({ where: { teamId: filterTeam }, include: [{ model: Users, as: 'user' }] });
  }  

  console.log('telecallers ---', telecallers);
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: telecallers,
    recordsFiltered: telecallers.length,
    recordsTotal: telecallers.length
  });
}

const addToTelecallerOld = async (req, res) => {

  console.log('\n\nADD TO TELECALLERS', req.body);

  const { campaignId, userId } = req.body;
  const newCampaignMembers = {
    campaignId,
    userId
  };
  const campaignMembers = await CampaignMembers.create(newCampaignMembers);

  console.log('\n\nCampaign - createCampaign - campaign :-', campaignMembers);

  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose: to add To Telecaller
*/
const addToTelecaller = async (req, res) => {

  console.log('\n\nADD TO TELECALLERS', req.body);

  const { teamId, campaignId } = req.body;

  const members = await TeamMember.findAll({ where: { teamId: teamId }, include: [{ model: Users, as: 'user' }] });

  for (const member of members) {
    const newCampaignMembers = {
      campaignId: campaignId,
      userId: member.userId
    };
    const campaignMembers = await CampaignMembers.create(newCampaignMembers);

    console.log('\n\nCampaign - createCampaign - campaign :-', campaignMembers);
  }
  
  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose: to view Campaign Details Leads
*/
const viewCampaignDetailsLeads = async (req, res) => {
  const { loanAccountNo } = req.params;

  const leads = await Leads.findOne({ where: { loanAccountNo } });

  const payload = {};
  payload.leads = leads.dataValues;

  res.render('admin/components/campaign/view_campaign_details_leads.ejs', payload);
};

/*
# purpose: to allocateTelecaller
*/
const allocateTelecaller = async (req, res) => {

  console.log('\n\nCampaigns - allocateTelecaller - body :-', req.body);

  const filterData = req.body.filterObjLeads;
  const telecallerId = req.body.telecallerId;
  const campaignId = req.body.campaignId;

  console.log('\n\nCampaigns - allocateTelecaller - filterData :-', filterData);

  let whereQuery = {};

  whereQuery.isDeleted = 0;
  whereQuery.campaignId = campaignId;

  if (filterData && filterData.loanType && filterData.loanType != '') {
    whereQuery.productType = filterData.loanType;
  }
  if (filterData && filterData.amountMore && filterData.amountMore != '' && filterData.amountLess == '') {
    whereQuery.amountDue = { [Op.gte]: filterData.amountMore };
  }
  if (filterData && filterData.amountLess && filterData.amountLess != '' && filterData.amountMore == '') {
    whereQuery.amountDue = { [Op.lte]: filterData.amountLess };
  }
  if (filterData && filterData.amountMore && filterData.amountMore != '' && filterData.amountLess != '') {
    whereQuery.amountDue = { [Op.between]: [filterData.amountMore, filterData.amountLess] }
  }
  if (filterData && filterData.amountOutstanding && filterData.amountOutstanding != '') {
    whereQuery.amountOutstanding = { [Op.gte]: filterData.amountOutstanding };
  }
  if (filterData && filterData.daysDue && filterData.daysDue != '') {
    whereQuery.daysDue = { [Op.gte]: filterData.daysDue };
  }
  if (filterData && filterData.callStatus && filterData.callStatus != '') {
    whereQuery.callStatus = filterData.callStatus;
  }
  if (filterData && filterData.closeStatus && filterData.closeStatus != '') {
    whereQuery.closeStatus = filterData.closeStatus;
  }
  if (filterData && filterData.collectionStatus && filterData.collectionStatus != '') {
    whereQuery.collectionStatus = filterData.collectionStatus;
  }
  if (filterData && filterData.telecallerAssigned && filterData.telecallerAssigned != '') {
    whereQuery.telecallerAssigned = filterData.telecallerAssigned;
  }
  if (filterData && filterData.FOSAssigned && filterData.FOSAssigned != '') {
    whereQuery.FOSAssigned = filterData.FOSAssigned;
  }

  console.log('\n\nCampaigns - CampaignList - whereQuery :-', whereQuery);

  const updateLeads = await Leads.update({ telecallerAssigned: telecallerId }, { where: whereQuery });

  console.log('\n\nCampaigns - CampaignList - updateLeads :-', updateLeads);

  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose: to closeCampaign
*/
const closeCampaign = async (req, res) => {

  await Campaign.update({ status: 'Closed' }, { where: { id: req.body.campaignId } });

  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose: to addToAnotherCampaign
*/
const addToAnotherCampaign = async (req, res) => {

  console.log('\n\nCampaigns - addToAnotherCampaign - body :-', req.body);

  const userId = req.body.userId;
  const chipsData = req.body.chipsData;

  chipsData.forEach(async (chip) => {

    const campaign = await Campaign.findOne({ where: { name: chip.tag }, raw: true });

    const newCampaignMembers = {
      campaignId: campaign.id,
      userId
    };

    const campaignMembers = await CampaignMembers.create(newCampaignMembers);
    console.log('\n\nCampaign - createCampaign - campaign :-', campaignMembers);

  })

  return res.status(200).json({
    title: 'Success',
    error: false,
  });

};

/*
# purpose: to removeFromCampaign
*/
const removeFromCampaign = async (req, res) => {

  console.log('\n\nCampaigns - removeFromCampaign - body :-', req.body);

  const userId = req.body.userId;
  const campaignName = req.body.campaignName;

  const campaign = await Campaign.findOne({ where: { name: campaignName }, raw: true });
  const leads = await Leads.findAll({ where: { campaignId: campaign.id, telecallerAssigned: userId }, raw: true });

  if (leads.length == 0) {
    Users.findByPk(userId).then(async (user) => {
      if (!user) {
        return null;
      }
      Campaign.findByPk(campaign.id).then(async (campaign) => {
        if (!campaign) {
          return null;
        }

        await user.removeCampaign(campaign);

        return res.status(200).json({
          title: 'Success',
          error: false,
          message: 'User removed from Campaign successfully'
        });

      });
    }).catch((err) => {
      console.log('\n\nError while REMOVING Campaign to User: ', err);
    });
  }
  else {
    return res.status(200).json({
      title: 'Failure',
      error: false,
      message: 'Cannot remove user while leads are assigned'
    });

  }
};

/*
# purpose: to reassignLead
*/
const reassignLead = async (req, res) => {

  console.log('\n\nCampaigns - reassignLead - body :-', req.body);

  const newTelecaller = req.body.newTelecaller;
  const leadLoanAccountNo = req.body.leadLoanAccountNo;


  Leads.findOne({ where: { loanAccountNo: leadLoanAccountNo } }).then(async (lead) => {
    if (lead) {

      console.log('\n\nCampaigns - reassignLead - lead :-', lead);

      lead.update({ telecallerAssigned: newTelecaller }).then(async () => {

        return res.status(200).json({
          title: 'Success',
          error: false,
        });

      })

    }
    else {
      return res.status(400).json({
        title: 'Failure',
        error: false,
      });
    }
  })

};


module.exports = {
  list,
  campaignList,
  createCampaign,
  viewCampaignDetails,
  editCampaignDetails,
  updateCampaignDetails,
  deleteCampaign,
  campaignLeads,
  campaignTelecallers,
  campaignAddTelecallers,
  viewCampaignDetailsLeads,
  addToTelecaller,
  allocateTelecaller,
  closeCampaign,
  addToAnotherCampaign,
  removeFromCampaign,
  reassignLead
};
