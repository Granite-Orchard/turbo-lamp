import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AccountProvider, EnvironmentVariables } from '../../libs/constants';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TokenSchema, TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(TokenService)
    private tokenService: TokenService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(AccountsService)
    private readonly accountService: AccountsService,
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(SessionsService)
    private readonly sessionService: SessionsService,
  ) {}

  async validateUser(
    username: string,
    provider: AccountProvider,
    password?: string,
  ): Promise<Account | null> {
    if (provider === AccountProvider.CREDENTIALS && !password) {
      throw new UnauthorizedException();
    }
    const account = await this.accountService.findOneBy(
      {
        providerId: provider,
        user: { email: username },
      },
      { user: true },
    );

    if (!account) {
      return null;
    }

    if (!password) {
      return account;
    }

    const isMatch = await bcrypt.compare(password, account.password!);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return account;
  }

  async register(
    register: RegisterDto,
    metadata?: { userAgent: string | undefined; ip: string | undefined },
  ): Promise<Session> {
    const { username, password, confirmPassword, timezone } = register;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const isMatch = await bcrypt.compare(confirmPassword, hashedPassword);
    if (!isMatch) {
      throw new BadRequestException();
    }
    let validated = await this.validateUser(
      register.username,
      AccountProvider.CREDENTIALS,
      register.password,
    );
    if (validated) {
      throw new ConflictException();
    }

    const user = await this.userService.create({
      name: username,
      email: username,
      emailVerified: false,
      timezone,
    });
    validated = await this.accountService.create({
      userId: user.id,
      accountId: user.id,
      providerId: AccountProvider.CREDENTIALS,
      password: hashedPassword,
    });
    validated.user = user;
    return await this.login(validated, metadata);
  }

  async login(
    account: Account,
    metadata?: { userAgent: string | undefined; ip: string | undefined },
  ): Promise<Session> {
    const token_ttl = this.configService.get<number>(
      EnvironmentVariables.TOKEN_TTL,
    )!;
    const expiresIn = token_ttl * 1000;
    const expiresAt = new Date(Date.now() + expiresIn);
    const payload: TokenSchema = {
      sub: account.user.id,
      username: account.user.email,
      provider: account.providerId,
    };
    const token = this.tokenService.sign(payload, {
      expiresIn,
    });
    const session = await this.sessionService.create({
      userId: account.user.id,
      token: token,
      expiresAt,
      ipAddress: metadata && metadata.ip ? metadata.ip : undefined,
      userAgent:
        metadata && metadata.userAgent ? metadata.userAgent : undefined,
    });
    return session;
  }
}
