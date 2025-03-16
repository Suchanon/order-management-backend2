import { Module } from '@nestjs/common';
import { PersonalService } from './services/personal.service';
import { PersonalController } from './controllers/personal.controller';

//--
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalInfoEntity } from "../personal/models/personal.entity"

@Module({
  imports: [TypeOrmModule.forFeature([PersonalInfoEntity])],
  providers: [PersonalService],
  controllers: [PersonalController]
})
export class PersonalModule { }
