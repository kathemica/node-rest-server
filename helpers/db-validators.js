import Roles from '../models/Roles.model.js';
import Users from '../models/User.model.js';

//check rol
const isValidRol = async (role = '') => {
    const isValidRole = await Roles.findOne({role});
    if (!isValidRole){
        throw new Error(`Role ${role} is invalid`);
    }
};

//check email 
const isEmailUnique = async (email= '') => {
    const exists= await Users.findOne({email});
    if (exists) {
        throw new Error(`Email ${email} exists in db`);
    } 
};

//check valid id 
const existsID = async (id= '') => {
    const exists= await Users.findById(id);
    if (!exists) {
        throw new Error(`User with ID ${id} doesn't exists in db`);
    }
};


export{
    isValidRol,
    isEmailUnique,
    existsID
}