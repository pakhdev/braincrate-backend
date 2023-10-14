import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagsService } from './tags.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get()
    @UseGuards(AuthGuard())
    findAll(@GetUser() user: User) {
        return this.tagsService.findAll(user);
    }

}
