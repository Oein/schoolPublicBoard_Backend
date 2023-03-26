import { uid } from "uid";
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import prismadb from "./utils/prisma";
import getSocketioIp from "./socketIp";

const app = express();
const io = new Server({
  cors: {
    origin: ["https://wshm.oein.kr", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (client) => {
  let ip = getSocketioIp(client) || "Unknown";
  if (ip == "::1") ip = "127.0.0.1";
  if (ip == "0.0.0.0") ip = "127.0.0.1";
  if (ip == "localhost") ip = "127.0.0.1";
  client.on("join::room", async (roomid: string) => {
    let dt = await prismadb.post.count({
      where: {
        id: roomid,
      },
    });
    if (dt > 0) {
      client.join("ROOM." + roomid);
      client.emit("joined::room");
      return;
    }
    client.emit("room::not_found");
  });
  client.on("delChat", (data) => {
    let roomids = [...client.rooms].filter((i) => i.startsWith("ROOM."));
    if (roomids.length == 0) return;
    let roomid = roomids[0];
    io.to(roomid).emit("delChat", data);
  });
  client.on("chat", async (data) => {
    let roomids = [...client.rooms].filter((i) => i.startsWith("ROOM."));
    if (roomids.length == 0) return;
    let roomid = roomids[0].replace("ROOM.", "");
    let idu = uid(128);

    await prismadb.chat.create({
      data: {
        belongsTo: roomid,
        content: data,
        id: idu,
        ip: ip,
      },
    });

    client.emit("yourchat", idu);
    io.to(roomids[0]).emit("chat", {
      d: data,
      i: idu,
    });
  });
});

const httpServer = createServer(app);
io.listen(httpServer);
httpServer.listen(4000);
