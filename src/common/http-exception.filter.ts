import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const logMessage = {
      timestamp: new Date().toISOString(),
      path: request.url,
      status,
      message: exception.message,
    };

    this.logger.error('HTTP Exception', logMessage);

    response.status(status).json({
      statusCode: status,
      timestamp: logMessage.timestamp,
      path: request.url,
    });
  }
}
