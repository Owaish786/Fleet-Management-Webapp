/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,licenseNumber]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,plateNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Driver_licenseNumber_key";

-- DropIndex
DROP INDEX "Vehicle_plateNumber_key";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "MaintenanceRecord" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_ownerId_licenseNumber_key" ON "Driver"("ownerId", "licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_ownerId_plateNumber_key" ON "Vehicle"("ownerId", "plateNumber");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
