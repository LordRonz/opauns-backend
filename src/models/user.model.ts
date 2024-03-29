/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcryptjs';
import mongoose, { FilterQuery, Model, model, Schema } from 'mongoose';

import { roles } from '../config/roles';
import UserInterface from '../interfaces/user.interface';
import { paginate, toJSON } from './plugins';
import { QueryOption } from './plugins/paginate.plugin';

export interface UserMethods {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface UserModel extends Model<UserInterface, unknown, UserMethods> {
  isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean>;
  paginate: (
    filter: FilterQuery<unknown>,
    options: QueryOption
  ) => Promise<void>;
  toJSON: (schema: Schema) => void;
}

const userSchema = new Schema<UserInterface, UserModel, UserMethods>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      // validate(value: string) {
      //   if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      //     throw new Error(
      //       'Password must contain at least one letter and one number'
      //     );
      //   }
      // },
      private: true, // used by the toJSON plugin
    },
    corrected: {
      type: Boolean,
      required: true,
      default: false,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    school: {
      type: String,
      enum: ['SMA', 'SMK'],
      required: true,
    },
    score_1: {
      type: Number,
      required: true,
      default: 0,
    },
    score_2: {
      type: Number,
      required: true,
      default: 0,
    },
    answers: {
      type: [Schema.Types.Mixed],
    },
    finished: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON as (schema: Schema) => void);
userSchema.plugin(paginate);

userSchema.statics.isUsernameTaken = async function (
  username: string,
  excludeUserId?: string
) {
  const user = await this.findOne({
    username,
    _id: mongoose.trusted({ $ne: excludeUserId }),
  });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.pre(
  'insertMany',
  async function (
    next: mongoose.CallbackWithoutResultAndOptionalError,
    docs: Array<
      mongoose.Document<unknown, any, UserInterface> &
        UserInterface & {
          _id: mongoose.Types.ObjectId;
        } & UserMethods
    >
  ) {
    const users = docs;
    if (Array.isArray(users) && users.length) {
      const hashedUsers = await Promise.all(
        users.map(async (user) => {
          user.password = await bcrypt.hash(user.password, 8);
          return user;
        })
      );
      docs = hashedUsers;
      next();
    } else {
      return next(new Error('User list should not be empty')); // lookup early return pattern
    }
  }
);

export const User = model<UserInterface, UserModel>('User', userSchema);

export default User;
