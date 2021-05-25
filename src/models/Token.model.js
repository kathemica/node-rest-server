import mongoose from 'mongoose';
import timeZone from 'mongoose-timezone';
import { toJSON } from './plugins/toJSON.plugin.js';
import { tokenTypes } from '../config/index.js';

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      type: Number,
      default: Date.now,
      createdAt: true,
      updatedAt: true,
    },
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);
tokenSchema.plugin(timeZone, { paths: ['timestamps'] });
tokenSchema.index({ token: 1, fingerprint: 1 }, { unique: true });

/**
 * @typedef Token
 */
const Token = mongoose.model('Token', tokenSchema);

// eslint-disable-next-line import/prefer-default-export
export { Token };
