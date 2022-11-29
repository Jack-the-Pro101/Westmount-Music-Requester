import { Injectable } from "@nestjs/common";
import mongoose from "mongoose";

import Users from "src/models/User";

@Injectable()
export class UsersService {
  async findOne(usernameOrEmail: string, internal = false): Promise<any> {
    // TODO: convert to Users mongoose schema
    try {
      return await Users.findOne(internal ? { username: usernameOrEmail } : { email: usernameOrEmail });
    } catch (err) {
      console.error(err);
    }
  }

  async getOrCreateOne(usernameOrEmail: string, internal = false, data: any): Promise<any> {
    try {
      const user = await Users.findOne(internal ? { username: usernameOrEmail } : { email: usernameOrEmail });
      if (user == null) return await Users.create(data);
      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
