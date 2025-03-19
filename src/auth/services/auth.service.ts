import { Injectable,Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import  {UsersService}  from "../services/users.service"

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) // ✅ Ensure UsersService is injected
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
// Debugging log
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password === password) { // ⚠️ Use hashed passwords in production
      return { id: user.id, username: user.username };
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username },
    };
  }
}