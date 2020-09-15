import * as http from "http"

import { Server, IServerParams, LobbyRoom, Router } from "magx"

// Import demo room handlers
import {
  MosxChatRoom,
  ChatRoom,
  StateHandlerRoom,
  OpenWorldRoom,
  ReconnectionRoom,
} from "./rooms"

export const createServer = (params?: IServerParams<any>) => {

  const server = http.createServer()

  const magx = new Server(server, params)
    .define("mosxChat", MosxChatRoom)
    .define("lobby", LobbyRoom, { watch: ["mosxChat", "chat", "state_handler", "reconnection"] })
    .define("chat", ChatRoom, {
      custom_options: "you can use me on Room#onCreate",
    })
    .define("state_handler", StateHandlerRoom)
    .define("open_world", OpenWorldRoom)
    .define("reconnection", ReconnectionRoom)

  // attach public dir routes
  magx.router.attach(Router.static(__dirname + "/../public"))

  return server
}
