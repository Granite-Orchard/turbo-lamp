import { HttpException, HttpStatus } from '@nestjs/common';

export class CalendarNotFoundException extends HttpException {
  constructor(message = 'Calendar not found') {
    super(
      {
        message,
        code: 'CALENDAR_NOT_FOUND',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CalendarAccessDeniedException extends HttpException {
  constructor(message = 'Calendar access denied') {
    super(
      {
        message,
        code: 'CALENDAR_ACCESS_DENIED',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
