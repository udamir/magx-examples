import { Room, Client } from "magx"
import { Mosx, mx } from "mosx"

@mx.Object
export class Player {
  @mx.number
  public x = Math.floor(Math.random() * 400)

  @mx.number
  public y = Math.floor(Math.random() * 400)
}

@mx.Object
export class State {
  @mx.map(Player)
  public players = new Map<string, Player>()

  public something = "This attribute won't be sent to the client-side"

  public createPlayer(id: string) {
    const player = new Player()
    this.players.set(id, player)
    Mosx.setParent(player, this)
  }

  public removePlayer(id: string) {
    this.players.delete(id)
  }

  public movePlayer(id: string, movement: any) {
    const player = this.players.get(id)
    if (!player) { return }
    player.x += movement.x ? movement.x * 10 : 0
    player.y += movement.y ? movement.y * 10 : 0
  }
}

export class StateHandlerRoom extends Room<State> {

  public createState(): any {
    // create state
    return new State()
  }

  public createPatchTracker(state: State) {
    // create state change tracker
    return Mosx.createTracker(state)
  }

  public onCreate(params: any) {
    console.log("StateHandlerRoom created!", params)
  }

  public onMessage(client: Client, type: string, data: any) {
    if (type === "move") {
      console.log("StateHandlerRoom received message from", client.id, ":", data)
      this.state.movePlayer(client.id, data)
    }
  }

  public onJoin(client: Client, params: any) {
    console.log(params)
    client.send("hello", "world")
    this.state.createPlayer(client.id)
  }

  public onLeave(client: Client) {
      this.state.removePlayer(client.id)
  }

  public onClose() {
    console.log("StateHandlerRoom closed!")
  }
}
