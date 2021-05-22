import {request, response} from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import ApiError from '../helpers/ApiError.js';
import { jwt_config } from '../config/config.app.js';

const validateJWT = async (token = '') =>{
    try {                
        if (!token){            
            throw new ApiError(httpStatus.PRECONDITION_FAILED, 'Security token is required');            
        }

        // invalid token - synchronous
        try {        
            const { uuid } = jwt.verify(token, jwt_config.secret);                                            
    
            return uuid; 
        } catch(err) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Error on Security Token');  
        }
    } catch (error) {             
        throw new ApiError(error.statusCode, error.message);        
    }
}

export default validateJWT;