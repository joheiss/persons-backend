import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  Request,
  RequestStatus,
  RequestCommand,
} from '../entities/request.entity';
import { Person } from '../entities/person.entity';

@Injectable()
export class RequestProcessorService {
  private readonly logger = new Logger(RequestProcessorService.name);

  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  @Cron('*/2 * * * * *') // Every 2 seconds
  async handleRequestProcessing() {
    this.logger.debug('Starting request processing job');

    try {
      // (2) Query all entries from "requests" with status = OPEN
      const openRequests = await this.requestRepository.find({
        where: { status: RequestStatus.OPEN },
      });

      if (openRequests.length === 0) {
        this.logger.debug('No OPEN requests found');
        return;
      }

      this.logger.log(
        `Found ${openRequests.length} OPEN request(s) to process`,
      );

      // (3) Loop over all found entries
      for (const request of openRequests) {
        try {
          // (3a) Update the status of current entry to IN_PROGRESS, changedAt set to current system time
          request.status = RequestStatus.IN_PROGRESS;
          request.changedAt = new Date();
          await this.requestRepository.save(request);

          this.logger.log(
            `Processing request ${request.requestId} with command ${request.command}`,
          );

          // (3b) Process entry
          await this.processRequest(request);

          // If no error occurs, update table "requests" for current entry with status = COMPLETED
          request.status = RequestStatus.COMPLETED;
          request.changedAt = new Date();
          await this.requestRepository.save(request);

          this.logger.log(
            `Request ${request.requestId} completed successfully`,
          );
        } catch (error) {
          // If an error occurs, update table "requests" for current entry with status = FAILED
          this.logger.error(
            `Error processing request ${request.requestId}: ${error.message}`,
            error.stack,
          );
          request.status = RequestStatus.FAILED;
          request.changedAt = new Date();
          await this.requestRepository.save(request);
        }
      }

      this.logger.debug('Request processing job completed');
    } catch (error) {
      this.logger.error(
        `Error in request processing job: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processRequest(request: Request): Promise<void> {
    const { command, payload } = request;

    switch (command) {
      case RequestCommand.ADD_PERSON:
        await this.processAddPerson(payload);
        break;

      case RequestCommand.CHANGE_PERSON:
        await this.processChangePerson(payload);
        break;

      case RequestCommand.DELETE_PERSON:
        await this.processDeletePerson(payload);
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private async processAddPerson(payload: any): Promise<void> {
    const person = this.personRepository.create({
      name: payload.name,
      dateOfBirth: payload.dateOfBirth,
      score: payload.score,
      salary: payload.salary,
      active: payload.active !== undefined ? payload.active : true,
      comment: payload.comment || null,
    });

    await this.personRepository.save(person);
    this.logger.log(`Person created with UUID: ${person.uuid}`);
  }

  private async processChangePerson(payload: any): Promise<void> {
    const { id, ...updateData } = payload;

    if (!id) {
      throw new Error('Person ID is required for CHANGE_PERSON command');
    }

    const person = await this.personRepository.findOne({
      where: { uuid: id },
    });

    if (!person) {
      throw new Error(`Person with ID ${id} not found`);
    }

    // Update only provided fields
    if (updateData.name !== undefined) {
      person.name = updateData.name;
    }
    if (updateData.salary !== undefined) {
      person.salary = updateData.salary;
    }
    if (updateData.comment !== undefined) {
      person.comment = updateData.comment;
    }

    await this.personRepository.save(person);
    this.logger.log(`Person ${id} updated successfully`);
  }

  private async processDeletePerson(payload: any): Promise<void> {
    const personId = typeof payload === 'string' ? payload : payload.id;

    if (!personId) {
      throw new Error('Person ID is required for DELETE_PERSON command');
    }

    const person = await this.personRepository.findOne({
      where: { uuid: personId },
    });

    if (!person) {
      throw new Error(`Person with ID ${personId} not found`);
    }

    await this.personRepository.remove(person);
    this.logger.log(`Person ${personId} deleted successfully`);
  }
}
