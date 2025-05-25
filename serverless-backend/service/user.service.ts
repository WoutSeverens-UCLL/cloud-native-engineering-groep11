import { CustomError } from "../model/custom-error";
import { User } from "../model/user";
import { CosmosUserRepository } from "../repository/cosmos-user-repository";
import type { AuthenticationResponse } from "../types";
import generateSWToken from "../util/jwt";
const bcrypt = require("bcryptjs");

export class UserService {
  private static instance: UserService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserService();
    }
    return this.instance;
  }

  private async getRepo() {
    return CosmosUserRepository.getInstance();
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

  async authenticate({    
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<AuthenticationResponse> {
    if (!email || !password) {
      throw CustomError.invalid("Email or password is invalid");
    }
    const foundUser = await (await this.getRepo()).getUser(email);
    if (!foundUser) {
      throw CustomError.invalid("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw CustomError.invalid("Invalid credentials");
    }

    const jwt = generateSWToken({ email, role: foundUser.getRole() });
    const authresponse = {
      message: "Login successful",
      token: jwt,
      email: foundUser.email,
      role: foundUser.getRole(),
    }
    return authresponse;
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
