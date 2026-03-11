-- Enforce the operational rule that one driver can only be assigned to one vehicle at a time.
CREATE UNIQUE INDEX "Vehicle_assignedDriverId_key" ON "Vehicle"("assignedDriverId");