import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CustomHttpService } from '../http/http.service';

@Injectable()
export class GoogleTokenService {
  private readonly logger: Logger = new Logger(GoogleTokenService.name);
  constructor(private readonly http: CustomHttpService) {}

  async refreshAccessToken(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<{ accessToken: string; expiresIn: number }> {
    this.logger.debug('refreshAccessToken invoked', {
      correlationId: '3b3d3a51-a11f-463a-9cd2-d207f7961410',
    });
    const { clientId, clientSecret, refreshToken } = params;

    const { data } = await firstValueFrom(
      this.http.post<{
        access_token: string;
        expires_in: number;
      }>('https://oauth2.googleapis.com/token', null, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      }),
    );

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }
}
