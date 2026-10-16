import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoBusinessService } from '../domain/demo-business.service';
@Module({ controllers: [DemoController], providers: [DemoBusinessService] })
export class AppModule { }
