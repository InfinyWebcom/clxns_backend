// NODE MODULES & DATABASE
const leadsSource = require('./sourcing');
const db = require('../models');

const { Op } = db.Sequelize;
const leadsCustomer = db.customer;
const customerHistory = db.customerHistory;
const customerAddress = db.customerAddress;
const customerContact = db.customerContact;

/*
# purpose: list customers
*/
const list = async (req, res) => {

  const Customer = await leadsCustomer.findAndCountAll({ where: { isDeleted: 0 } });

  const AjaxColumns = [
    { 'title': 'Name', 'data': 'name' },
    { 'title': 'Phone', 'data': 'contactNo' },
    // { 'title': 'address', 'data': 'address' },
    { 'title': 'Rating', 'data': 'rating' },
    { 'title': 'Actions', 'data': 'actions' },
  ];

  const apiUrl = 'customer/customerlist';

  let payload = {};

  payload.url = 'customer';
  payload.pageHeading = 'Customer Management';
  payload.totalCount = `Total Customer: ${Customer.count}`;
  payload.addUrl = 'customer/addCustomer';
  payload.permissionsList = req.permissionsList;
  payload.deleteText = 'Are you sure you want to delete this customer?';

  payload.toast = false
  payload.toastColor = 'green'
  payload.toastText = ''
  
  payload.datatable = {
    filter: 'customer',
    columns: AjaxColumns,
    apiUrl: apiUrl
  };

  res.render('admin/main_list', payload);

};

/*
# purpose: to send customers data into datatables
*/
const customerlist = async (req, res) => {

  let length = req.body.length ? parseInt(req.body.length) : 5;
  let start = req.body.start ? parseInt(req.body.start) : 0;
  let searchQuery = null;

  if (req.body.search.value != '') {
    searchQuery = { [Op.or]: [{ name: { [Op.like]: `%${req.body.search.value}%` } }] }
  }

  const customers = await leadsCustomer.findAndCountAll({ where: searchQuery, limit: length, offset: start });
  customers.rows.forEach(customer => {
    // console.log('\n\nCustomer - CustomerList - forEach :-', customer);

    let actions = '';
    if (req.permissionsList.includes('view')) {
      actions = actions +`<a class='dt-action text-capitalize' href='customer/view/${customer.id}'><b>Details</b></a>`;
    }
    customer.dataValues.actions = actions;
  });

  return res.status(200).json({
    title: 'Success',
    error: false,
    data: customers.rows,
    recordsFiltered: customers.count,
    recordsTotal: customers.count
  });

};

/*
# purpose: add Customer
*/
const addCustomer = async (req, res) => {

  const payload = {};

  res.render('admin/components/customer/add_customer', payload);
};

/*
# purpose: create Customer
*/
const createCustomer = async (customerData) => {
  // console.log('\n\nCustomer Data :-', customerData);
  const newCustomer = {
    name: customerData.name,
    email:customerData.email,
    contactNo:customerData.primaryPhone,
    address: customerData.primaryAddress,
    rating: 0,
  };
 
  const customerCheckOne = await leadsCustomer.findOne({ where: { contactNo : newCustomer.contactNo} });
 
  if(customerCheckOne==null){
    const Customer = await leadsCustomer.create(newCustomer);
  
  }

  const custCheck= await leadsCustomer.findOne({ where: { contactNo : newCustomer.contactNo} });

  const custHistoryCheck= await customerHistory.findOne({ where: { loanNumber : customerData.loanAccountNo} });
 
  if(custCheck!=null && custHistoryCheck==null){
      //Create Customer History
    const newCustomerHistory = {
      customerId: custCheck.id,
      fiName: customerData.bankName,
      loanAmount:customerData.amountDue == '' ? 0 : customerData.amountDue,
      loanNumber:customerData.loanAccountNo,
      status:customerData.status,
      recoveryLevel:1
    };

    const CustomerHistory = await customerHistory.create(newCustomerHistory);
    
  }

  //Create Customer Address
  const Cust_Id=custCheck.id;
    
    const customerCheckTwo = await leadsCustomer.findOne({ where: { address:newCustomer.address,id:Cust_Id} });
    const custAddressCheckOne= await customerAddress.findOne({ where: { address : customerData.primaryAddress,customerId: Cust_Id} });
    const custAddressCheckTwo= await customerAddress.findOne({ where: { address : customerData.secondaryAddress,customerId: Cust_Id} });
    
    // console.log('\n\n RES BODY  : custAddressCheckTwo:-', custAddressCheckTwo);
    if(custAddressCheckOne==null){
      const newCustomerAdressOne = {
        customerId: custCheck.id,
        address: customerData.primaryAddress,
        addressType:'primary',
        note:'Father'
      };
    const CustomerAddress = await customerAddress.create(newCustomerAdressOne);
   
  }

  if(!custAddressCheckTwo && custAddressCheckTwo==null){
    const newCustomerAdressTwo = {
      customerId: custCheck.id,
      address: customerData.secondaryAddress,
      addressType:'secondary',
      note:'Father'
    };
  const CustomerAddress = await customerAddress.create(newCustomerAdressTwo);
 
  };

  const custContactCheck= await customerContact.findOne({ where: { contactNo : customerData.primaryPhone , customerId: custCheck.id} });
  if (customerCheckOne==null && custContactCheck==null){
    const newCustomerContact = {
      customerId: custCheck.id,
      contactNo: customerData.secondaryPhone,
      note:'Father'
    };
    const CustomerContact = await customerContact.create(newCustomerContact);
   
  }
};

/*
# purpose: view Customer Details
*/
const viewCustomerDetails = async (req, res) => {

  const { id } = req.params;
  // console.log('\n\nCustomer Id :-', id);
  const customers = await leadsCustomer.findOne({ where: { id } });
  const CustomerAddress = await customerAddress.findAndCountAll({ where: { customerId:id } });
  const CustomerContact = await customerContact.findAndCountAll({ where: { customerId:id } });
  let payload = {};
  payload.url = 'customer';
  payload.permissionsList = req.permissionsList;
  payload.customers = customers.dataValues;
  payload.CustomerAddress = CustomerAddress.rows;
  payload.CustomerContact = CustomerContact.rows;
  const apiUrlCustomer = 'customer/customerHistory';
 
  // Leads
  const AjaxColumnsCustomerHistory = [
    { 'title': 'Bank Name', 'data': 'fiName' },
    { 'title': 'Loan Amount', 'data': 'loanAmount' },
    { 'title': 'Loan Number', 'data': 'loanNumber' },
    { 'title': 'Status', 'data': 'status' },
    { 'title': 'Recovery Level', 'data': 'recoveryLevel' },
    // { 'title': 'Action', 'data': 'actions' }
  ];
  payload.filterCount=50;
  payload.deleteText = 'Are you sure you want to delete this customer?';
  payload.datatable= {
    url : 'customerHistory',
    id: req.params.id,
    columns: AjaxColumnsCustomerHistory,
    apiUrl: apiUrlCustomer
  };
  res.render('admin/components/customer/view_customer_details', payload);
};

/*
# purpose: customer History Data
*/
const customerHistoryData = async (req, res) => {
  const customerId=req.body.id;
  const length = req.body.length ? parseInt(req.body.length) : 5;
  const start = req.body.start ? parseInt(req.body.start) : 0;
  const filterData = req.body.filterObjLeads;
  
  let whereQuery = {};

  // whereQuery.isDeleted = 0;
   whereQuery.customerId =  customerId;
  if (req.body.search.value != '') {
    whereQuery[Op.or] = [
      { fiName: { [Op.like]: `%${req.body.search.value}%` } },
      { loanNumber: { [Op.like]: `%${req.body.search.value}%` } },
    ]
  }

  // console.log('\n\nCustomerHistory - whereQuery :-', whereQuery);


  const CustomerHistory = await customerHistory.findAndCountAll({ where: whereQuery, limit: length, offset: start });
  // console.log('\n\nCustomerHistory - Filter - Count :-', CustomerHistory.count);
  return res.status(200).json({
    title: 'Success',
    error: false,
    data: CustomerHistory.rows,
    recordsFiltered: CustomerHistory.count,
    recordsTotal: CustomerHistory.count
  });
}

module.exports = {
  list,
  customerlist,
  addCustomer,
  createCustomer,
  viewCustomerDetails,
  customerHistoryData
}