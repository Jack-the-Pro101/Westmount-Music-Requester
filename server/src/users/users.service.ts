import { Injectable } from "@nestjs/common";
import mongoose from "mongoose";

import Users, { User } from "src/models/User";

import * as bcrypt from "bcrypt";
import { StoredUser, WithId } from "../types";
import { ulid } from "ulid";

@Injectable()
export class UsersService {
  async updateUser(filter: mongoose.FilterQuery<User>, data: Partial<User>) {
    const existingUser = await Users.findOne(filter);
    if (!existingUser) return {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // @ts-expect-error
        if (data[key] == null) delete data[key];
        // @ts-expect-error
        if (data[key] === existingUser[key]) delete data[key];
      }
    }

    if (!data.password) {
      delete data.password;
    } else {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return await Users.findOneAndUpdate(filter, data, {
      new: true,
    });
  }

  async findOne(usernameOrEmail: string, internal = false): Promise<WithId<StoredUser> | undefined> {
    try {
      return (
        (await Users.findOne(internal ? { username: usernameOrEmail } : { email: usernameOrEmail }))?.toObject() ??
        undefined
      );
    } catch (err) {
      console.error(err);
    }
  }

  async getUsers(limit = 100, page = 0) {
    try {
      return await Users.find({})
        .skip(page * limit)
        .limit(limit);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async searchUsers(query: mongoose.FilterQuery<User>, limit = 100, page = 0) {
    try {
      return await Users.find(query)
        .skip(page * limit)
        .limit(limit);
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async create(data: Partial<User>) {
    try {
      return await Users.create(data);
    } catch (err) {
      console.error(err);
    }
  }

  async createOrUpdateOne(user: StoredUser): Promise<WithId<StoredUser> | undefined> {
    try {
      if (user.type === "GOOGLE") {
        const dbUser: WithId<StoredUser> | undefined = (await Users.findOne({ email: user.email })) ?? undefined;
        if (!dbUser) return (await Users.create({ ...user, _id: ulid() })).toObject() as WithId<StoredUser>;
        // TODO: What if Google user's email changes?
        // TODO: What if user's OAuth session is invalidated?
        return (
          (
            await Users.findOneAndUpdate({ _id: dbUser._id }, { avatar: user.avatar, name: user.name }, { new: true })
          )?.toObject() ?? undefined
        );
      } else {
        const dbUser = await Users.findOne({ username: user.username });
        if (!dbUser) return (await Users.create({ ...user, _id: ulid() })).toObject() as WithId<StoredUser>;
        return dbUser.toObject() as WithId<StoredUser>;
      }
    } catch (err) {
      console.error(err);
    }
  }
}
