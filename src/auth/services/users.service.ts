import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  username: string;
  password: string; 
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: Number(process.env.JWT_ID), username: String(process.env.JWT_USERNAME) , password: String( process.env.JWT_PASSWORD) }, // ⚠️ Replace with hashed password in production
  ];

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
}
