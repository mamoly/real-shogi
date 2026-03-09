import { GameRoom } from "./game-room.js";

export { GameRoom };

function json(data, init) {
  return Response.json(data, init);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "shogi-app" });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const roomId = crypto.randomUUID();
      const id = env.GAME_ROOM.idFromName(roomId);
      const stub = env.GAME_ROOM.get(id);

      await stub.fetch("https://room.internal/");

      return json({ roomId }, { status: 201 });
    }

    const match = url.pathname.match(/^\/api\/rooms\/([^/]+)(\/ws)?$/);
    if (match) {
      const roomId = match[1];
      const suffix = match[2] ?? "";
      const id = env.GAME_ROOM.idFromName(roomId);
      const stub = env.GAME_ROOM.get(id);
      return stub.fetch(`https://room.internal${suffix}`);
    }

    return json(
      {
        message: "Custom shogi app worker is running"
      },
      { status: 200 }
    );
  }
};
