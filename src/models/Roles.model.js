import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const RoleSchema = Schema({
  role: {
    type: String,
    required: [true, 'Name is mandatory'],
  },
});

const Roles = model('Roles', RoleSchema);

// eslint-disable-next-line import/prefer-default-export
export { Roles };
