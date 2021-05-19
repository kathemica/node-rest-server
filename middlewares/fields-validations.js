import { validationResult } from "express-validator";

const fieldValidation = (req, res, next) => {
   const error =  validationResult(req);
   if (!error.isEmpty()){
      return res.status(400)
      .json({
          ok: true,
          message:`Error`,
          moreInfo: '',
          body: {
              data: error
          }
      });
   };

   next();
};

export default fieldValidation;
