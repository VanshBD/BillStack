const summary = async (Model, req, res) => {
  const baseQuery = { removed: false };
  if (Model.schema.paths.createdBy && req.admin && req.admin._id) {
    baseQuery.createdBy = req.admin._id;
  }

  const countPromise = Model.countDocuments(baseQuery);

  const filterQuery = { ...baseQuery };
  if (req.query.filter && req.query.equal !== undefined) {
    filterQuery[req.query.filter] = req.query.equal;
  }
  const resultsPromise = Model.countDocuments(filterQuery).exec();
  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs.length > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
