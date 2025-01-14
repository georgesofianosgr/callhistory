import http from "http";
import parse from "co-body";
import { prisma } from "./libs/prisma";
import { addHours } from "date-fns";
import { CallEvent, CallEventSchema } from "./eventHandler.types";
import { handleEvents } from "./eventHandler";

const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage>,
) => {
  // Check authorization
  const authorization = req.headers["authorization"];
  const machineToken = authorization?.replace("Bearer ", "");
  if (machineToken !== "CommunityPhone") {
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized");
    console.warn("Unauthorized");
    return;
  }

  if (req.method === "POST" && req.url === "/events") {
    // Check input
    let data: CallEvent;
    try {
      const unverifiedData = await parse.json(req);
      data = CallEventSchema.parse(unverifiedData);
    } catch (err) {
      console.error(err);
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request");
      return;
    }

    // Respond to client
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();

    // Handle the event - save to db etc
    void handleEvents(data).catch(console.error);
  } else if (req.method === "GET" && req.url === "/metrics/failures") {
    const twoHoursAgo = addHours(new Date(), -2);
    const oneHourAgo = addHours(new Date(), -1);

    const count = await prisma.callEvent.count({
      where: {
        type: "CALL_STARTED",
        started_at: {
          gte: twoHoursAgo,
          lte: oneHourAgo, // to exclude calls that still may be running
        },
        Call: {
          duration: null,
        },
      },
    });

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(JSON.stringify({ count }));
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
        console.error(`Unhandled rejection: ${err}`);
      }
    };

const server = http.createServer(errorMiddleware(requestHandler));

const setupServer = async () => {
  const port = 3000;
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

setupServer().catch(console.error);
