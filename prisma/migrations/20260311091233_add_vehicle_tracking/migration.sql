-- CreateTable
CREATE TABLE "VehicleLocationPing" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT,
    "tripId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speedKph" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "accuracyM" DOUBLE PRECISION,
    "batteryLevel" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleLocationPing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleLocationPing_vehicleId_recordedAt_idx" ON "VehicleLocationPing"("vehicleId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "VehicleLocationPing_driverId_recordedAt_idx" ON "VehicleLocationPing"("driverId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "VehicleLocationPing_tripId_recordedAt_idx" ON "VehicleLocationPing"("tripId", "recordedAt" DESC);

-- AddForeignKey
ALTER TABLE "VehicleLocationPing" ADD CONSTRAINT "VehicleLocationPing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleLocationPing" ADD CONSTRAINT "VehicleLocationPing_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleLocationPing" ADD CONSTRAINT "VehicleLocationPing_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
