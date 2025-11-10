import { Column, Entity, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum RequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RequestCommand {
  ADD_PERSON = 'ADD_PERSON',
  CHANGE_PERSON = 'CHANGE_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
}

@Entity('requests')
export class Request {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  requestId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.OPEN })
  status: RequestStatus;

  @Column({ type: 'enum', enum: RequestCommand })
  command: RequestCommand;

  @Column({ type: 'json' })
  payload: any;

  @BeforeInsert()
  generateRequestId() {
    if (!this.requestId) {
      this.requestId = uuidv4();
    }
  }
}
