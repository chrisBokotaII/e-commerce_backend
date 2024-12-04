import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from 'src/mail/mail.service';

@Processor('orders')
export class OrdersConsumer extends WorkerHost<any> {
  constructor(private readonly emailService: MailService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(job.data);
    if (job.data && job.data.userId) {
      await this.emailService.orderDelivery(job.data);
    }

    return {};
  }
}
