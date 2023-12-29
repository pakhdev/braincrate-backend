import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TagsService } from './tags.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { GetSubtagsDto } from './dto/get-subtags.dto';
import { TagsResponseDto } from './dto/tags-response.dto';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Obtención de etiquetas')
@ApiCookieAuth()
@UseGuards(AuthGuard())
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Get()
    @ApiQuery({
        name: 'parentTagIds',
        required: false,
        type: [Number],
        description: 'IDs de las etiquetas principales',
    })
    @ApiQuery({
        name: 'searchTerm',
        required: false,
        type: String,
        description: 'Término de búsqueda para las etiquetas',
    })
    findAll(@Query() getSubtagsDto: GetSubtagsDto, @GetUser() user: User): Promise<TagsResponseDto[]> {
        return this.tagsService.findAll(getSubtagsDto, user);
    }

    @Get('subtags-for-review')
    findSubtagsForReview(@Query() getSubtagsDto: GetSubtagsDto, @GetUser() user: User): Promise<TagsResponseDto[]> {
        return this.tagsService.findTagsForReview(getSubtagsDto, user);
    }

}
