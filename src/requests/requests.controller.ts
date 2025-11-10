import { Controller, Get, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const request = await this.requestsService.findOne(id);
    return {
      status: request.status,
    };
  }

  @Get()
  async findAll() {
    const requests = await this.requestsService.findAll();
    return requests.map((request) => ({
      requestId: request.requestId,
      changedAt: request.changedAt,
      status: request.status,
      command: request.command,
      payload: request.payload,
    }));
  }
}
