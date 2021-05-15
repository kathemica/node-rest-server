import {response} from 'express'

const userGet = (req, res = response) => {   
    const {id= 0, 
           value = 'no value'} = req.query;

    res.status(200)
    .json({
        ok: true,
        message:`GET API Controller: user`,
        body: {id, value}
    });    
};

const userPost = (req, res = response) => {    
    const {name, lastName, age} = req.body;

    res.status(200)
        .json({
            ok: true,
            message:`POST API Controller: user`,
            body: {
                name,
                lastName,
                age
            }
    });    
};

const userPut = (req, res = response) => {
    const id = req.params.id;
    
    res.status(200)
    .json({
        ok: true,
        message:`PUT API Controller: user`,
        body: {
            id
        }
    });    
};

const userPatch = (req, res = response) => {
    const id = req.params.id;
    const {name, lastName, age} = req.body;

    res.status(200)
    .json({
        ok: true,
        message:`PATCH API Controller: user`,        
        body: {
            name,
            lastName,
            age
        }
    });    
};

export{
    userGet,
    userPost,
    userPut,
    userPatch
}