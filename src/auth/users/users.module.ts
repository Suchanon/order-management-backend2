import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthModule } from '../auth.module';


@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [UsersService], 
    exports: [UsersService],   
  })
  export class UsersModule {}