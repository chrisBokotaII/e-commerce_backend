import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { OrdersConsumer } from './queue.consumer';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'orders' }), MailModule],
  controllers: [],
  providers: [QueueService, OrdersConsumer],
  exports: [QueueService],
})
export class QueueModule {}
