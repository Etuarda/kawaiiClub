import { BadRequestException, Body, Controller, Get, Headers, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { DemoBusinessService } from '../domain/demo-business.service';
import type { MatchInput, ProposalFields } from '../domain/contracts';
/** Somente para execução local em DEMO_MODE; sem autenticação/DB de produção. */
@Controller()
export class DemoController {
  constructor(private readonly service: DemoBusinessService) { }
  @Get('health') health() { return { success: true, data: { service: 'kawaii-api-demo', mode: 'mock' } }; }
  @Get('partnerships/recommendations') list(@Query('opportunityId') id: string) { const n = Number(id); if (!Number.isInteger(n) || n <= 0) throw new BadRequestException('opportunityId inválido.'); const matches = this.service.recommendations(n); return { success: true, data: matches, meta: { total: matches.length, page: 1, limit: 10, totalPages: 1 } }; }
  @Post('partnerships/proposal-drafts') @HttpCode(201) create(@Body() body: MatchInput, @Headers('idempotency-key') key: string) { return { success: true, data: this.service.createDraft(body, key) }; }
  @Get('partnerships/proposal-drafts/:id') get(@Param('id', ParseIntPipe) id: number) { return { success: true, data: this.service.getDraft(id) }; }
  @Patch('partnerships/proposal-drafts/:id') update(@Param('id', ParseIntPipe) id: number, @Body() body: { expectedVersion: number; fields: ProposalFields }) { return { success: true, data: this.service.updateDraft(id, body) }; }
}
