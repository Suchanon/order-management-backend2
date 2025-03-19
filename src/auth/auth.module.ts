import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from "./services/users.service"
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    forwardRef(() => UsersModule), // ✅ Import UsersModule to access UsersService
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ✅ Load secret from .env
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService], 
  exports: [AuthService], // ✅ Export AuthService if needed elsewhere
})
export class AuthModule {}