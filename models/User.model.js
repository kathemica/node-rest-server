import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = Schema ({
  firstName: {
      type: String,
      required: [true, 'Name is mandatory']
  },
  lastName: {
    type: String,
    required: [true, 'lastName is mandatory']
  },
  email: {
    type: String,
    required: [true, 'Email is mandatory']
  },
  password: {
    type: String,
    required: [true, 'Pasdword is mandatory']
  },
  image: {
    type: String
  },
  role: {
    type: String,
    required: true,
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
  }
});

//adjustment for response object
//must be used function due "this" have to be used
UserSchema.methods.toJSON = function(){
  //extract _v and password for response
  const { __v, password, ...userObject} = this.toObject();

  //getting filtered object
  return userObject;
}

export default model( 'Users', UserSchema);
