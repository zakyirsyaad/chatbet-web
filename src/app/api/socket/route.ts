// pages/api/socket.ts
import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Welcome to the Socket.IO server!");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", (chatGroupId) => {
    socket.join(chatGroupId);
    console.log(`User joined room: ${chatGroupId}`);
  });

  socket.on("sendMessage", ({ chatGroupId, sender, content }) => {
    io.to(chatGroupId).emit("receiveMessage", {
      sender,
      content,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export default server;
