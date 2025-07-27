const validate = (requestType) => {
  return (req, res, next) => {
    const { error } = requestType.validate({...req.body, ...req.params});
    if (error) {
      return res.status(400).json({
        status: 'ERR',
        message: error.details[0]?.message,
      });
    }
    next();
  };
};

module.exports = validate
