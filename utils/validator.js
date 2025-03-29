const Joi = require('joi');

module.exports = {
  validateSignalData: (data) => {
    const schema = Joi.object({
      to: Joi.string().required(),
      signal: Joi.object().required(),
      timestamp: Joi.number().optional()
    });
    return schema.validate(data);
  },

  validateAuthData: (data) => {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
    });
    return schema.validate(data);
  }
};