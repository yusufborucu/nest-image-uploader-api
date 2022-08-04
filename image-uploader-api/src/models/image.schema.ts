import * as mongoose from "mongoose";

export const ImageSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  link: String,
  note: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ImageSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.owner.password;
    return ret;
  }
});