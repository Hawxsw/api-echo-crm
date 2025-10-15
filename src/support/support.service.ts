import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, CreateFAQDto, UpdateFAQDto } from './dto/support.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  // Ticket methods
  async createTicket(createTicketDto: CreateTicketDto, userId: string) {
    return this.prisma.supportTicket.create({
      data: {
        ...createTicketDto,
        userId,
        priority: createTicketDto.priority || 'MEDIUM',
      },
    });
  }

  async findAllTickets(page: number, limit: number, userId: string): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.supportTicket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneTicket(id: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only view your own tickets');
    }

    return ticket;
  }

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async removeTicket(id: string, userId: string): Promise<{ message: string }> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only delete your own tickets');
    }

    await this.prisma.supportTicket.delete({ where: { id } });

    return { message: 'Support ticket removed successfully' };
  }

  // FAQ methods
  async createFAQ(createFAQDto: CreateFAQDto) {
    return this.prisma.fAQ.create({
      data: {
        ...createFAQDto,
        isActive: createFAQDto.isActive !== undefined ? createFAQDto.isActive : true,
        position: createFAQDto.position || 0,
      },
    });
  }

  async findAllFAQs(page: number, limit: number, category?: string, search?: string): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [faqs, total] = await this.prisma.$transaction([
      this.prisma.fAQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    return {
      data: faqs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneFAQ(id: string) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    // Increment views
    await this.prisma.fAQ.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return faq;
  }

  async updateFAQ(id: string, updateFAQDto: UpdateFAQDto) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return this.prisma.fAQ.update({
      where: { id },
      data: updateFAQDto,
    });
  }

  async removeFAQ(id: string): Promise<{ message: string }> {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    await this.prisma.fAQ.delete({ where: { id } });

    return { message: 'FAQ removed successfully' };
  }

  async getFAQCategories() {
    const faqs = await this.prisma.fAQ.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return faqs.map(faq => faq.category);
  }
}

