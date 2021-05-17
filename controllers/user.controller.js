import {response} from 'express';
import bcryptjs from 'bcryptjs';
import Users from '../models/User.model.js';
import _ from 'lodash';

//get one uses
const userGetOne = async (req, res = response) => {   
    try {
        const { id } = req.params;        
    
        // const user = await Users.findOne({_id: id, isActive: true});
        const user = await Users.findById(id);

        res.status(200)
        .json({
            ok: true,
            message:`Success`,
            moreInfo: '',
            body: {
                data: 
                    user                
            }
        });    
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(400)
            .json({
                ok: true,
                message: error.message,
                moreInfo: error.name,
                body: {                    
                    data: error.errors
                }
            });          
    }
};

//get all users with pagination
const userGet = async (req, res = response) => {   
    try {
        //object destructuration
        const {
            limit = 5,
            from = 0
        } = req.query;

        const query = { isActive: true};                

        //array destructuration
        const [total, users] = await Promise.all([
            Users.count(query),
            Users.find(query)
                .skip(Number(from))
                .limit(Number(limit))
            ]);        

        res.status(200)
        .json({
            ok: true,
            message:`Success`,
            moreInfo: '',
            body: {
                data: {
                    total,
                    users
                }
            }
        });    
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(400)
            .json({
                ok: true,
                message: error.message,
                moreInfo: error.name,
                body: {                    
                    data: error.errors
                }
            });          
    }
};

//create a new user
const userPost = async (req, res = response) => {    
    try {
        const { firstName, lastName, email, password, role } = req.body;
        const user = new Users({firstName, lastName, email, password, role});        

        //encript pass
        const salt = bcryptjs.genSaltSync();
        user.password = bcryptjs.hashSync(password, salt);

        await user.save();        

        res.status(200)
            .json({
                ok: true,
                message:`POST API Controller: user`,
                moreInfo: 'success',
                body: {
                    data: user
                }
        });        
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(400)
            .json({
                ok: true,
                message: error.message,
                moreInfo: error.name,
                body: {                    
                    data: error.errors
                }
            });  
        
    }    
};

//update a user
const userPatch = async (req, res = response) => {
    try {
        const { id } = req.params;     

        const { _id, password, ...data } = req.body;            

        if (password){            
            const salt = bcryptjs.genSaltSync();
            data.password = bcryptjs.hashSync(password, salt);
        }

        const user = await Users.findByIdAndUpdate(id, data, {returnOriginal:false});                
        
        res.status(200)
        .json({
            ok: true,
            message:`Success`,
            moreInfo: !_.isUndefined(data.isGoogle)? '\'Google tag\' field is readonly, won\'t be changed':'',
            body: {
                data: user
            }
        });    
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(400)
            .json({
                ok: true,
                message: error.message,
                moreInfo: error.name,
                body: {                    
                    data: error.errors
                }
            });      
    }
};

//Delete a user
const userDelete = async (req, res = response) => {
    try {
        const { id } = req.params;  

        const user = await Users.findByIdAndUpdate(id, {isActive: false}, {returnOriginal:false});  

        res.status(200)
        .json({
            ok: true,
            message:`Success`,  
            moreInfo: 'Object won\'t be deleted permanently, just disabled',      
            body: {
                data :{
                    user
                }        
            }        
        });      
    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(400)
            .json({
                ok: true,
                message: error.message,
                moreInfo: error.name,
                body: {                    
                    data: error.errors
                }
            }); 
    }      
};

export{
    userGet,
    userGetOne,
    userPost,    
    userPatch,
    userDelete
}