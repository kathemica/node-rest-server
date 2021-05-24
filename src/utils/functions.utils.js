import { response } from 'express';

const responseObjectBuilder = (
  res = response,
  code = 501,
  output = 'Not defined',
  message = '',
  details = '',
  body = {}
) => {
  return res.status(code).json({
    header: {
      code,
      output,
      message,
      details,
    },
    body,
  });
};

// eslint-disable-next-line import/prefer-default-export
export { responseObjectBuilder };
