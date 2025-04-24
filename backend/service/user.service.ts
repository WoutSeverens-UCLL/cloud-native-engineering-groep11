import { CustomError } from "../model/custom-error";
import { User } from "../model/user";
import { MongoUserRepository } from "../repository/mongo-user-repository";
import bcrypt from "bcrypt";

export class UserService {
  private static instance: UserService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserService();
    }
    return this.instance;
  }

  private async getRepo() {
    return MongoUserRepository.getInstance();
  }

  async createUser(user: User) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const createdUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    });

    return (await this.getRepo()).createUser(createdUser);
  }

  async getAllUsers() {
    return (await this.getRepo()).getAllUsers();
  }

  async getUser(email: string) {
    if (!email) {
      throw CustomError.invalid("Email is invalid");
    }
    return (await this.getRepo()).getUser(email);
  }

  async deleteUser(email: string) {
    if (!email) {
      throw CustomError.invalid("Email is invalid");
    }
    return (await this.getRepo()).deleteUser(email);
  }
}
