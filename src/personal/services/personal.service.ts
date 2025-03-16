import { Injectable } from '@nestjs/common';
//--
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PersonalInfoEntity } from '../models/personal.entity';
import { PersonalInfo } from "../models/interfaces/personal.interface"


@Injectable()
export class PersonalService {
    constructor(
        @InjectRepository(PersonalInfoEntity)
        private readonly personalInfoRepository: Repository<PersonalInfoEntity>,
    ) { }

    // support เส้น get
    async findAllPosts(): Promise<PersonalInfo[]> {
       
        const data = await this.personalInfoRepository.find();
        console.log("Caaling get", data)
        return data
    }

}