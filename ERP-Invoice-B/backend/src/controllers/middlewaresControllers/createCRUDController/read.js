const read = async (Model, req, res) => {
  const query = {
    _id: req.params.id,
    removed: false,
  };

  // If the model has a createdBy field, restrict it to the current admin
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  // Find document by id
  const result = await Model.findOne(query).exec();
  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success resposne
    return res.status(200).json({
      success: true,
      result,
      message: 'we found this document ',
    });
  }
};

module.exports = read;
