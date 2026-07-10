const remove = async (Model, req, res) => {
  // Find the document by id and delete it
  let updates = {
    removed: true,
  };

  const query = {
    _id: req.params.id,
  };
  
  // If the model has a createdBy field, restrict it to the current admin
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  // Find the document by id and delete it
  const result = await Model.findOneAndUpdate(
    query,
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();
  // If no results found, return document not found
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
      message: 'Successfully Deleted the document ',
    });
  }
};

module.exports = remove;
