import { createZodDto } from 'nestjs-zod';
import { UpdateSettingsSchema, SettingsResponseSchema } from './settings.schema';

export class UpdateSettingsDto extends createZodDto(UpdateSettingsSchema) {}

export class SettingsResponseDto extends createZodDto(SettingsResponseSchema) {}

