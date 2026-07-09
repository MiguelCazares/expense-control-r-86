import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { ExpenseCategory } from 'src/expenses/enums/expense-category.enum';

function mockQueryBuilder<T>(rows: T[]) {
  const innerJoin = jest.fn();
  const where = jest.fn();
  const andWhere = jest.fn();
  const getMany = jest.fn().mockResolvedValue(rows);
  const qb = { innerJoin, where, andWhere, getMany };
  innerJoin.mockReturnValue(qb);
  where.mockReturnValue(qb);
  andWhere.mockReturnValue(qb);
  return qb;
}

describe('CashFlowService', () => {
  let service: CashFlowService;
  let incomeRows: Partial<IncomeEntity>[];
  let expenseRows: Partial<ExpenseEntity>[];

  const buildModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashFlowService,
        {
          provide: getRepositoryToken(IncomeEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder(incomeRows)),
          },
        },
        {
          provide: getRepositoryToken(ExpenseEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder(expenseRows)),
          },
        },
      ],
    }).compile();

    service = module.get<CashFlowService>(CashFlowService);
  };

  beforeEach(() => {
    incomeRows = [
      { date: '2026-07-06', amount: 1000 },
      { date: '2026-07-06', amount: 250 },
      { date: '2026-07-07', amount: 500 },
    ];
    expenseRows = [
      { date: '2026-07-06', amount: 100, category: ExpenseCategory.FUEL },
      {
        date: '2026-07-07',
        amount: 80,
        category: ExpenseCategory.MAINTENANCE,
      },
      { date: '2026-07-07', amount: 20, category: ExpenseCategory.FUEL },
    ];
  });

  it('computes totals and balance across the range', async () => {
    await buildModule();

    const result = await service.getSummary(1, {
      dateFrom: '2026-07-06',
      dateTo: '2026-07-07',
    });

    expect(result.totalIncome).toBe(1750);
    expect(result.totalExpenses).toBe(200);
    expect(result.balance).toBe(1550);
    expect(result.incomeCount).toBe(3);
    expect(result.expenseCount).toBe(3);
  });

  it('groups expenses by category', async () => {
    await buildModule();

    const result = await service.getSummary(1, {
      dateFrom: '2026-07-06',
      dateTo: '2026-07-07',
    });

    expect(result.expensesByCategory).toEqual(
      expect.arrayContaining([
        { category: ExpenseCategory.FUEL, amount: 120, count: 2 },
        { category: ExpenseCategory.MAINTENANCE, amount: 80, count: 1 },
      ]),
    );
  });

  it('builds one daily row per day in the range, including days with no records', async () => {
    incomeRows = [{ date: '2026-07-06', amount: 1000 }];
    expenseRows = [];
    await buildModule();

    const result = await service.getSummary(1, {
      dateFrom: '2026-07-05',
      dateTo: '2026-07-07',
    });

    expect(result.daily).toEqual([
      { date: '2026-07-05', income: 0, expenses: 0, balance: 0 },
      { date: '2026-07-06', income: 1000, expenses: 0, balance: 1000 },
      { date: '2026-07-07', income: 0, expenses: 0, balance: 0 },
    ]);
  });

  it('rejects a range where dateFrom is after dateTo', async () => {
    await buildModule();

    await expect(
      service.getSummary(1, { dateFrom: '2026-07-10', dateTo: '2026-07-01' }),
    ).rejects.toThrow(BadRequestException);
  });
});
