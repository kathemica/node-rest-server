import mongoose from 'mongoose';
const { Schema, model } = mongoose;

import validator from 'validator';

const UserSchema = Schema ({
  firstName: {
      type: String,
      required: [true, 'Name is mandatory']
  },
  lastName: {
    type: String,
    required: [true, 'lastName is mandatory']
  },
  age:{
    type: Number,
    validate(value){
      if (value < 0){
        throw new Error('Age mus be a positive number')
      }
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'Email is mandatory'],
    validate(value){
      if (!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    }    
  },
  password: {
    type: String,
    required: [true, 'Pasdword is mandatory'],
    validate(value){
      if (!validator.isStrongPassword(value, {
        minLength: 8, 
        minLowercase: 1, 
        minUppercase: 1,
        minNumbers: 1, 
        minSymbols: 1
      })){
        throw new Error('Password is weak')
      }
    }
  },
  image: {
    type: String
  },
  role: {
    type: String,
    required: true,
    default: 'USER_ROLE',
    enum: ['ADMIN_ROLE', 'USER_ROLE']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isGoogle: {
    type: Boolean,
    default: false,
    immutable: true
  },
  token: {
    type: String,    
    trim: true,   
    default: null
  }
});

//adjustment for response object
//must be used function due "this" have to be used for return data
UserSchema.methods.toJSON = function(){
  //extract _v and password for response
  const { __v, password, _id, ...userObject} = this.toObject();

  userObject.uuid= _id;
  //getting filtered object
  return userObject;
}

export default model( 'Users', UserSchema);
