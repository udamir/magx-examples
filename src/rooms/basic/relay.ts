import { Room, Client } from "magx"

export class RelayRoom extends Room {
  public reconnectionTime!: number
  public maxClients!: number

  public onCreate(params: any) {
    params = params || {} as any
    this.reconnectionTime = params.reconnectionTime || 60
    this.maxClients = params.maxClients || Infinity
    this.data = params
  }

  public onMessage(client: Client, type: string, data: any) {
    this.broadcast(type, { id: client.id, data })
  }

  public onJoin(client: Client) {
    if (this.clients.size < this.maxClients) {
      this.broadcast("join", { id: client.id, data: client.auth.data })
    } else {
      throw new Error("Room is full!")
    }
  }

  public async onLeave(client: Client, consented?: boolean) {

    if (!consented && this.reconnectionTime > 0) {
      try {
        // wait for reconnection
        client = await this.waitReconnection(client, this.reconnectionTime)
        return
      } catch (error) {
        console.log(error)
      }
    }

    this.broadcast("leave", { id: client.id })
  }

  public onClose() {
    console.log("ChatRoom closed!")
  }

}
