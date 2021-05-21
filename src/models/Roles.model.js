import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const RoleSchema = Schema ({
  role: {
      type: String,
      required: [true, 'Name is mandatory']
  }
});

export default model( 'Roles', RoleSchema);
