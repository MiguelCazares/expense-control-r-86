import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OwnersService } from 'src/owners/owners.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly ownersService: OwnersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const owner = await this.ownersService.create(dto);
    const payload: JwtPayload = { sub: owner.id, email: owner.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const owner = await this.ownersService.findByEmail(dto.email);

    if (!owner || !(await bcrypt.compare(dto.password, owner.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: owner.id, email: owner.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
