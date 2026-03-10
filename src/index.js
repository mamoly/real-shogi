import { GameRoom } from "./game-room.js";
import { appCss, appJs, renderHtml } from "./ui.js";

export { GameRoom };

function json(data, init) {
  return Response.json(data, init);
}

function text(body, contentType) {
  return new Response(body, {
    headers: {
      "content-type": `${contentType}; charset=utf-8`
    }
  });
}

function createRoomId() {
  return crypto.randomUUID().split("-")[0];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return text(renderHtml(), "text/html");
    }

    if (url.pathname === "/app.js") {
      return text(appJs, "application/javascript");
    }

    if (url.pathname === "/app.css") {
      return text(appCss, "text/css");
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "shogi-app" });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const roomId = createRoomId();
      const id = env.GAME_ROOM.idFromName(roomId);
      const stub = env.GAME_ROOM.get(id);

      const initResponse = await stub.fetch(
        new Request("https://room.internal/init", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ roomId })
        })
      );

      const room = await initResponse.json();
      return json(room, { status: 201 });
    }

    const match = url.pathname.match(/^\/api\/rooms\/([^/]+)(\/.*)?$/);
    if (match) {
      const roomId = match[1];
      const suffix = match[2] ?? "/";
      const id = env.GAME_ROOM.idFromName(roomId);
      const stub = env.GAME_ROOM.get(id);
      const forwardedUrl = new URL(`https://room.internal${suffix}`);
      forwardedUrl.search = url.search;
      const forwarded = new Request(forwardedUrl.toString(), request);
      return stub.fetch(forwarded);
    }

    return json(
      {
        message: "Custom shogi app worker is running"
      },
      { status: 200 }
    );
  }
};
