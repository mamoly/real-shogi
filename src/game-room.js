import { DurableObject } from "cloudflare:workers";

const PIECE_CODE = {
  "歩": "fu",
  "香": "kyo",
  "桂": "kei",
  "銀": "gin",
  "金": "kin",
  "角": "kaku",
  "飛": "hi",
  "王": "ou"
};

function createPiece(owner, kind, index) {
  return {
    id: `${owner}-${PIECE_CODE[kind]}-${index}`,
    owner,
    kind,
    promoted: false
  };
}

function createInitialBoard() {
  return [
    [
      createPiece("gote", "香", 1),
      createPiece("gote", "桂", 1),
      createPiece("gote", "銀", 1),
      createPiece("gote", "金", 1),
      createPiece("gote", "王", 1),
      createPiece("gote", "金", 2),
      createPiece("gote", "銀", 2),
      createPiece("gote", "桂", 2),
      createPiece("gote", "香", 2)
    ],
    [
      null,
      createPiece("gote", "角", 1),
      null,
      null,
      null,
      null,
      null,
      createPiece("gote", "飛", 1),
      null
    ],
    Array.from({ length: 9 }, (_, index) => createPiece("gote", "歩", index + 1)),
    Array.from({ length: 9 }, () => null),
    Array.from({ length: 9 }, () => null),
    Array.from({ length: 9 }, () => null),
    Array.from({ length: 9 }, (_, index) => createPiece("sente", "歩", index + 1)),
    [
      null,
      createPiece("sente", "飛", 1),
      null,
      null,
      null,
      null,
      null,
      createPiece("sente", "角", 1),
      null
    ],
    [
      createPiece("sente", "香", 1),
      createPiece("sente", "桂", 1),
      createPiece("sente", "銀", 1),
      createPiece("sente", "金", 1),
      createPiece("sente", "王", 1),
      createPiece("sente", "金", 2),
      createPiece("sente", "銀", 2),
      createPiece("sente", "桂", 2),
      createPiece("sente", "香", 2)
    ]
  ];
}

function createGameState() {
  return {
    phase: "lobby",
    currentTurn: "sente",
    moveNumber: 1,
    board: createInitialBoard(),
    captured: {
      sente: [],
      gote: []
    }
  };
}

function createDefaultRoomState() {
  return {
    roomId: null,
    createdAt: null,
    players: [],
    status: "waiting",
    game: createGameState()
  };
}

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sessions = new Set();
    this.roomState = createDefaultRoomState();
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get("roomState");
      if (stored) {
        this.roomState = stored;
      }
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/init" && request.method === "POST") {
      const payload = await request.json();
      if (!this.roomState.roomId) {
        this.roomState = {
          roomId: payload.roomId,
          createdAt: new Date().toISOString(),
          players: [],
          status: "waiting",
          game: createGameState()
        };
        await this.saveState();
      }

      return Response.json(this.roomState);
    }

    if (!this.roomState.roomId) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (url.pathname === "/ws") {
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

  async webSocketMessage(ws, message) {
    let payload;

    try {
      payload = JSON.parse(message);
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    if (payload.type === "join") {
      const exists = this.roomState.players.find((entry) => entry.id === payload.playerId);

      if (!exists && this.roomState.players.length >= 2) {
        ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
        return;
      }

      if (exists) {
        exists.name = payload.name ?? exists.name;
      } else {
        this.roomState.players.push({
          id: payload.playerId,
          name: payload.name ?? "guest",
          seat: this.roomState.players.length === 0 ? "sente" : "gote"
        });
      }

      this.roomState.status = this.roomState.players.length === 2 ? "ready" : "waiting";
      this.roomState.game.phase = this.roomState.players.length === 2 ? "ready" : "lobby";
      await this.saveState();

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

  async saveState() {
    await this.ctx.storage.put("roomState", this.roomState);
  }

  broadcast(payload) {
    const encoded = JSON.stringify(payload);
    for (const session of this.sessions) {
      session.send(encoded);
    }
  }
}
