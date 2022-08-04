import { Injectable } from '@nestjs/common'

@Injectable()
export class TicketsService {
  getTickets(userId: string) {
    return [{ id: '1', ticket: 'Teste', userId }]
  }
}
