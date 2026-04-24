-- Move any existing REFORMED records to VERIFIED (VERIFIED now subsumes REFORMED)
UPDATE "production_histories" SET "status" = 'VERIFIED' WHERE "status" = 'REFORMED';

-- Recreate the enum without REFORMED
ALTER TYPE "ProductionStatus" RENAME TO "ProductionStatus_old";
CREATE TYPE "ProductionStatus" AS ENUM ('OPEN', 'VERIFIED', 'CANCELED', 'PAID');
ALTER TABLE "production_histories" ALTER COLUMN "status" TYPE "ProductionStatus" USING ("status"::text::"ProductionStatus");
DROP TYPE "ProductionStatus_old";
