import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { MysqlError } from '../interfaces/mysql-error.interface';

export const handleDBErrors = (error: MysqlError, from: string): never => {
    const logger = new Logger(from);

    if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

    switch (error.code) {
        case 'ER_DUP_ENTRY':
            throw new BadRequestException(error.sqlMessage);
        case 'ER_NO_REFERENCED_ROW_2':
            throw new NotFoundException(error.sqlMessage);
        case 'ER_PARSE_ERROR':
        case 'ER_WRONG_VALUE_COUNT_ON_ROW':
            throw new BadRequestException(error.sqlMessage);
        case 'ER_BAD_NULL_ERROR':
        case 'ER_NO_DEFAULT_FOR_FIELD':
            throw new BadRequestException('Missing required fields');
        case 'ER_ROW_IS_REFERENCED_2':
            throw new BadRequestException('Cannot delete or update a parent row');
        case 'ER_DATA_TOO_LONG':
            throw new BadRequestException('Data is too long');
        case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
            throw new BadRequestException('Truncated wrong value for field');
        case 'ER_LOCK_WAIT_TIMEOUT':
            throw new InternalServerErrorException('Lock wait timeout exceeded');
        case 'ER_TOO_MANY_CONNECTIONS':
            throw new InternalServerErrorException('Too many connections');
        default:
            logger.error(error);
            logger.error(error.sql);
            throw new InternalServerErrorException('Error, check logs');
    }
};