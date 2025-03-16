import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const greeting = "Hello world!!"
    console.log(greeting)
    return greeting;
  }
}
