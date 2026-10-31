-- Append to the initial Prisma migration AFTER its CREATE TABLE statements.
-- This is migration source; it has not been applied to a database.
ALTER TABLE "group_classes"
  ADD CONSTRAINT "group_classes_capacity_positive"
    CHECK ("capacity" > 0),
  ADD CONSTRAINT "group_classes_enrollment_bounds"
    CHECK ("current_enrolled" >= 0 AND "current_enrolled" <= "capacity"),
  ADD CONSTRAINT "group_classes_valid_schedule"
    CHECK ("ends_at" > "starts_at");

ALTER TABLE "users"
  ADD CONSTRAINT "users_email_normalized"
    CHECK ("email" = lower(btrim("email")) AND "email" <> '');

ALTER TABLE "class_bookings"
  ADD CONSTRAINT "class_bookings_cancellation_consistent"
    CHECK (
      ("status" = 'CONFIRMED' AND "cancelled_at" IS NULL)
      OR
      ("status" = 'CANCELLED' AND "cancelled_at" IS NOT NULL)
    );
