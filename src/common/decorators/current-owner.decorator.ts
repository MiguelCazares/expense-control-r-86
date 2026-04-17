import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { OwnerEntity } from 'src/owners/entities/owner.entity';

export const CurrentOwner = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): OwnerEntity => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as OwnerEntity;
  },
);
