import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Array<{
      action: string;
      resource: string;
      conditions: unknown;
    }>;
  } | null;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserPayload }>();
    const user = request.user;

    return data && user ? user[data] : user;
  },
);

