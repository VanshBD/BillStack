const filter = async (Model, req, res) => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }
  
  const query = {
    removed: false,
  };
  
  // If the model has a createdBy field, restrict it to the current admin
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const result = await Model.find(query)
    .where(req.query.filter)
    .equals(req.query.equal)
    .exec();
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
      message: 'Successfully found all documents  ',
    });
  }
};

module.exports = filter;
