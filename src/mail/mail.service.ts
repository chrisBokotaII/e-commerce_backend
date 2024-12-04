import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async create(createMailDto: CreateMailDto) {
    return await this.mailService.sendMail({
      from: process.env.EMAIL_USER,
      to: createMailDto.to,
      subject: createMailDto.subject,
      text: createMailDto.text,
    });
  }
  async orderDelivery(data: {
    oderId: string;
    userEmail: string;
    message: string;
  }) {
    return await this.mailService.sendMail({
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: `Order of id ${data.oderId} Delivery Notification `,
      text: data.message,
    });
  }
}
