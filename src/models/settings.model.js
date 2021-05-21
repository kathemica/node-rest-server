import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const SettingsSchema = Schema ({
  languaje: {
      type: String,
      required: [true, 'Languaje is mandatory']
  }
});

export default model( 'Settings', SettingsSchema);
