import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//--
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order-management/orders.module';
import { AuthModule} from "./auth/auth.module"
import { UsersModule} from "./auth/users/users.module"


@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true ,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(<string>process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
