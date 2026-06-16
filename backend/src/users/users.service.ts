import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({ ...dto, passwordHash });
    return this.userRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    const updateData: Record<string, any> = { ...dto };
    if (dto.password) {
      updateData['passwordHash'] = await bcrypt.hash(dto.password, 12);
      delete updateData['password'];
    }
    await this.userRepo.update(id, updateData);
    return this.findOne(id);
  }

  async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userRepo.update(id, { refreshToken: hashedToken });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.userRepo.update(id, { isActive: false });
  }
}
