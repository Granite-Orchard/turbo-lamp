import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccountResponseDto {
  @Expose()
  id: string;
  @Expose()
  userId: string;
  @Expose()
  accountId: string;
  @Expose()
  providerId: string;
}
