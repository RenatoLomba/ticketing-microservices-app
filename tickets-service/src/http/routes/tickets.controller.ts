import { Controller, Get, UseGuards } from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import { TicketsService } from '../../services/tickets.service'

@Controller('/api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  getTickets(@CurrentUser() user: User) {
    return this.ticketsService.getTickets(user.id)
  }
}
