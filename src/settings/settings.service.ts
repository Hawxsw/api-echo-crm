import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    await this.getSettings(userId);

    return this.prisma.userSettings.update({
      where: { userId },
      data: updateSettingsDto,
    });
  }

  async resetSettings(userId: string) {
    await this.prisma.userSettings.deleteMany({
      where: { userId },
    });

    return this.prisma.userSettings.create({
      data: { userId },
    });
  }
}

