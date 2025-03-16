import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PersonalInfo } from '../models/interfaces/personal.interface';
import { PersonalService } from "../services/personal.service"

@Controller('personal')//prefix เส้น api 
export class PersonalController {
    constructor(private personalService: PersonalService) {}
    
    // method ต่างๆ
    @Get()
    async findAll(): Promise<PersonalInfo[]> {
      return await this.personalService.findAllPosts();
    }
}
