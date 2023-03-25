import { uid } from "uid";
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import prismadb from "./utils/prisma";

const app = express();
const io = new Server({
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (client) => {
  let ip =
    client.conn.remoteAddress ||
    client.request.socket.remoteAddress ||
    "Unknown";
  console.log("New connection established!");
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
    console.log([...client.rooms]);
    if (roomids.length == 0) return;
    let roomid = roomids[0];
    io.to(roomid).emit("delChat", data);
  });
  client.on("chat", async (data) => {
    let roomids = [...client.rooms].filter((i) => i.startsWith("ROOM."));
    console.log([...client.rooms]);
    if (roomids.length == 0) return;
    let roomid = roomids[0].replace("ROOM.", "");
    let idu = uid(128);
    client.emit("yourchat", idu);

    io.to(roomids[0]).emit("chat", {
      d: data,
      i: idu,
    });

    await prismadb.chat.create({
      data: {
        belongsTo: roomid,
        content: data,
        id: idu,
        ip: ip,
      },
    });
  });
});

const httpServer = createServer(app);
io.listen(httpServer);
httpServer.listen(4000);
