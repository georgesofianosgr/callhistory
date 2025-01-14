import z from "zod";

export const CallStartedEventSchema = z.object({
  call_id: z.string(),
  from: z.string(),
  to: z.string(),
  started: z.string(),
});

export const CallEndedEventSchema = z.object({
  call_id: z.string(),
  from: z.string(),
  to: z.string(),
  ended: z.string(),
});

export const CallEventSchema = z.union([
  CallStartedEventSchema,
  CallEndedEventSchema,
]);

export type CallEvent = z.infer<typeof CallEventSchema>;
export type CallStartedEvent = z.infer<typeof CallStartedEventSchema>;
export type CallEndedEvent = z.infer<typeof CallEndedEventSchema>;

export const isCallStartedEvent = (
  data: z.infer<typeof CallEventSchema>,
): data is CallStartedEvent => {
  return "started" in data && !!data.started;
};

export const isCallEndedEvent = (
  data: z.infer<typeof CallEventSchema>,
): data is CallEndedEvent => {
  return "ended" in data && !!data.ended;
};
