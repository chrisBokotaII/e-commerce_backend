import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthsController } from './auths.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constant';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' },
    }),
    MailModule,
  ],
  controllers: [UsersController, AuthsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
