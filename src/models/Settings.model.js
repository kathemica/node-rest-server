import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SettingsSchema = Schema({
  language: {
    type: String,
    required: [true, 'Language is mandatory'],
  },
});

const Settings = model('Settings', SettingsSchema);

// eslint-disable-next-line import/prefer-default-export
export { Settings };
