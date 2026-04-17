export class PaginationMetaDto {
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  return {
    data,
    meta: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    },
  };
}
