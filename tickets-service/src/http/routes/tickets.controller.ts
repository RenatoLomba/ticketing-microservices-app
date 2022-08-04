import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import { TicketsService } from '../../services/tickets.service'
import { CreateTicketDto } from '../dtos/create-ticket.dto'

@Controller('/api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createTicket(
    @Body() { price, title }: CreateTicketDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.createTicket({
      price,
      title,
      userId: user.id,
    })
  }
}
