import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpenseCategories1783000000000 implements MigrationInterface {
  name = 'ExpenseCategories1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."expense_categories_color_enum" AS ENUM('default', 'success', 'warning', 'danger', 'info', 'purple')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense_categories" ("id" SERIAL NOT NULL, "name" character varying(60) NOT NULL, "slug" character varying(60) NOT NULL, "color" "public"."expense_categories_color_enum" NOT NULL DEFAULT 'default', "active" boolean NOT NULL DEFAULT true, "owner_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_expense_categories" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expense_categories_owner" ON "expense_categories" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_expense_categories_owner_slug" ON "expense_categories" ("owner_id", "slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_categories" ADD CONSTRAINT "FK_expense_categories_owner" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Give every existing owner the four categories the enum used to hold.
    await queryRunner.query(
      `INSERT INTO "expense_categories" ("name", "slug", "color", "owner_id")
       SELECT defaults.name, defaults.slug, defaults.color::"public"."expense_categories_color_enum", owners.id
       FROM "owners"
       CROSS JOIN (VALUES
         ('Combustible', 'fuel', 'warning'),
         ('Mantenimiento', 'maintenance', 'info'),
         ('Reparación', 'repair', 'danger'),
         ('Otro', 'other', 'default')
       ) AS defaults(name, slug, color)`,
    );

    await queryRunner.query(`ALTER TABLE "expenses" ADD "category_id" integer`);

    // Each expense reaches its owner through its bus, so match on that owner's
    // category whose slug equals the old enum value.
    await queryRunner.query(
      `UPDATE "expenses" SET "category_id" = c.id
       FROM "buses" b, "expense_categories" c
       WHERE "expenses"."bus_id" = b.id
         AND c.owner_id = b.owner_id
         AND c.slug = "expenses"."category"::text`,
    );

    const orphans: { count: string }[] = await queryRunner.query(
      `SELECT COUNT(*) AS count FROM "expenses" WHERE "category_id" IS NULL`,
    );
    if (Number(orphans[0].count) > 0) {
      throw new Error(
        `Cannot migrate: ${orphans[0].count} expense(s) could not be matched to a category`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "expenses" ALTER COLUMN "category_id" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);

    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_category" ON "expenses" ("category_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_category" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum" AS ENUM('fuel', 'maintenance', 'repair', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD "category" "public"."expenses_category_enum"`,
    );

    // Categories added after this migration have no enum member; they fall back
    // to 'other', which is lossy but keeps the column NOT NULL.
    await queryRunner.query(
      `UPDATE "expenses" SET "category" = (
         CASE c.slug
           WHEN 'fuel' THEN 'fuel'
           WHEN 'maintenance' THEN 'maintenance'
           WHEN 'repair' THEN 'repair'
           ELSE 'other'
         END
       )::"public"."expenses_category_enum"
       FROM "expense_categories" c
       WHERE "expenses"."category_id" = c.id`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ALTER COLUMN "category" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_expenses_category"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "category_id"`);

    await queryRunner.query(
      `ALTER TABLE "expense_categories" DROP CONSTRAINT "FK_expense_categories_owner"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_expense_categories_owner_slug"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_expense_categories_owner"`);
    await queryRunner.query(`DROP TABLE "expense_categories"`);
    await queryRunner.query(
      `DROP TYPE "public"."expense_categories_color_enum"`,
    );
  }
}
