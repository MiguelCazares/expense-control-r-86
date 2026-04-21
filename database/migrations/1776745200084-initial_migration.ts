import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1776745200084 implements MigrationInterface {
  name = 'InitialMigration1776745200084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "owners" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying(255) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_df4ef717018c5dc7bd3f4ab0de5" UNIQUE ("email"), CONSTRAINT "PK_42838282f2e6b216301a70b02d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "drivers" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "license" character varying(50) NOT NULL, "phone" character varying(20), "active" boolean NOT NULL DEFAULT true, "owner_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f2bcee71f1559dc5f53a9bacc38" UNIQUE ("license"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb523f1c1e61e112525e3c27bd" ON "drivers" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "buses" ("id" SERIAL NOT NULL, "plate" character varying(20) NOT NULL, "number" character varying(20) NOT NULL, "model" character varying(100) NOT NULL, "brand" character varying(100) NOT NULL, "year" integer NOT NULL, "route" character varying(150) NOT NULL, "active" boolean NOT NULL DEFAULT true, "owner_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ddebc0eeba64a019ae072975947" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_710625edaeda6d40fcc91bd3e7" ON "buses" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "income" ("id" SERIAL NOT NULL, "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "notes" text, "bus_id" integer NOT NULL, "shift_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_29a10f17b97568f70cee8586d58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e0cccd49a307ed042ad0a32e5" ON "income" ("bus_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9de85170c43f6209f853e192b7" ON "income" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum" AS ENUM('fuel', 'maintenance', 'repair', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" SERIAL NOT NULL, "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "category" "public"."expenses_category_enum" NOT NULL, "description" text, "bus_id" integer NOT NULL, "shift_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0c0e49efaaa855d58d6dd7b17" ON "expenses" ("bus_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8220647a9e8ba971320a94d49" ON "expenses" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shifts_status_enum" AS ENUM('open', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" SERIAL NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME, "status" "public"."shifts_status_enum" NOT NULL DEFAULT 'open', "notes" text, "driver_id" integer NOT NULL, "bus_id" integer NOT NULL, "owner_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66f293515d51551bf0c492c5ef" ON "shifts" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c1955fa18b1811a884c7599e7" ON "shifts" ("bus_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36aa0a02c48e4081769f053a40" ON "shifts" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_assignments" ("id" SERIAL NOT NULL, "date" date NOT NULL, "active" boolean NOT NULL DEFAULT true, "driver_id" integer NOT NULL, "bus_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b72677caff7b7e9acad3d55b3ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b70749e81638d9f7e532c8b9a" ON "driver_assignments" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7986b47415cd0733db9989d598" ON "driver_assignments" ("bus_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK_cb523f1c1e61e112525e3c27bd4" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "buses" ADD CONSTRAINT "FK_710625edaeda6d40fcc91bd3e7c" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" ADD CONSTRAINT "FK_3e0cccd49a307ed042ad0a32e52" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" ADD CONSTRAINT "FK_9de85170c43f6209f853e192b7a" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_b0c0e49efaaa855d58d6dd7b178" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_b8220647a9e8ba971320a94d49a" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_66f293515d51551bf0c492c5ef5" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_0c1955fa18b1811a884c7599e7f" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_36aa0a02c48e4081769f053a40c" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_assignments" ADD CONSTRAINT "FK_3b70749e81638d9f7e532c8b9a2" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_assignments" ADD CONSTRAINT "FK_7986b47415cd0733db9989d598d" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "driver_assignments" DROP CONSTRAINT "FK_7986b47415cd0733db9989d598d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_assignments" DROP CONSTRAINT "FK_3b70749e81638d9f7e532c8b9a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "FK_36aa0a02c48e4081769f053a40c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "FK_0c1955fa18b1811a884c7599e7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "FK_66f293515d51551bf0c492c5ef5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_b8220647a9e8ba971320a94d49a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_b0c0e49efaaa855d58d6dd7b178"`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" DROP CONSTRAINT "FK_9de85170c43f6209f853e192b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" DROP CONSTRAINT "FK_3e0cccd49a307ed042ad0a32e52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "buses" DROP CONSTRAINT "FK_710625edaeda6d40fcc91bd3e7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "FK_cb523f1c1e61e112525e3c27bd4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7986b47415cd0733db9989d598"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b70749e81638d9f7e532c8b9a"`,
    );
    await queryRunner.query(`DROP TABLE "driver_assignments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36aa0a02c48e4081769f053a40"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c1955fa18b1811a884c7599e7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66f293515d51551bf0c492c5ef"`,
    );
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(`DROP TYPE "public"."shifts_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8220647a9e8ba971320a94d49"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0c0e49efaaa855d58d6dd7b17"`,
    );
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9de85170c43f6209f853e192b7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e0cccd49a307ed042ad0a32e5"`,
    );
    await queryRunner.query(`DROP TABLE "income"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_710625edaeda6d40fcc91bd3e7"`,
    );
    await queryRunner.query(`DROP TABLE "buses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb523f1c1e61e112525e3c27bd"`,
    );
    await queryRunner.query(`DROP TABLE "drivers"`);
    await queryRunner.query(`DROP TABLE "owners"`);
  }
}
