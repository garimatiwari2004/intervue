import { io } from "socket.io-client";

console.log("SOCKET URL:", import.meta.env.VITE_SOCKET_URL);

export const socket = io(
  import.meta.env.VITE_SOCKET_URL,
  {
    transports: ["websocket"],
  }
);