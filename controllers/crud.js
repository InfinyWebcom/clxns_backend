/* eslint-disable linebreak-style */
module.exports = (modelObj) => {
  // Create and Save a new Contact
  const create = (req, res) => {
    // Save Contact in the database
    modelObj.create(req.body)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Contact.',
        });
      });
  };

  // Retrieve all newcontact from the database.
  const findAll = (req, res) => {
    const condition = req.query.condition ? req.query.condition : null;
    modelObj.findAll({ where: condition })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while retrieving Contacts.',
        });
      });
  };

  // Find a single Contact with an id
  const findOne = (req, res) => {
    const { id } = req.params;

    modelObj.findByPk(id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          error: err,
          message: `Error retrieving Contact with id=${id}`,
        });
      });
  };

  // Update object
  const update = (req, res) => {
    const { id } = req.params;

    modelObj.update(req.body, { where: { id }, }).then((num) => {
      if (num === 1) {
        res.send({
          message: 'Contact was updated successfully.',
        });
      } else {
        res.send({
          message: `Cannot update Contact with id=${id}. Maybe Contact was not found or req.body is empty!`,
        });
      }
    })
      .catch((err) => {
        res.status(500).send({
          error: err,
          message: `Error updating Contact with id=${id}`,
        });
      });
  };
//deleteOne
  const deleteOne = (req, res) => {
    const { id } = req.params;

    modelObj.destroy({
      where: { id },
    })
      .then((num) => {
        if (num === 1) {
          res.send({
            message: 'Contact was deleted successfully!',
          });
        } else {
          res.send({
            message: `Cannot delete Contact with id=${id}. Maybe Contact was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          error: err,
          message: `Could not delete Contact with id=${id}`,
        });
      });
  };

  return {
    create, findAll, findOne, update, deleteOne,
  };
};
