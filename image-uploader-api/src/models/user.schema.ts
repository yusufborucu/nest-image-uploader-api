import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";

export const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  resetHash: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hash(this['password'], 10);
    this['password'] = hashed;
    return next();
  } catch (err) {
    next(err);
  }
});

UserSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.password;
    return ret;
  }
});