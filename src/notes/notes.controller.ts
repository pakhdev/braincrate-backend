import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, GetNotesDto, GetNotesForReviewDto, UpdateNoteDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Note } from './entities/note.entity';

@Controller('notes')
@UseGuards(AuthGuard())
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Get('id/:id')
    findOne(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.findOneById(+id, user);
    }

    @Get()
    findAll(@Query() getNotesDto: GetNotesDto, @GetUser() user: User): Promise<[Note[], number] | Note[]> {
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

    @Patch('mark-as-reviewed/:id')
    markAsReviewed(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.updateNoteReviewStatus(+id, user, 'markAsReviewed');
    }

    @Patch('cancel-reviews/:id')
    cancelReviews(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.updateNoteReviewStatus(+id, user, 'cancelReviews');
    }

    @Patch('reset-reviews-count/:id')
    resetReviewsCount(@Param('id', ParseIntPipe) id: string, @GetUser() user: User) {
        return this.notesService.updateNoteReviewStatus(+id, user, 'resetReviewsCount');
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
