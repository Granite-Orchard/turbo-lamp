import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CustomHttpService } from './http.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [CustomHttpService],
  exports: [CustomHttpService],
})
export class CustomHttpModule {}
