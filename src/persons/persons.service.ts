import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { Request, RequestCommand, RequestStatus } from '../entities/request.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async createPerson(createPersonDto: CreatePersonDto): Promise<string> {
    const requestId = uuidv4();
    const payload = {
      ...createPersonDto,
      active: createPersonDto.active !== undefined ? createPersonDto.active : true,
    };

    const request = this.requestRepository.create({
      requestId,
      changedAt: new Date(),
      status: RequestStatus.OPEN,
      command: RequestCommand.ADD_PERSON,
      payload,
    });

    await this.requestRepository.save(request);
    return requestId;
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { uuid: id },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return person;
  }

  async updatePerson(id: string, updatePersonDto: UpdatePersonDto): Promise<string> {
    // Check if person exists
    const person = await this.personRepository.findOne({
      where: { uuid: id },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    const requestId = uuidv4();
    const payload = {
      id,
      ...updatePersonDto,
    };

    const request = this.requestRepository.create({
      requestId,
      changedAt: new Date(),
      status: RequestStatus.OPEN,
      command: RequestCommand.CHANGE_PERSON,
      payload,
    });

    await this.requestRepository.save(request);
    return requestId;
  }

  async deletePerson(id: string): Promise<string> {
    const person = await this.personRepository.findOne({
      where: { uuid: id },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    if (person.active !== false) {
      throw new BadRequestException('Active person cannot be deleted');
    }

    const requestId = uuidv4();
    const request = this.requestRepository.create({
      requestId,
      changedAt: new Date(),
      status: RequestStatus.OPEN,
      command: RequestCommand.DELETE_PERSON,
      payload: id,
    });

    await this.requestRepository.save(request);
    return requestId;
  }

  async findAll(): Promise<Person[]> {
    const persons = await this.personRepository.find({
      order: {
        name: 'ASC',
      },
    });

    if (persons.length === 0) {
      throw new NotFoundException('No persons found');
    }

    return persons;
  }
}
