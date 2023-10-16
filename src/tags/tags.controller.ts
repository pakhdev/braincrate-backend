import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagsService } from './tags.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { GetSubtagsDto } from './dto/get-subtags.dto';
import { TagsResponseDto } from './dto/tags-response.dto';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get()
    @UseGuards(AuthGuard())
    findAll(@Query() getSubtagsDto: GetSubtagsDto, @GetUser() user: User): Promise<TagsResponseDto[]> {
        return this.tagsService.findAll(getSubtagsDto, user);
    }

    @Get('subtags-for-review')
    @UseGuards(AuthGuard())
    findSubtagsForReview(@Query() getSubtagsDto: GetSubtagsDto, @GetUser() user: User): Promise<TagsResponseDto[]> {
        return this.tagsService.findTagsForReview(getSubtagsDto, user);
    }

}
