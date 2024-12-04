/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { encrypt } from './helpers/encrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly mailerService: MailService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    createUserDto.password = encrypt.haspassword(createUserDto.password);
    const user = this.userRepository.create(createUserDto);

    await this.userRepository.save(user);
    const playload = {
      sub: user.id,
      role: user.role,
    };
    const token = this.jwtService.sign(playload);
    const { password, ...userWithoutPassword } = user;
    const mail = await this.mailerService.create({
      to: user.email,
      subject: 'Welcome to our platform',
      text: `Welcome ${user.name} to our platform. Your account has been created successfully`,
    });
    console.log(mail);
    return {
      message: 'user created successfully',
      status: 201,
      user: userWithoutPassword,
      token: token,
    };
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<[Omit<User, 'password'>[], number, number, number]> {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user');
    if (search) {
      query.where('user.name like :search OR user.email like :search', {
        search: `%${search}%`,
      });
    }
    query.orderBy('user.name', 'ASC');
    const [users, total] = await query
      .leftJoinAndSelect('user.reviews', 'review')
      .leftJoinAndSelect('user.orders', 'order')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const usersWithoutPassword = users.map((user) => ({
      ...user,
      password: undefined,
    }));
    return [usersWithoutPassword, total, page, Math.ceil(total / limit)];
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'user not fount', status: 404 });
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async findOneWithPasswors(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'user not fount', status: 404 });
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'user not fount', status: 404 });
    }
    user.name = updateUserDto.name;
    user.email = updateUserDto.email;
    await this.userRepository.save(user);
    return 'User updated successfully';
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'user not fount', status: 404 });
    }
    await this.userRepository.remove(user);
    return `user ${user.name} deleted successfully`;
  }
  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });
    if (!user) {
      throw new NotFoundException({ message: 'user not fount', status: 404 });
    }
    const playload = {
      sub: user.id,
      role: user.role,
    };
    const token = this.jwtService.sign(playload);
    if (!encrypt.comparePassword(loginUserDto.password, user.password)) {
      throw new UnauthorizedException({
        message: 'invalid password',
        status: 401,
      });
    }
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'login successful',
      status: 200,
      user: userWithoutPassword,
      token: token,
    };
  }
}
