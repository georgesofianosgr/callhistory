import z from "zod";
import { prisma } from "./libs/prisma";
import { differenceInSeconds } from "date-fns";
import {
  CallEndedEventSchema,
  CallEventSchema,
  CallStartedEventSchema,
  isCallEndedEvent,
  isCallStartedEvent,
} from "./eventHandler.types";

const handleStartedEvent = async (
  data: z.infer<typeof CallStartedEventSchema>,
) => {
  await prisma.call.create({ data: { id: data.call_id } });

  await prisma.callEvent.create({
    data: {
      callId: data.call_id,
      type: "CALL_STARTED",
      from: data.from,
      to: data.to,
      started_at: new Date(data.started),
    },
  });
};

const handleEndedEvent = async (data: z.infer<typeof CallEndedEventSchema>) => {
  const callEndedEvent = await prisma.callEvent.create({
    data: {
      callId: data.call_id,
      type: "CALL_ENDED",
      from: data.from,
      to: data.to,
      ended_at: new Date(data.ended),
    },
  });

  const callStartedEvent = await prisma.callEvent.findFirstOrThrow({
    where: {
      callId: data.call_id,
      type: "CALL_STARTED",
    },
  });

  if (!callStartedEvent?.started_at || !callEndedEvent.ended_at) {
    throw new Error("Error while parsing call events");
  }

  const duration = differenceInSeconds(
    callEndedEvent.ended_at,
    callStartedEvent.started_at,
  );

  await prisma.call.update({
    where: { id: data.call_id },
    data: { duration },
  });
};

export const handleEvents = async (data: z.infer<typeof CallEventSchema>) => {
  if (isCallStartedEvent(data)) {
    await handleStartedEvent(data);
  } else if (isCallEndedEvent(data)) {
    await handleEndedEvent(data);
  } else {
    console.warn("Unknown event type");
  }
};
