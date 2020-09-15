import { Room, Client } from "magx"
import { Mosx } from "mosx"
import { OpenWorldState, IRect, IPoint } from "./state"

export class OpenWorldRoom extends Room<OpenWorldState> {
  public rect!: IRect
  public size!: number

  public createState(): any {
    // create state
    return new OpenWorldState(this.rect)
  }

  public createPatchTracker(state: OpenWorldState) {
    // create state change tracker
    return Mosx.createTracker(state)
  }

  public onCreate(params: { options: { id: string, size: number }}) {
    console.log("StateHandlerRoom created!", params)
    const { id, size } = params.options
    const [ x, y ] = id.split(":")
    this.size = size || 200
    this.data = { id }

    this.rect = {
      left: Number(x) * this.size,
      right: Number(x) * this.size + this.size,
      top: Number(y) * this.size,
      bottom: Number(y) * this.size + this.size,
    }
  }

  public onMessage(client: Client, type: string, pos: IPoint) {
    if (type === "move") {
      console.log("StateHandlerRoom received message from", client.id, ":", pos)
      this.state.movePlayer(client.id, pos)
    }
  }

  public randomPos() {
    return {
      x: Math.floor(Math.random() * this.size) + this.rect.left,
      y: Math.floor(Math.random() * this.size) + this.rect.top,
    }
  }

  public onJoin(client: Client, params: { pos: IPoint, color: string }) {
    console.log(params)

    const colors = ["red", "green", "yellow", "blue", "cyan", "magenta"]

    const color = params.color || colors[Math.floor(Math.random() * colors.length)]
    const pos = params.pos || this.randomPos()

    client.send("hello", "world")
    this.state.createPlayer(client.id, pos, color)
    this.updateTrackingParams(client, { tags: "visible" })
  }

  // when the user disconnects, wait for reconnection
  public async onLeave(client: Client, consented?: boolean) {

    if (!consented) {
      try {
        // wait for reconnection
        client = await this.waitReconnection(client, 60)
        console.log("Reconnected!")

        client.send("status", "Welcome back!")

        return
      } catch (error) {
        console.log(error)
      }
    }

    this.state.removePlayer(client.id)
  }

  public onClose() {
    console.log("StateHandlerRoom closed!")
  }
}
