import Joi from 'joi';
import httpStatus from 'http-status';
import pick from '../helpers/pick.js';
import ApiError from '../helpers/ApiError.js';

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' } })
      .validate(object);
  
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };
  
  export default validate;