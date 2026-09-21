-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappSent" BOOLEAN NOT NULL DEFAULT false;
