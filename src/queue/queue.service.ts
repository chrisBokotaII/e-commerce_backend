import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('orders') private odersQueue: Queue) {}
  async addToQueue(data: any) {
    const job = await this.odersQueue.add('create', data);
    return job;
  }
}
