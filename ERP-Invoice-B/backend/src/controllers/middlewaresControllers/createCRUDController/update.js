const update = async (Model, req, res) => {
  // Find document by id and updates with the required fields
  req.body.removed = false;

  const query = {
    _id: req.params.id,
    removed: false,
  };
  
  // If the model has a createdBy field, restrict it to the current admin
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const result = await Model.findOneAndUpdate(
    query,
    req.body,
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document ',
    });
  }
};

module.exports = update;
