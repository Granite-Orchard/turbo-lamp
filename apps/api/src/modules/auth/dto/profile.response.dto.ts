import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user.response.dto';

@Exclude()
export class ProfileResponseDto {
  @Expose()
  id: string;
  @Expose()
  userId: string;
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
  @Expose()
  accountId: string;
  @Expose()
  providerId: string;
}
