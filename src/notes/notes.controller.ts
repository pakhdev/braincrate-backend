import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetNotesDto } from './dto/get-notes.dto';
import { GetNotesForReviewDto } from './dto/get-notes-for-review.dto';

@Controller('notes')
@UseGuards(AuthGuard())
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.findOneById(+id, user);
    }

    @Get()
    findAll(@Query() getNotesDto: GetNotesDto, @GetUser() user: User) {
        return this.notesService.findAll(getNotesDto, user);
    }

    @Get('for-review')
    findAllForReview(@Query() getNotesForReview: GetNotesForReviewDto, @GetUser() user: User) {
        return this.notesService.findAllForReview(user, getNotesForReview);
    }

    @Post()
    create(@Body() createNoteDto: CreateNoteDto, @GetUser() user: User) {
        return this.notesService.create(createNoteDto, user);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateNoteDto: UpdateNoteDto, @GetUser() user: User) {
        return this.notesService.update(+id, updateNoteDto, user);
    }

    @Patch('restore/:id')
    restore(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.restore(+id, user);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.remove(+id, user);
    }
}
