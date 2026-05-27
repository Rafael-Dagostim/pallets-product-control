-- AlterTable: rename document -> login on users
ALTER TABLE "users" RENAME COLUMN "document" TO "login";

-- DropIndex (old)
DROP INDEX "users_document_key";

-- CreateIndex (new)
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AlterTable: rename corporate_name -> additional_info on customers
ALTER TABLE "customers" RENAME COLUMN "corporate_name" TO "additional_info";
