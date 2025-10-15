import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string) {
    return this.prisma.feedback.create({
      data: {
        ...createFeedbackDto,
        userId,
        priority: createFeedbackDto.priority || 'MEDIUM',
        isAnonymous: createFeedbackDto.isAnonymous || false,
      },
      include: {
        votes: true,
      },
    });
  }

  async findAll(page: number, limit: number, userId: string): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          votes: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.feedback.count(),
    ]);

    const feedbacksWithVotes = feedbacks.map(feedback => ({
      ...feedback,
      votesCount: feedback.votes.length,
      hasVoted: feedback.votes.some(vote => vote.userId === userId),
      user: feedback.isAnonymous ? null : feedback.user,
    }));

    return {
      data: feedbacksWithVotes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        votes: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      ...feedback,
      votesCount: feedback.votes.length,
      hasVoted: feedback.votes.some(vote => vote.userId === userId),
      user: feedback.isAnonymous ? null : feedback.user,
    };
  }

  async findMyFeedbacks(userId: string, page: number, limit: number): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          votes: true,
        },
      }),
      this.prisma.feedback.count({ where: { userId } }),
    ]);

    const feedbacksWithVotes = feedbacks.map(feedback => ({
      ...feedback,
      votesCount: feedback.votes.length,
      hasVoted: feedback.votes.some(vote => vote.userId === userId),
    }));

    return {
      data: feedbacksWithVotes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto, userId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.userId !== userId) {
      throw new ForbiddenException('You can only update your own feedback');
    }

    return this.prisma.feedback.update({
      where: { id },
      data: updateFeedbackDto,
      include: {
        votes: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.userId !== userId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    await this.prisma.feedback.delete({ where: { id } });

    return { message: 'Feedback removed successfully' };
  }

  async toggleVote(feedbackId: string, userId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const existingVote = await this.prisma.feedbackVote.findUnique({
      where: {
        feedbackId_userId: {
          feedbackId,
          userId,
        },
      },
    });

    if (existingVote) {
      await this.prisma.feedbackVote.delete({
        where: { id: existingVote.id },
      });

      return { message: 'Vote removed', voted: false };
    } else {
      await this.prisma.feedbackVote.create({
        data: {
          feedbackId,
          userId,
        },
      });

      return { message: 'Vote added', voted: true };
    }
  }

  async getStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, feedbacks] = await this.prisma.$transaction([
      this.prisma.feedback.count(),
      this.prisma.feedback.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      }),
      this.prisma.feedback.findMany({
        select: {
          rating: true,
          type: true,
          status: true,
        },
      }),
    ]);

    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = feedbacks.length > 0 ? Number((totalRating / feedbacks.length).toFixed(2)) : 0;

    const byType = feedbacks.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = feedbacks.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      thisMonth,
      averageRating,
      byType,
      byStatus,
    };
  }

  async getTopSuggestions(limit: number = 10) {
    const suggestions = await this.prisma.feedback.findMany({
      where: {
        type: 'SUGGESTION',
      },
      include: {
        votes: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return suggestions.map(suggestion => ({
      ...suggestion,
      votesCount: suggestion.votes.length,
      user: suggestion.isAnonymous ? null : suggestion.user,
    }));
  }
}

