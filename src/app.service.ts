import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const greeting = "Hello world!!"
    return greeting;
  }
}
