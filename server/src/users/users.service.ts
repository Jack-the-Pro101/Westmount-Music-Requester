import { Injectable } from "@nestjs/common";
import mongoose from "mongoose";

import Users, { User } from "src/models/User";

import * as bcrypt from "bcrypt";

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

  async findOne(usernameOrEmail: string, internal = false): Promise<User | undefined> {
    try {
      return (await Users.findOne(internal ? { username: usernameOrEmail } : { email: usernameOrEmail })) ?? undefined;
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
    }
  }

  async searchUsers(query: mongoose.FilterQuery<User>, limit = 100, page = 0) {
    try {
      return await Users.find(query)
        .skip(page * limit)
        .limit(limit);
    } catch (err) {
      console.error(err);
    }
  }

  async create(data: Partial<User>) {
    try {
      return await Users.create(data);
    } catch (err) {
      console.error(err);
    }
  }

  async getOrCreateOne(usernameOrEmail: string, internal = false, data: Partial<User>): Promise<User | undefined | null> {
    try {
      const user = await Users.findOne(internal ? { username: usernameOrEmail } : { email: usernameOrEmail });
      if (user == null) return await Users.create(data);

      if ((!internal && user.name === "default") || !user.avatar)
        return await Users.findOneAndUpdate({ email: usernameOrEmail }, data, {
          new: true,
        });

      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
