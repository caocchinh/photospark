import {Socket} from "socket.io";
import {logger} from "../utils";

export const handleConnection = (socket: Socket) => {
  logger.info("Client connected", {
    socketId: socket.id,
  });
};

export const handleDisconnect = (socket: Socket) => {
  logger.info("Client disconnected", {socketId: socket.id});
};
