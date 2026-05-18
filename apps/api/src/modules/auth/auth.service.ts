import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AccountProvider, EnvironmentVariables } from '../../libs/constants';
import { AccountsService } from '../accounts/accounts.service';
import { Account } from '../accounts/entities/account.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { TokenSchema, TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  constructor(
    private readonly dataSource: DataSource,
    @Inject(TokenService)
    private tokenService: TokenService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(AccountsService)
    private readonly accountService: AccountsService,
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
    const hashToCompare =
      account?.password ??
      (await bcrypt.hash(crypto.randomUUID(), await bcrypt.genSalt(10)));
    const isMatch = await bcrypt.compare(password ?? '', hashToCompare);

    if (!isMatch) {
      return null;
    }

    return account;
  }

  async register(
    register: RegisterDto,
    metadata?: { userAgent: string | undefined; ip: string | undefined },
  ): Promise<Session> {
    const { username, password, confirmPassword, timezone } = register;
    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(confirmPassword, hashedPassword);
    if (!isMatch) {
      throw new BadRequestException();
    }
    const validated = await this.validateUser(
      register.username,
      AccountProvider.CREDENTIALS,
      register.password,
    );
    if (validated) {
      throw new ConflictException();
    }

    try {
      const account = await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const accountRepository = manager.getRepository(Account);
        const user = await userRepository.save({
          name: username,
          email: username,
          emailVerified: false,
          timezone,
        });
        const account = await accountRepository.save({
          userId: user.id,
          accountId: user.id,
          providerId: AccountProvider.CREDENTIALS,
          password: hashedPassword,
        });
        return { ...account, user };
      });
      return await this.login(account, metadata);
    } catch (err: unknown) {
      this.logger.error('register encountered an exception', err);
      throw new InternalServerErrorException();
    }
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
