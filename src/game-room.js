import { DurableObject } from "cloudflare:workers";

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sessions = new Set();
    this.roomState = {
      roomId: ctx.id.toString(),
      createdAt: new Date().toISOString(),
      players: [],
      status: "waiting"
    };
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/ws")) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected websocket", { status: 426 });
      }

      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === "GET") {
      return Response.json(this.roomState);
    }

    return new Response("Not found", { status: 404 });
  }

  webSocketMessage(ws, message) {
    let payload;

    try {
      payload = JSON.parse(message);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    if (payload.type === "join") {
      const player = {
        id: payload.playerId,
        name: payload.name ?? "guest"
      };

      const exists = this.roomState.players.some((entry) => entry.id === player.id);
      if (!exists && this.roomState.players.length < 2) {
        this.roomState.players.push(player);
      }

      if (this.roomState.players.length === 2) {
        this.roomState.status = "ready";
      }

      ws.send(JSON.stringify({ type: "joined", room: this.roomState }));
      this.broadcast({ type: "room_state", room: this.roomState });
      return;
    }

    ws.send(JSON.stringify({ type: "echo", payload }));
  }

  webSocketClose(ws) {
    this.sessions.delete(ws);
  }

  acceptWebSocket(ws) {
    this.ctx.acceptWebSocket(ws);
    this.sessions.add(ws);
    ws.send(JSON.stringify({ type: "connected", room: this.roomState }));
  }

  broadcast(payload) {
    const encoded = JSON.stringify(payload);
    for (const session of this.sessions) {
      session.send(encoded);
    }
  }
}
