import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CatDTO, CreateCatDTO, UpdateCatDTO } from '../dtos';
import CatsService from '../services/cats.service';

@Controller('cats')
export class CatsController {
  public constructor(private readonly service: CatsService) {}

  @Get()
  @ApiOkResponse({ type: CatDTO, isArray: true })
  public findAll(): Promise<Array<CatDTO>> {
    return this.service.findAll();
  }

  @Post()
  @ApiCreatedResponse({ type: CatDTO })
  public add(@Body() cat: CreateCatDTO): Promise<CatDTO> {
    return this.service.add(cat);
  }

  @Get(':id')
  @ApiOkResponse({ type: CatDTO })
  public findOne(@Param('id') id: string): Promise<CatDTO> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: CatDTO })
  public update(@Param('id') id: string, @Body() cat: UpdateCatDTO): Promise<CatDTO> {
    return this.service.update(id, cat);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CatDTO })
  public remove(@Param('id') id: string): Promise<CatDTO> {
    return this.service.remove(id);
  }
}
