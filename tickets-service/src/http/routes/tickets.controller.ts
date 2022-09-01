import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import { TicketCreatedPublisher } from '../../events/publishers/ticket-created.publisher'
import { TicketUpdatedPublisher } from '../../events/publishers/ticket-updated.publisher'
import { TicketsService } from '../../services/tickets.service'
import { CreateTicketDto } from '../dtos/create-ticket.dto'
import { UpdateTicketDto } from '../dtos/update-ticket.dto'

@Controller('/api/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketCreatedPublisher: TicketCreatedPublisher,
    private readonly ticketUpdatedPublisher: TicketUpdatedPublisher,
  ) {}

  @Get('/list')
  @HttpCode(200)
  async listTickets() {
    return this.ticketsService.tickets({})
  }

  @Get('/:slug')
  @HttpCode(200)
  async getTicket(@Param('slug') slug: string) {
    const ticket = await this.ticketsService.ticket({ slug })

    if (!ticket) {
      throw new BadRequestException(`Ticket requested don't exist`)
    }

    return ticket
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createTicket(
    @Body() { price, title }: CreateTicketDto,
    @CurrentUser() user: User,
  ) {
    const ticket = await this.ticketsService.createTicket({
      price,
      title,
      userId: user.id,
    })

    await this.ticketCreatedPublisher.publish(ticket)

    return ticket
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/:id')
  async updateTicket(
    @Param('id') id: string,
    @Body() { title, price }: UpdateTicketDto,
    @CurrentUser() user: User,
  ) {
    const ticket = await this.ticketsService.ticket({ id })

    if (!ticket) {
      throw new BadRequestException('Ticket does not exist')
    }

    if (ticket.userId !== user.id) {
      throw new UnauthorizedException('You cannot update this ticket')
    }

    const ticketUpdated = await this.ticketsService.updateTicket(
      { price, title },
      id,
    )

    await this.ticketUpdatedPublisher.publish(ticketUpdated)

    return ticketUpdated
  }
}
