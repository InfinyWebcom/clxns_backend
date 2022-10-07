/*
# purpose: Home Page
*/
const home = (req, res) => {
  res.render('home', { title: 'Clxns 1.0.0' });
};

/*
# purpose: privacy_policy Page
*/
const privacy_policy = (req, res) => {
  res.render('privacy_policy', { title: 'Clxns' });
};

/*
# purpose: terms_of_use Page
*/
const terms_of_use = (req, res) => {
  res.render('terms_of_use', { title: 'Clxns' });
};

const contactus = (req, res) => {
  res.status(200).json({
    title: 'success',
    error: true,
  });
};

module.exports = {
  home,
  contactus,
  privacy_policy,
  terms_of_use,
};
