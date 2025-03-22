import {Server} from "socket.io";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import {
  handleConnection,
  handleDisconnect,
  handlePrint,
  handleProcessVideo,
  handleVideoUploadError,
  handleImageUploadError,
  PrintMessage,
  VideoMessage,
  VideoErrorMessage,
  ImageErrorMessage,
} from "./handlers";

dotenv.config();

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, {recursive: true});
}

const io = new Server(6969, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:5050"],
  },
  maxHttpBufferSize: Infinity,
});

io.on("connection", (socket) => {
  handleConnection(socket);

  socket.on("print", (message: PrintMessage, callback: any) => {
    handlePrint(socket, message, callback);
  });

  socket.on("process-video", (message: VideoMessage, callback: any) => {
    handleProcessVideo(socket, message, callback);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });

  socket.on("upload-video-error", (message: VideoErrorMessage) => {
    handleVideoUploadError(message);
  });

  socket.on("upload-image-error", (message: ImageErrorMessage) => {
    handleImageUploadError(message);
  });
});
