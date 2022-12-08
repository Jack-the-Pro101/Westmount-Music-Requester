import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway({
  namespace: "requests",
})
export class RequestGateway {
  @SubscribeMessage("requests")
  handle() {
    return true;
  }
}
