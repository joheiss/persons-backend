import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async findOne(id: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { requestId: id },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async findAll(): Promise<Request[]> {
    const requests = await this.requestRepository.find({
      order: {
        changedAt: 'DESC',
      },
    });

    if (requests.length === 0) {
      throw new NotFoundException('No requests found');
    }

    return requests;
  }
}
