import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SettingsSchema = Schema({
  languaje: {
    type: String,
    required: [true, 'Languaje is mandatory'],
  },
});

const Settings = model('Settings', SettingsSchema);

// eslint-disable-next-line import/prefer-default-export
export { Settings };
