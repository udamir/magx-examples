import { Mosx, mx } from "mosx"

@mx.Object.private // private object
export class ChatMessage extends Mosx {
  // public properties
  @mx public id: string
  @mx public userId: string
  @mx public text: string
  @mx public date: number

  constructor(owner: Mosx, { userId, text }: any) {
    super(owner)
    this.id = Math.random().toString(36).substr(2)
    this.userId = userId
    this.text = text
    this.date = Date.now()
  }
}

export class ChatUser extends Mosx {
  // public properties
  @mx public id: string
  @mx public name: string
  @mx public typing: boolean
  @mx public online: boolean
  // private property
  @mx.private public messages: number

  public privateTag: string

  constructor(owner: Mosx, { id, name }: any) {
    super(owner)
    this.id = id
    this.name = name
    this.typing = false
    this.online = true
    this.messages = 0
    this.privateTag = Math.random().toString(36).slice(3)
    Mosx.addTag(this, this.privateTag)
  }

  public setTyping(value: boolean) {
    this.typing = value
  }

  public sendMessage(text: string, to?: string[]) {
    const state = Mosx.getParent(this) as ChatState
    state.addMessage(this, text, to)
    this.messages++
  }
}

export class ChatState extends Mosx {
  // public properties
  @mx.map(ChatUser) public users = new Map<string, ChatUser>()
  @mx.array(ChatMessage) public messages = new Array<ChatMessage>()

  public publicTag: string = "public"

  public addUser(id: string, data: any) {
    const user = new ChatUser(this, { id, ...data })
    this.users.set(id, user)
    return user
  }

  public removeUser(sessionId: string) {
    this.users.delete(sessionId)
  }

  public addMessage(from: ChatUser, text: string, to?: string[]) {
    const message = new ChatMessage(from, { userId: from.id, text })
    if (to && to.length) {
      to.forEach((userId) => {
        const user = this.users.get(userId)
        if (user) {
          // add client's tag to message
          Mosx.addTag(message, user.privateTag)
        }
      })
    } else {
      // add public tag to message
      Mosx.addTag(message, this.publicTag)
    }
    // push will trigger patches for all
    this.messages.push(message)
  }
}
