const listAll = async (Model, req, res) => {
  const sort = req.query.sort || 'desc';
  const enabled = req.query.enabled || undefined;

  //  Query the database for a list of all results

  const query = {
    removed: false,
  };
  
  if (enabled !== undefined) {
    query.enabled = enabled;
  }

  // If the model has a createdBy field, restrict it to the current admin
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    query.createdBy = req.admin._id;
  }

  const result = await Model.find(query)
    .sort({ created: sort })
    .populate()
    .exec();

  if (result.length > 0) {
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
