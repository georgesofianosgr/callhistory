import http from "http";
import parse from "co-body";
import z from "zod";
import pgClient from "./db";

const CallStartedEventSchema = z.object({
  call_id: z.string(),
  from: z.string(),
  to: z.string(),
  started: z.string(),
});

const CallEndedEventSchema = z.object({
  call_id: z.string(),
  from: z.string(),
  to: z.string(),
  ended: z.string(),
});

const CallEventSchema = z.union([CallStartedEventSchema, CallEndedEventSchema]);

type CallEvent = z.infer<typeof CallEventSchema>;
type CallStartedEvent = z.infer<typeof CallStartedEventSchema>;
type CallEndedEvent = z.infer<typeof CallEndedEventSchema>;

const logger = {
  error: (err: any) => console.error(err),
};

const isCallStartedEvent = (
  data: z.infer<typeof CallEventSchema>,
): data is CallStartedEvent => {
  return true;
};

const isCallEndedEvent = (
  data: z.infer<typeof CallEventSchema>,
): data is CallEndedEvent => {
  return true;
};

const handleEvents = async (data: z.infer<typeof CallEventSchema>) => {
  console.log("handling events", data);

  if (isCallStartedEvent(data)) {
    console.log("handling started", data);

    const result = await pgClient.query("SELECT NOW()");
    console.log("res", result.rows);

    // callStartedHanlder()
  } else if (isCallEndedEvent(data)) {
    console.log("handling ended", data);
    // callEndedHanlder()
  } else {
    logger.error("Unknown event type");
  }
};

// const callStartedHanlder = () => {
//   // create a flying promise instead of a background job system
//   return "";
// };
// const callEndedHanlder = () => {
//   // create a flying promise instead of a background job system
//   return "";
// };

const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>,
) => {
  // Routing
  if (req.method === "POST" && req.url === "/events") {
    // 1. parse data or throw bad request
    let data: CallEvent;
    try {
      const unverifiedData = await parse.json(req);
      data = CallEventSchema.parse(unverifiedData);
    } catch (err) {
      logger.error(err);
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request");
      return;
    }

    // 2. answer (low latency)
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();

    // 3. handle the event
    void handleEvents(data).catch(logger.error);
  } else if (req.method === "POST" && req.url === "/calls") {
    // TODO: implement list of failed calls
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
};

// Make sure we log unhandled rejections and keep server running
const errorMiddleware =
  (handler: typeof requestHandler) =>
    (
      req: http.IncomingMessage,
      res: http.ServerResponse<http.IncomingMessage>,
    ) => {
      try {
        return handler(req, res);
      } catch (err) {
        logger.error(`Unhandled rejection: ${err}`);
      }
    };

const server = http.createServer(errorMiddleware(requestHandler));

const setupServer = async () => {
  await pgClient.connect();

  const port = 3000;
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

setupServer().catch(logger.error);
