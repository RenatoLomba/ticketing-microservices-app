import slugify from 'slugify'

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

type CreateTicketDto = {
  title: string
  price: number
  userId: string
}

type UpdateTicketDto = {
  title?: string
  price?: number
}

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

  async createTicket({ title, price, userId }: CreateTicketDto) {
    const slug = slugify(title, {
      lower: true,
      trim: true,
      strict: true,
    })

    const ticket = await this.ticket({ slug })

    if (!!ticket) {
      throw new BadRequestException('Ticket with title/slug already exists')
    }

    return this.prisma.ticket
      .create({
        data: {
          title,
          price,
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

  async updateTicket({ title, price }: UpdateTicketDto, id: string) {
    const updateData: { price?: number; title?: string; slug?: string } = {
      title,
      price,
    }

    if (title) {
      updateData.slug = slugify(title, {
        lower: true,
        trim: true,
        strict: true,
      })

      const ticketWithSlugAlreadyExistent = await this.ticket({
        slug: updateData.slug,
      })

      if (
        !!ticketWithSlugAlreadyExistent &&
        ticketWithSlugAlreadyExistent.id !== id
      ) {
        throw new BadRequestException('Ticket with title/slug already exists')
      }
    }

    return this.prisma.ticket
      .update({
        data: {
          price: updateData.price,
          title: updateData.title,
          slug: updateData.slug,
          version: {
            increment: 1,
          },
        },
        where: {
          id,
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
