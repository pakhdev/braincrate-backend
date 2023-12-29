import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, GetNotesDto, GetNotesForReviewDto, NoteOperationResponseDto, UpdateNoteDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Note } from './entities/note.entity';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Gestión de notas')
@ApiCookieAuth()
@Controller('notes')
@UseGuards(AuthGuard())
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @ApiOperation({ summary: 'Obtener una nota por ID' })
    @ApiParam({ name: 'id', description: 'ID de la nota', example: 1 })
    @ApiResponse({ status: 200, description: 'Solicitud exitosa', type: Note })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    @Get('id/:id')
    findOne(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<Note> {
        return this.notesService.findOneById(+id, user);
    }

    @ApiOperation({ summary: 'Obtener todas las notas' })
    @ApiQuery({
        name: 'limit',
        description: 'Número máximo de notas a devolver',
        type: Number,
        required: false,
        example: 20,
    })
    @ApiQuery({ name: 'offset', description: 'Número de notas a saltar', type: Number, required: false, example: 0 })
    @ApiQuery({
        name: 'searchTerm',
        description: 'Término de búsqueda para filtrar notas por título o contenido',
        type: String,
        required: false,
        example: 'término de búsqueda',
    })
    @ApiQuery({
        name: 'tagIds',
        description: 'IDs de las etiquetas para filtrar notas',
        type: [Number],
        required: false,
        example: [1, 2],
    })
    @ApiResponse({ status: 200, description: 'Solicitud exitosa', type: [Note] })
    @Get()
    findAll(@Query() getNotesDto: GetNotesDto, @GetUser() user: User): Promise<Note[]> {
        return this.notesService.findAll(getNotesDto, user);
    }

    @ApiOperation({ summary: 'Obtener las notas para repasar' })
    @ApiQuery({
        name: 'limit',
        description: 'Número máximo de notas a devolver',
        type: Number,
        required: false,
        example: 20,
    })
    @ApiQuery({ name: 'offset', description: 'Número de notas a saltar', type: Number, required: false, example: 0 })
    @ApiQuery({
        name: 'tagIds',
        description: 'IDs de las etiquetas para filtrar notas',
        type: [Number],
        required: false,
        example: [1, 2],
    })
    @ApiResponse({ status: 200, description: 'Solicitud exitosa', type: [Note] })
    @Get('for-review')
    findAllForReview(@Query() getNotesForReview: GetNotesForReviewDto, @GetUser() user: User): Promise<Note[]> {
        return this.notesService.findAllForReview(user, getNotesForReview);
    }

    @ApiOperation({ summary: 'Contar todas las notas pendientes de revisión' })
    @ApiResponse({ status: 200, description: 'Solicitud exitosa', type: Number })
    @Get('count-for-review')
    countAllForReview(@GetUser() user: User): Promise<number> {
        return this.notesService.countAllForReview(user);
    }

    @ApiOperation({ summary: 'Crear una nueva nota' })
    @ApiBody({ type: CreateNoteDto })
    @ApiResponse({ status: 200, description: 'Solicitud exitosa', type: NoteOperationResponseDto })
    @Post()
    create(@Body() createNoteDto: CreateNoteDto, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.create(createNoteDto, user);
    }

    @ApiOperation({ summary: 'Actualizar nota por ID' })
    @ApiParam({ name: 'id', description: 'ID de la nota', type: 'number' })
    @ApiBody({ type: UpdateNoteDto, description: 'Datos de actualización de la nota' })
    @ApiResponse({ status: 200, type: NoteOperationResponseDto, description: 'Nota actualizada exitosamente' })
    @ApiResponse({ status: 400, type: NoteOperationResponseDto, description: 'Error de solicitud o datos no válidos' })
    @ApiResponse({
        status: 401,
        type: NoteOperationResponseDto,
        description: 'No autorizado, se requiere autenticación',
    })
    @ApiResponse({ status: 404, type: NoteOperationResponseDto, description: 'Nota no encontrada' })
    @ApiResponse({ status: 500, type: NoteOperationResponseDto, description: 'Error interno del servidor' })
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateNoteDto: UpdateNoteDto, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.update(+id, updateNoteDto, user);
    }

    @ApiOperation({ summary: 'Marcar como repasado' })
    @ApiParam({ name: 'id', description: 'Identificador de la nota', type: 'number' })
    @ApiResponse({ status: 200, description: 'Éxito', type: NoteOperationResponseDto })
    @ApiResponse({ status: 400, description: 'Error de solicitud' })
    @ApiResponse({ status: 401, description: 'Solicitud no autorizada' })
    @Patch('mark-as-reviewed/:id')
    markAsReviewed(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.updateNoteReviewStatus(+id, user, 'markAsReviewed');
    }

    @ApiOperation({ summary: 'Cancelar repasos' })
    @ApiParam({ name: 'id', description: 'Identificador de la nota', type: 'number' })
    @ApiResponse({ status: 200, description: 'Éxito', type: NoteOperationResponseDto })
    @ApiResponse({ status: 400, description: 'Error de solicitud' })
    @ApiResponse({ status: 401, description: 'Solicitud no autorizada' })
    @Patch('cancel-reviews/:id')
    cancelReviews(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.updateNoteReviewStatus(+id, user, 'cancelReviews');
    }

    @ApiOperation({ summary: 'Resetear repasos' })
    @ApiParam({ name: 'id', description: 'Identificador de la nota', type: 'number' })
    @ApiResponse({ status: 200, description: 'Éxito', type: NoteOperationResponseDto })
    @ApiResponse({ status: 400, description: 'Error de solicitud' })
    @ApiResponse({ status: 401, description: 'Solicitud no autorizada' })
    @Patch('reset-reviews/:id')
    resetReviewsCount(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.updateNoteReviewStatus(+id, user, 'resetReviewsCount');
    }

    @ApiOperation({ summary: 'Recuperar una nota' })
    @ApiParam({ name: 'id', description: 'Identificador de la nota', type: 'number' })
    @ApiResponse({ status: 200, description: 'Éxito', type: NoteOperationResponseDto })
    @ApiResponse({ status: 400, description: 'Error de solicitud' })
    @ApiResponse({ status: 401, description: 'Solicitud no autorizada' })
    @Patch('restore/:id')
    restore(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.restore(+id, user);
    }

    @ApiOperation({ summary: 'Eliminar una nota' })
    @ApiParam({ name: 'id', description: 'Identificador de la nota', type: 'number' })
    @ApiResponse({ status: 200, description: 'Éxito', type: NoteOperationResponseDto })
    @ApiResponse({ status: 400, description: 'Error de solicitud' })
    @ApiResponse({ status: 401, description: 'Solicitud no autorizada' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string, @GetUser() user: User): Promise<NoteOperationResponseDto> {
        return this.notesService.remove(+id, user);
    }
}
