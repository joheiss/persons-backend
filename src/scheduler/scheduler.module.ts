import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestProcessorService } from './request-processor.service';
import { Request } from '../entities/request.entity';
import { Person } from '../entities/person.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Request, Person]),
  ],
  providers: [RequestProcessorService],
})
export class SchedulerModule {}
