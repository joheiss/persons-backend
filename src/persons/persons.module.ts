import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { Person } from '../entities/person.entity';
import { Request } from '../entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Request])],
  controllers: [PersonsController],
  providers: [PersonsService],
})
export class PersonsModule {}
