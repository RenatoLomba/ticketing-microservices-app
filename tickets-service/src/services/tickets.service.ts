import slugify from 'slugify'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTicketBySlug(slug: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { slug } })

    if (!ticket) {
      throw new BadRequestException(`Ticket requested don't exist`)
    }

    return ticket
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
