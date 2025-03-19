import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from '../auth/services/users.service';
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [forwardRef(() => AuthModule)], // ✅ Handle circular dependency
    providers: [UsersService],  // ✅ Register UsersService
    exports: [UsersService],    // ✅ Export UsersService so AuthModule can use it
  })
  export class UsersModule {}