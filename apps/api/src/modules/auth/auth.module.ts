import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountsModule } from '../accounts/accounts.module';
import { CalendarsModule } from '../calendars/calendars.module';
import { CustomHttpModule } from '../http/http.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { MeetingParticipantsModule } from '../meeting-participants/meeting-participants.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { VerificationsModule } from '../verifications/verifications.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { GoogleTokenService } from './google-token.service';
import { GoogleAuthManager } from './managers/google-auth.manager';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    PassportModule,
    AccountsModule,
    UsersModule,
    SessionsModule,
    VerificationsModule,
    MeetingParticipantsModule,
    CustomHttpModule,
    CalendarsModule,
    InvitationsModule,
  ],
  providers: [
    JwtService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AuthService,
    GoogleTokenService,
    GoogleAuthManager,
    CookieService,
  ],
  controllers: [AuthController],
  exports: [JwtService, AuthService, TokenService, GoogleAuthManager],
})
export class AuthModule {}
