import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785808035039 implements MigrationInterface {
  name = 'InitialSchema1785808035039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "waitlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_2dcf9ba7fd147c0227c0f283e3e" UNIQUE ("email"), CONSTRAINT "PK_d825b8fcdb753fda136c4039b3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2dcf9ba7fd147c0227c0f283e3" ON "waitlists" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "meeting_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "meetingGroupId" uuid NOT NULL, "email" character varying NOT NULL, "invitationState" character varying NOT NULL DEFAULT 'pending', "authState" character varying NOT NULL DEFAULT 'unauthorized', "required" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_11b2ca0d4243ea42bd47a32b9bc" UNIQUE ("meetingGroupId", "email"), CONSTRAINT "PK_994ee66a92de655fb478c038980" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b40aa18a5e9bb3a1cc54a2f27c" ON "meeting_participants" ("meetingGroupId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ea44b4ea0ea26a7eb67ddc9827" ON "meeting_participants" ("meetingGroupId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "meeting_slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meetingGroupId" uuid NOT NULL, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "rank" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_15e72a7453fa4255df28c7aec70" UNIQUE ("meetingGroupId", "rank"), CONSTRAINT "PK_24d7a8d5392f08491367af2b6df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meeting_attendees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "meetingId" uuid NOT NULL, "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "PK_b49884a61337dbfb2f3018710da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e7d6c5645e2bc11e1aa6d09cc" ON "meeting_attendees" ("meetingId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."meetings_status_enum" AS ENUM('scheduled', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "meetings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "externalEventId" character varying, "meetingGroupId" uuid NOT NULL, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "status" "public"."meetings_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "REL_f987ec065f4d1c300ff4dafc48" UNIQUE ("meetingGroupId"), CONSTRAINT "PK_aa73be861afa77eb4ed31f3ed57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f987ec065f4d1c300ff4dafc48" ON "meetings" ("meetingGroupId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."meeting_groups_status_enum" AS ENUM('open', 'finalized', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "meeting_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."meeting_groups_status_enum" NOT NULL DEFAULT 'open', "authorId" uuid NOT NULL, "calendarId" uuid NOT NULL, "summary" character varying NOT NULL, "magicLink" character varying, "description" character varying, "location" character varying, "duration" integer NOT NULL, "after" TIMESTAMP NOT NULL, "before" TIMESTAMP NOT NULL, "timezone" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "PK_5066dff026ebbca5ad6bdd616b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "userId" uuid NOT NULL, "providerId" character varying NOT NULL, "externalId" character varying NOT NULL, "name" character varying NOT NULL, "timezone" character varying NOT NULL, "enabled" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_4ccd8155ef8009ebe454816c42f" UNIQUE ("userId", "externalId", "providerId"), CONSTRAINT "PK_90dc0330e8ec9028e23c290dee8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_335d9e9af743fe91668b8f0d6f" ON "calendars" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_providerid_enum" AS ENUM('credentials', 'google')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "accountId" character varying NOT NULL, "providerId" "public"."accounts_providerid_enum" NOT NULL, "accessToken" character varying, "refreshToken" character varying, "accessTokenExpiresAt" TIMESTAMP, "refreshTokenExpiresAt" TIMESTAMP, "scope" character varying, "idToken" character varying, "password" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_071945e28e6028d194098630206" UNIQUE ("userId", "providerId"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "ipAddress" character varying, "userAgent" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_e9f62f5dcb8a54b84234c9e7a06" UNIQUE ("token"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "availability_overrides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "date" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "isAvailable" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_e641b69750fe08dbac13fa6259b" UNIQUE ("userId", "date", "startTime", "endTime"), CONSTRAINT "PK_6538072d7a05f95e5c1444a10ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ac0a6fce7e02efb4052d3ff33" ON "availability_overrides" ("userId", "date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "availabilities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "dayOfWeek" integer NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "isAvailable" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_08b7fd7f206bc66a9bae67f057c" UNIQUE ("userId", "dayOfWeek", "startTime", "endTime", "isAvailable"), CONSTRAINT "PK_9562bd8681d40361b1a124ea52c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99694a3d42469fb1633247f228" ON "availabilities" ("userId", "dayOfWeek") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "emailVerified" boolean NOT NULL, "timezone" character varying, "image" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying NOT NULL, "value" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "deletedAt" TIMESTAMP, "deletedBy" character varying, CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1d33a8992164b361ad932e899" ON "verifications" ("identifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_participants" ADD CONSTRAINT "FK_7513a0c94f27d1ea7842a8be6ea" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_participants" ADD CONSTRAINT "FK_ea44b4ea0ea26a7eb67ddc98271" FOREIGN KEY ("meetingGroupId") REFERENCES "meeting_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_slots" ADD CONSTRAINT "FK_8e3c43d2a4bda217d2f1b0b3bce" FOREIGN KEY ("meetingGroupId") REFERENCES "meeting_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_attendees" ADD CONSTRAINT "FK_b86573f82432120ef02a6c54655" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_attendees" ADD CONSTRAINT "FK_9a43754fb3b554f3968e209e7b6" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meetings" ADD CONSTRAINT "FK_f987ec065f4d1c300ff4dafc489" FOREIGN KEY ("meetingGroupId") REFERENCES "meeting_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_groups" ADD CONSTRAINT "FK_9bf0ae9bff49379fa5a4d51c1c3" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_groups" ADD CONSTRAINT "FK_8b4401d7335605743e7d9fab338" FOREIGN KEY ("calendarId") REFERENCES "calendars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendars" ADD CONSTRAINT "FK_2ccdc51727aa490245c0fb9a760" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendars" ADD CONSTRAINT "FK_335d9e9af743fe91668b8f0d6fd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "availability_overrides" ADD CONSTRAINT "FK_3baf090ca08029931dbd114a6cc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "availabilities" ADD CONSTRAINT "FK_4cf4c255dc6d83b9e978a5ab0a0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "availabilities" DROP CONSTRAINT "FK_4cf4c255dc6d83b9e978a5ab0a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "availability_overrides" DROP CONSTRAINT "FK_3baf090ca08029931dbd114a6cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendars" DROP CONSTRAINT "FK_335d9e9af743fe91668b8f0d6fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendars" DROP CONSTRAINT "FK_2ccdc51727aa490245c0fb9a760"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_groups" DROP CONSTRAINT "FK_8b4401d7335605743e7d9fab338"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_groups" DROP CONSTRAINT "FK_9bf0ae9bff49379fa5a4d51c1c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meetings" DROP CONSTRAINT "FK_f987ec065f4d1c300ff4dafc489"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_attendees" DROP CONSTRAINT "FK_9a43754fb3b554f3968e209e7b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_attendees" DROP CONSTRAINT "FK_b86573f82432120ef02a6c54655"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_slots" DROP CONSTRAINT "FK_8e3c43d2a4bda217d2f1b0b3bce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_participants" DROP CONSTRAINT "FK_ea44b4ea0ea26a7eb67ddc98271"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meeting_participants" DROP CONSTRAINT "FK_7513a0c94f27d1ea7842a8be6ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b1d33a8992164b361ad932e899"`,
    );
    await queryRunner.query(`DROP TABLE "verifications"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99694a3d42469fb1633247f228"`,
    );
    await queryRunner.query(`DROP TABLE "availabilities"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ac0a6fce7e02efb4052d3ff33"`,
    );
    await queryRunner.query(`DROP TABLE "availability_overrides"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_providerid_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_335d9e9af743fe91668b8f0d6f"`,
    );
    await queryRunner.query(`DROP TABLE "calendars"`);
    await queryRunner.query(`DROP TABLE "meeting_groups"`);
    await queryRunner.query(`DROP TYPE "public"."meeting_groups_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f987ec065f4d1c300ff4dafc48"`,
    );
    await queryRunner.query(`DROP TABLE "meetings"`);
    await queryRunner.query(`DROP TYPE "public"."meetings_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e7d6c5645e2bc11e1aa6d09cc"`,
    );
    await queryRunner.query(`DROP TABLE "meeting_attendees"`);
    await queryRunner.query(`DROP TABLE "meeting_slots"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ea44b4ea0ea26a7eb67ddc9827"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b40aa18a5e9bb3a1cc54a2f27c"`,
    );
    await queryRunner.query(`DROP TABLE "meeting_participants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2dcf9ba7fd147c0227c0f283e3"`,
    );
    await queryRunner.query(`DROP TABLE "waitlists"`);
  }
}
