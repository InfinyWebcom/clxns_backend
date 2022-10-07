/* eslint-disable linebreak-style */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
var flash = require('connect-flash');
const bodyParser = require('body-parser');
const v8 = require('v8');

dotenv.config();
const helmet = require('helmet');
const cors = require('cors');
const adminRouter = require('./routes/admin');
const indexRouter = require('./routes/index');
const dashboardRouter = require('./routes/dashboard');
const enquriesRouter = require('./routes/enquiries');
const userRouter = require('./routes/user');
const teamsRouter = require('./routes/team');
const campaignRouter = require('./routes/campaign');
const leadsRouter = require('./routes/leads');
const sourcingRouter = require('./routes/sourcing');
const permissionsRouter = require('./routes/permissions');
const customerRouter = require('./routes/customer');
const reportsRouter = require('./routes/report');
const fisRouter = require('./routes/fis');
const locationRouter = require('./routes/location');
const pincodeRouter = require('./routes/pincode');
const auditRouter = require('./routes/auditTrail');
const fosRouter = require('./routes/fos');
const dispositionRouter = require('./routes/dispositions');
const subDisRouter = require('./routes/sub_dispositions');

const app = express();
const db = require('./models');
const modules = db.modules;
const scriptIndex = require('./sqlscripts/index');
db.sequelize.sync();
// global.__basedir = __dirname;
app.use(express.static(path.join(__dirname, 'uploads')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json({ limit: '500mb', extended: true }));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: 'clxns@2021',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 * 3600000 },
}));
app.use(fileUpload());

app.use('/uploads', express.static(`${__dirname}/uploads`));

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  session.cookie.secure = true; // serve secure cookies
}
app.use(flash());
// Default paramets that has to be sent in every request
app.use((req, res, next) => {
  res.locals.query = req.query;
  res.locals.url = req.originalUrl;
  res.locals.baseUrl = process.env.baseUrl;
  res.locals.user = req.session.user;
  console.log("userName ! ",  res.locals.user)
  res.locals.permissions=  req.session.permissions ? req.session.permissions : [];
  console.log("permissions ", res.locals.permissions);
  res.locals.roleName = req.session.roleName ? req.session.roleName : req.session.roleNameFi;
  console.log("roleName ", res.locals.roleName);
  res.locals.FiName = (res.locals.roleName=='FiName') ?  req.session.FiName : '';
  // res.locals.message =  req.flash('success', 'Registration successfully');
  console.log("message ", res.locals.message);
  next();
});




app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/dashboard', dashboardRouter);
app.use('/enquiries', enquriesRouter);
app.use('/user', userRouter);
app.use('/team', teamsRouter);
app.use('/campaign', campaignRouter);
app.use('/leads', leadsRouter);
app.use('/sourcing', sourcingRouter);
app.use('/permissions', permissionsRouter);
app.use('/customer', customerRouter);
app.use('/reports', reportsRouter);
app.use('/masterData/fis', fisRouter);
app.use('/fis', fisRouter);
app.use('/masterData/locations', locationRouter);
app.use('/masterData/pincodes', pincodeRouter);
app.use('/audit', auditRouter);
app.use('/fos', fosRouter);
app.use('/masterData/dispositions', dispositionRouter);
app.use('/subDispositions', subDisRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  if (app.get('env') === 'development') {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    // eslint-disable-next-line no-console
    console.log(err);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  } else {
    res.render('404');
  }
});

const addModules = () => {
  modules.findAll({}).then(data => {
    if (data.length == 0 || data == null || !data) {
      scriptIndex.addModules();
    }
  })
}
addModules();

console.log('-=-=-=-=-a',v8.getHeapStatistics().total_available_size)

module.exports = app;
