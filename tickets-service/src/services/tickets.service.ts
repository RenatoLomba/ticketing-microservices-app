import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async tickets({
    take = 100,
    skip,
    where,
    orderBy = { createdAt: 'desc' },
  }: {
    take?: number
    skip?: number
    where?: Prisma.TicketWhereInput
    orderBy?: Prisma.TicketOrderByWithRelationInput
  }) {
    return this.prisma.ticket.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
      },
      orderBy,
      take,
      skip,
      where,
    })
  }

  async ticket(where: Prisma.TicketWhereUniqueInput) {
    return await this.prisma.ticket.findUnique({ where })
  }

  async createTicket(data: Prisma.TicketCreateInput) {
    return this.prisma.ticket
      .create({
        data,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Duplicate ticket slug')
          }
        }

        throw error
      })
  }

  async updateTicket(params: {
    where: Prisma.TicketWhereUniqueInput
    data: Prisma.TicketUpdateInput
  }) {
    const { where, data } = params

    return this.prisma.ticket
      .update({
        data,
        where,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Duplicate ticket slug')
          }
        }

        throw error
      })
  }
}
