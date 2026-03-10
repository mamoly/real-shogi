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
    },
    result: null
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

function insideBoard(row, col) {
  return row >= 0 && row < 9 && col >= 0 && col < 9;
}

function directionFor(owner) {
  return owner === "sente" ? -1 : 1;
}

function findPiece(board, pieceId) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col]?.id === pieceId) {
        return {
          row,
          col,
          piece: board[row][col]
        };
      }
    }
  }

  return null;
}

function pushStepMove(board, owner, moves, row, col) {
  if (!insideBoard(row, col)) {
    return;
  }

  const target = board[row][col];
  if (!target) {
    moves.push({ row, col });
    return;
  }

  if (target.owner !== owner) {
    moves.push({ row, col });
  }
}

function pushRayMoves(board, owner, moves, startRow, startCol, deltaRow, deltaCol) {
  let row = startRow + deltaRow;
  let col = startCol + deltaCol;

  while (insideBoard(row, col)) {
    const target = board[row][col];
    if (!target) {
      moves.push({ row, col });
    } else {
      if (target.owner !== owner) {
        moves.push({ row, col });
      }
      break;
    }

    row += deltaRow;
    col += deltaCol;
  }
}

function goldLikeMoves(owner) {
  const forward = directionFor(owner);
  return [
    [forward, -1],
    [forward, 0],
    [forward, 1],
    [0, -1],
    [0, 1],
    [-forward, 0]
  ];
}

function kingLikeMoves() {
  return [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ];
}

function legalMovesForPiece(board, pieceInfo) {
  const moves = [];
  const { row, col, piece } = pieceInfo;
  const owner = piece.owner;
  const forward = directionFor(owner);

  if (piece.promoted && ["歩", "香", "桂", "銀"].includes(piece.kind)) {
    goldLikeMoves(owner).forEach(([deltaRow, deltaCol]) => {
      pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
    });
    return moves;
  }

  if (piece.kind === "歩") {
    pushStepMove(board, owner, moves, row + forward, col);
    return moves;
  }

  if (piece.kind === "香") {
    pushRayMoves(board, owner, moves, row, col, forward, 0);
    return moves;
  }

  if (piece.kind === "桂") {
    pushStepMove(board, owner, moves, row + forward * 2, col - 1);
    pushStepMove(board, owner, moves, row + forward * 2, col + 1);
    return moves;
  }

  if (piece.kind === "銀") {
    [
      [forward, -1],
      [forward, 0],
      [forward, 1],
      [-forward, -1],
      [-forward, 1]
    ].forEach(([deltaRow, deltaCol]) => {
      pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
    });
    return moves;
  }

  if (piece.kind === "金") {
    goldLikeMoves(owner).forEach(([deltaRow, deltaCol]) => {
      pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
    });
    return moves;
  }

  if (piece.kind === "王") {
    kingLikeMoves().forEach(([deltaRow, deltaCol]) => {
      pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
    });
    return moves;
  }

  if (piece.kind === "角") {
    [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ].forEach(([deltaRow, deltaCol]) => {
      pushRayMoves(board, owner, moves, row, col, deltaRow, deltaCol);
    });

    if (piece.promoted) {
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ].forEach(([deltaRow, deltaCol]) => {
        pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
      });
    }

    return moves;
  }

  if (piece.kind === "飛") {
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ].forEach(([deltaRow, deltaCol]) => {
      pushRayMoves(board, owner, moves, row, col, deltaRow, deltaCol);
    });

    if (piece.promoted) {
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
      ].forEach(([deltaRow, deltaCol]) => {
        pushStepMove(board, owner, moves, row + deltaRow, col + deltaCol);
      });
    }

    return moves;
  }

  return moves;
}

function sameSquare(a, b) {
  return a.row === b.row && a.col === b.col;
}

function seatForPlayer(roomState, playerId) {
  return roomState.players.find((player) => player.id === playerId)?.seat ?? null;
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

    if (url.pathname === "/legal-moves" && request.method === "GET") {
      const pieceId = url.searchParams.get("pieceId");
      const playerId = url.searchParams.get("playerId");

      if (!pieceId || !playerId) {
        return Response.json({ moves: [] }, { status: 400 });
      }

      const seat = seatForPlayer(this.roomState, playerId);
      if (!seat || seat !== this.roomState.game.currentTurn) {
        return Response.json({ moves: [] });
      }

      const pieceInfo = findPiece(this.roomState.game.board, pieceId);
      if (!pieceInfo || pieceInfo.piece.owner !== seat) {
        return Response.json({ moves: [] });
      }

      return Response.json({ moves: legalMovesForPiece(this.roomState.game.board, pieceInfo) });
    }

    if (url.pathname === "/move" && request.method === "POST") {
      const payload = await request.json();
      const seat = seatForPlayer(this.roomState, payload.playerId);

      if (!seat) {
        return Response.json({ error: "Player not in room" }, { status: 403 });
      }

      if (this.roomState.game.phase === "finished") {
        return Response.json({ error: "Game already finished" }, { status: 409 });
      }

      if (seat !== this.roomState.game.currentTurn) {
        return Response.json({ error: "Not your turn" }, { status: 409 });
      }

      const pieceInfo = findPiece(this.roomState.game.board, payload.pieceId);
      if (!pieceInfo || pieceInfo.piece.owner !== seat) {
        return Response.json({ error: "Invalid piece" }, { status: 400 });
      }

      const legalMoves = legalMovesForPiece(this.roomState.game.board, pieceInfo);
      const destination = { row: payload.toRow, col: payload.toCol };
      if (!legalMoves.some((move) => sameSquare(move, destination))) {
        return Response.json({ error: "Illegal move" }, { status: 400 });
      }

      const board = this.roomState.game.board;
      const movingPiece = board[pieceInfo.row][pieceInfo.col];
      const capturedPiece = board[payload.toRow][payload.toCol];

      board[pieceInfo.row][pieceInfo.col] = null;
      board[payload.toRow][payload.toCol] = movingPiece;

      if (capturedPiece) {
        this.roomState.game.captured[seat].push({
          ...capturedPiece,
          owner: seat,
          promoted: false
        });
      }

      if (capturedPiece?.kind === "王") {
        this.roomState.status = "finished";
        this.roomState.game.phase = "finished";
        this.roomState.game.result = {
          winner: seat
        };
      } else {
        this.roomState.status = this.roomState.players.length === 2 ? "active" : "waiting";
        this.roomState.game.phase = this.roomState.players.length === 2 ? "active" : "lobby";
        this.roomState.game.currentTurn = seat === "sente" ? "gote" : "sente";
        this.roomState.game.moveNumber += 1;
      }

      await this.saveState();
      this.broadcast({ type: "room_state", room: this.roomState });
      return Response.json(this.roomState);
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
