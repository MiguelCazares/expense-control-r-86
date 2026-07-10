import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLapsToShifts1783702160515 implements MigrationInterface {
  name = 'AddLapsToShifts1783702160515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shifts" ADD "laps" numeric(4,1)`);
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "CHK_shifts_laps" CHECK ("laps" IS NULL OR ("laps" >= 0 AND "laps" * 2 = FLOOR("laps" * 2)))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "CHK_shifts_laps"`,
    );
    await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN "laps"`);
  }
}
