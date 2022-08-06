import slugify from 'slugify'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTickets({
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

  async getTicketBySlug(slug: string) {
    return await this.prisma.ticket.findUnique({ where: { slug } })
  }

  async createTicket({
    price,
    title,
    userId,
  }: Omit<Prisma.TicketCreateInput, 'slug'>) {
    const slug = slugify(title, {
      lower: true,
      trim: true,
      strict: true,
    })

    return this.prisma.ticket
      .create({
        data: {
          price,
          title,
          userId,
          slug,
        },
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
