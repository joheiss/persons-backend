import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() createPersonDto: CreatePersonDto) {
    const requestId = await this.personsService.createPerson(createPersonDto);
    return { requestId };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const person = await this.personsService.findOne(id);
    return {
      uuid: person.uuid,
      name: person.name,
      dateOfBirth: person.dateOfBirth,
      score: person.score,
      salary: person.salary,
      active: person.active,
      comment: person.comment,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    const requestId = await this.personsService.updatePerson(id, updatePersonDto);
    return { requestId };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(@Param('id') id: string) {
    const requestId = await this.personsService.deletePerson(id);
    return { requestId };
  }

  @Get()
  async findAll() {
    const persons = await this.personsService.findAll();
    return persons.map((person) => ({
      uuid: person.uuid,
      name: person.name,
      dateOfBirth: person.dateOfBirth,
      score: person.score,
      salary: person.salary,
      active: person.active,
      comment: person.comment,
    }));
  }
}
