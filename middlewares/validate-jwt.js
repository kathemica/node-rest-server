import {request, response} from 'express';
import jwt from 'jsonwebtoken';

import { SECRETJWT } from '../config/config.js';
import responseObjectBuilder from '../helpers/functions.helper.js';
import Users from '../models/User.model.js';

const validateJWT = async (req = request, res = response, next) =>{
    const token = req.header('x-auth-token');
    
    if (!token){
        return responseObjectBuilder(res, 401, true, 'Failure', 'Security token is required', null)
    }
    try {
        const { uuid } = jwt.verify(token, SECRETJWT);          

        const user = await Users.findOne({_id: uuid, isActive: true});           

        if (!user ){
            return responseObjectBuilder(res, 401, true, 'Failure', 'A valid user is required to perform this action', null)
        }

        req.user = user;

        next ();    
    } catch (error) {
        return responseObjectBuilder(res, 401, true, 'Failure', 'Invalid token', null)
    }
}

export default validateJWT;