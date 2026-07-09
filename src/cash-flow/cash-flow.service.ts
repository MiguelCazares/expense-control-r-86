import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { CategoryColor } from 'src/categories/enums/category-color.enum';
import { CashFlowQueryDto } from './dto/cash-flow-query.dto';

export interface CashFlowDaily {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashFlowCategoryBreakdown {
  categoryId: number;
  name: string;
  color: CategoryColor;
  amount: number;
  count: number;
}

export interface CashFlowSummary {
  dateFrom: string;
  dateTo: string;
  busId: number | null;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  expensesByCategory: CashFlowCategoryBreakdown[];
  daily: CashFlowDaily[];
}

@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
  ) {}

  async getSummary(
    ownerId: number,
    query: CashFlowQueryDto,
  ): Promise<CashFlowSummary> {
    const { dateFrom, dateTo, busId } = query;

    if (dateFrom > dateTo) {
      throw new BadRequestException('dateFrom must not be after dateTo');
    }

    const incomeQb = this.incomeRepository
      .createQueryBuilder('income')
      .innerJoin('income.bus', 'bus')
      .where('bus.owner_id = :ownerId', { ownerId })
      .andWhere('income.date >= :dateFrom', { dateFrom })
      .andWhere('income.date <= :dateTo', { dateTo });

    const expenseQb = this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.bus', 'bus')
      .innerJoinAndSelect('expense.category', 'category')
      .where('bus.owner_id = :ownerId', { ownerId })
      .andWhere('expense.date >= :dateFrom', { dateFrom })
      .andWhere('expense.date <= :dateTo', { dateTo });

    if (busId) {
      incomeQb.andWhere('income.bus_id = :busId', { busId });
      expenseQb.andWhere('expense.bus_id = :busId', { busId });
    }

    const [incomeRows, expenseRows] = await Promise.all([
      incomeQb.getMany(),
      expenseQb.getMany(),
    ]);

    const totalIncome = incomeRows.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );
    const totalExpenses = expenseRows.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    return {
      dateFrom,
      dateTo,
      busId: busId ?? null,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeCount: incomeRows.length,
      expenseCount: expenseRows.length,
      expensesByCategory: this.groupByCategory(expenseRows),
      daily: this.buildDailyBreakdown(
        dateFrom,
        dateTo,
        incomeRows,
        expenseRows,
      ),
    };
  }

  private groupByCategory(
    expenseRows: ExpenseEntity[],
  ): CashFlowCategoryBreakdown[] {
    const byCategory = new Map<number, CashFlowCategoryBreakdown>();

    for (const expense of expenseRows) {
      const { id, name, color } = expense.category;
      const entry = byCategory.get(id) ?? {
        categoryId: id,
        name,
        color,
        amount: 0,
        count: 0,
      };
      entry.amount += Number(expense.amount);
      entry.count += 1;
      byCategory.set(id, entry);
    }

    return Array.from(byCategory.values());
  }

  private buildDailyBreakdown(
    dateFrom: string,
    dateTo: string,
    incomeRows: IncomeEntity[],
    expenseRows: ExpenseEntity[],
  ): CashFlowDaily[] {
    const incomeByDate = new Map<string, number>();
    for (const income of incomeRows) {
      incomeByDate.set(
        income.date,
        (incomeByDate.get(income.date) ?? 0) + Number(income.amount),
      );
    }

    const expensesByDate = new Map<string, number>();
    for (const expense of expenseRows) {
      expensesByDate.set(
        expense.date,
        (expensesByDate.get(expense.date) ?? 0) + Number(expense.amount),
      );
    }

    const daily: CashFlowDaily[] = [];
    const cursor = new Date(`${dateFrom}T00:00:00Z`);
    const end = new Date(`${dateTo}T00:00:00Z`);

    while (cursor <= end) {
      const date = cursor.toISOString().slice(0, 10);
      const income = incomeByDate.get(date) ?? 0;
      const expenses = expensesByDate.get(date) ?? 0;
      daily.push({ date, income, expenses, balance: income - expenses });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return daily;
  }
}
