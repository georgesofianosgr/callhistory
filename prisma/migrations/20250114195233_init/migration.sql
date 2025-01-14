-- CreateEnum
CREATE TYPE "CallEventType" AS ENUM ('CALL_STARTED', 'CALL_ENDED');

-- CreateTable
CREATE TABLE "Call" (
    "id" UUID NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "callId" UUID NOT NULL,
    "type" "CallEventType" NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "started_at" TIMESTAMP(6),
    "ended_at" TIMESTAMP(6),

    CONSTRAINT "CallEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CallEvent" ADD CONSTRAINT "CallEvent_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
