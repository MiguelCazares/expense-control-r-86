import { CategoryColor } from '../enums/category-color.enum';

export interface DefaultCategory {
  name: string;
  slug: string;
  color: CategoryColor;
}

/**
 * Seeded for every owner on registration. Slugs match the values of the
 * former `expenses_category_enum`, so historical expenses keep their category.
 */
export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: 'Combustible', slug: 'fuel', color: CategoryColor.WARNING },
  { name: 'Mantenimiento', slug: 'maintenance', color: CategoryColor.INFO },
  { name: 'Reparación', slug: 'repair', color: CategoryColor.DANGER },
  { name: 'Otro', slug: 'other', color: CategoryColor.DEFAULT },
];
