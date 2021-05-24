import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import responseObjectBuilder from '../helpers/functions.helper.js';

const fieldValidation = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const message = error.errors
      .map((value) => {
        return value.msg;
      })
      .join(', ');

    const locations = Array.from(new Set(error.errors.map((item) => item.location)));

    const params = error.errors
      .map((value) => {
        return value.param;
      })
      .join(', ');

    const values = error.errors
      .map((value) => {
        return value.value;
      })
      .join(', ');

    return responseObjectBuilder(
      res,
      httpStatus.BAD_REQUEST,
      `Error`,
      message,
      `There's an error at [${locations}], which means that [${params}] could have invalid content: [${values}] `
    );
  }

  next();
};

export default fieldValidation;
