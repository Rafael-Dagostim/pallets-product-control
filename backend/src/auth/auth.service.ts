import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@core/database/database.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { login: dto.login, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const pepper = this.configService.get<string>('PWD_PEPPER', '');
    const isPasswordValid = await bcrypt.compare(
      dto.password + pepper,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      user: new UserEntity(user),
      ...this.signTokens(user.id, user.role),
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(dto.token);
    } catch {
      throw new UnauthorizedException('Token de refresh inválido ou expirado');
    }

    // Only a token explicitly minted as a refresh token may be exchanged here.
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token de refresh inválido ou expirado');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.signTokens(user.id, user.role);
  }

  private signTokens(userId: string, role: JwtPayload['role']) {
    const base = { userId, role };
    return {
      token: this.jwtService.sign({ ...base, type: 'access' }),
      refresh: this.jwtService.sign(
        { ...base, type: 'refresh' },
        { expiresIn: '7d' },
      ),
    };
  }
}
