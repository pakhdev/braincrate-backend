import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post()
    @UseGuards(AuthGuard())
    create(@Body() createNoteDto: CreateNoteDto, @GetUser() user: User) {
        return this.notesService.create(createNoteDto, user);
    }

    @Patch(':id')
    @UseGuards(AuthGuard())
    update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @GetUser() user: User) {
        return this.notesService.update(+id, updateNoteDto, user);
    }

    @Patch('restore/:id')
    @UseGuards(AuthGuard())
    restore(@Param('id') id: string, @GetUser() user: User) {
        return this.notesService.restore(+id, user);
    }

    @Delete(':id')
    @UseGuards(AuthGuard())
    remove(@Param('id') id: string, @GetUser() user: User) {
        return this.notesService.remove(+id, user);
    }
}
