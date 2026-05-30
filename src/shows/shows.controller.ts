
import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ShowsService } from './shows.service';
import { Show } from '../entities/show.entity';

@Controller('shows')
export class ShowsController {
	constructor(private readonly showsService: ShowsService) {}

	@Get()
	findAll(): Promise<Show[]> {
		return this.showsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number): Promise<Show | null> {
		return this.showsService.findOne(id);
	}

	@Post()
	create(@Body() show: Partial<Show>): Promise<Show> {
		return this.showsService.create(show);
	}

	@Put(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() show: Partial<Show>): Promise<Show> {
		return this.showsService.update(id, show);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.showsService.remove(id);
	}
}
