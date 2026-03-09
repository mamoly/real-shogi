export function renderHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Real Shogi</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Probabilistic Online Shogi</p>
        <h1>Real Shogi</h1>
        <p class="lede">
          A minimal Cloudflare prototype for room creation, joining, and live WebSocket connection tests.
        </p>
      </section>

      <section class="panel controls">
        <div class="row">
          <label for="player-name">Display name</label>
          <input id="player-name" maxlength="24" placeholder="Hirahara" />
        </div>
        <div class="row actions">
          <button id="create-room" class="primary">Create room</button>
          <button id="refresh-room">Refresh room</button>
        </div>
        <div class="row room-line">
          <label for="room-id">Room ID</label>
          <input id="room-id" maxlength="16" placeholder="room id" />
          <button id="connect-room">Join and connect</button>
        </div>
        <div class="row invite-line">
          <label for="invite-link">Invite URL</label>
          <input id="invite-link" readonly />
          <button id="copy-link">Copy</button>
        </div>
      </section>

      <section class="grid">
        <article class="panel">
          <div class="panel-head">
            <h2>Room state</h2>
            <span id="connection-pill" class="pill">offline</span>
          </div>
          <dl class="stats">
            <div>
              <dt>Room</dt>
              <dd id="room-label">-</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd id="status-label">-</dd>
            </div>
            <div>
              <dt>Player ID</dt>
              <dd id="player-id-label">-</dd>
            </div>
          </dl>
          <ul id="players" class="players"></ul>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Event log</h2>
          </div>
          <pre id="event-log" class="log"></pre>
        </article>
      </section>
    </main>
    <script type="module" src="/app.js"></script>
  </body>
</html>`;
}

export const appCss = `
:root {
  color-scheme: light;
  --bg: #f4efe5;
  --panel: rgba(255, 252, 247, 0.85);
  --line: #d9c7ab;
  --ink: #221d18;
  --muted: #6d6257;
  --accent: #b04a1b;
  --pill-off: #6a7b85;
  --pill-on: #1f7a65;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Georgia, "Times New Roman", serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(176, 74, 27, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(34, 29, 24, 0.08), transparent 22%),
    linear-gradient(180deg, #f8f4eb 0%, var(--bg) 100%);
}

.shell {
  width: min(1080px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 40px 0 64px;
}

.hero {
  padding: 8px 4px 28px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
}

h1 {
  margin: 0;
  font-size: clamp(44px, 8vw, 88px);
  line-height: 0.92;
}

.lede {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--panel);
  box-shadow: 0 14px 40px rgba(60, 43, 24, 0.08);
  backdrop-filter: blur(8px);
}

.controls {
  margin-bottom: 18px;
  padding: 18px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 8px;
}

.panel h2 {
  margin: 0;
  font-size: 18px;
}

.row {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.actions,
.room-line,
.invite-line {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
}

.room-line label,
.invite-line label {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  color: var(--muted);
}

input,
button {
  font: inherit;
}

input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.8);
}

button {
  border: 0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #efe4d4;
  color: var(--ink);
  cursor: pointer;
}

button.primary {
  background: var(--accent);
  color: #fffaf6;
}

button:hover {
  filter: brightness(0.98);
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  background: rgba(106, 123, 133, 0.14);
  color: var(--pill-off);
}

.pill.online {
  background: rgba(31, 122, 101, 0.16);
  color: var(--pill-on);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 8px 18px 18px;
  margin: 0;
}

.stats dt {
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-weight: 600;
}

.players {
  list-style: none;
  margin: 0;
  padding: 0 18px 18px;
  display: grid;
  gap: 10px;
}

.players li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(239, 228, 212, 0.55);
}

.log {
  min-height: 320px;
  margin: 0;
  padding: 0 18px 18px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}

@media (max-width: 780px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .actions,
  .room-line,
  .invite-line,
  .stats {
    grid-template-columns: 1fr;
  }
}
`;

export const appJs = `
const state = {
  roomId: "",
  socket: null,
  playerId: loadOrCreatePlayerId()
};

const elements = {
  playerName: document.querySelector("#player-name"),
  createRoom: document.querySelector("#create-room"),
  refreshRoom: document.querySelector("#refresh-room"),
  roomId: document.querySelector("#room-id"),
  connectRoom: document.querySelector("#connect-room"),
  inviteLink: document.querySelector("#invite-link"),
  copyLink: document.querySelector("#copy-link"),
  connectionPill: document.querySelector("#connection-pill"),
  roomLabel: document.querySelector("#room-label"),
  statusLabel: document.querySelector("#status-label"),
  playerIdLabel: document.querySelector("#player-id-label"),
  players: document.querySelector("#players"),
  eventLog: document.querySelector("#event-log")
};

bootstrap();

function bootstrap() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room");
  const savedName = localStorage.getItem("real-shogi-name") ?? "";

  elements.playerName.value = savedName;
  elements.playerIdLabel.textContent = state.playerId;

  elements.createRoom.addEventListener("click", createRoom);
  elements.refreshRoom.addEventListener("click", refreshRoomState);
  elements.connectRoom.addEventListener("click", connectRoom);
  elements.copyLink.addEventListener("click", copyInviteLink);
  elements.playerName.addEventListener("change", persistName);

  if (roomId) {
    state.roomId = roomId;
    elements.roomId.value = roomId;
    updateInviteLink();
    refreshRoomState();
  } else {
    appendLog("Room ID is empty. Create one or paste an invite.");
  }
}

async function createRoom() {
  persistName();
  appendLog("Creating room...");

  const response = await fetch("/api/rooms", { method: "POST" });
  const room = await response.json();
  applyRoom(room);
  appendLog("Created room " + room.roomId);
  await connectRoom();
}

async function refreshRoomState() {
  const roomId = elements.roomId.value.trim();
  if (!roomId) {
    appendLog("Room ID is required to refresh.");
    return;
  }

  const response = await fetch("/api/rooms/" + roomId);
  if (!response.ok) {
    appendLog("Room lookup failed: " + response.status);
    return;
  }

  const room = await response.json();
  applyRoom(room);
  appendLog("Loaded room state.");
}

async function connectRoom() {
  persistName();

  const roomId = elements.roomId.value.trim();
  if (!roomId) {
    appendLog("Room ID is required to connect.");
    return;
  }

  state.roomId = roomId;
  updateInviteLink();
  replaceQuery(roomId);

  if (state.socket) {
    state.socket.close();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(protocol + "//" + window.location.host + "/api/rooms/" + roomId + "/ws");
  state.socket = socket;

  socket.addEventListener("open", () => {
    setConnection(true);
    appendLog("WebSocket connected.");
    socket.send(JSON.stringify({
      type: "join",
      playerId: state.playerId,
      name: elements.playerName.value.trim() || "guest"
    }));
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    appendLog("WS " + payload.type + ": " + JSON.stringify(payload));
    if (payload.room) {
      applyRoom(payload.room);
    }
  });

  socket.addEventListener("close", () => {
    setConnection(false);
    appendLog("WebSocket closed.");
  });
}

async function copyInviteLink() {
  if (!elements.inviteLink.value) {
    appendLog("Invite URL is empty.");
    return;
  }

  await navigator.clipboard.writeText(elements.inviteLink.value);
  appendLog("Invite URL copied.");
}

function applyRoom(room) {
  state.roomId = room.roomId;
  elements.roomId.value = room.roomId;
  elements.roomLabel.textContent = room.roomId;
  elements.statusLabel.textContent = room.status;
  updateInviteLink();
  replaceQuery(room.roomId);

  elements.players.innerHTML = "";
  for (const player of room.players) {
    const item = document.createElement("li");
    item.innerHTML = "<strong>" + escapeHtml(player.name) + "</strong><span>" + escapeHtml(player.seat) + "</span>";
    elements.players.appendChild(item);
  }

  if (room.players.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No players yet.";
    elements.players.appendChild(item);
  }
}

function updateInviteLink() {
  if (!state.roomId) {
    elements.inviteLink.value = "";
    return;
  }

  const invite = new URL(window.location.href);
  invite.searchParams.set("room", state.roomId);
  elements.inviteLink.value = invite.toString();
}

function replaceQuery(roomId) {
  const url = new URL(window.location.href);
  if (roomId) {
    url.searchParams.set("room", roomId);
  } else {
    url.searchParams.delete("room");
  }
  window.history.replaceState({}, "", url);
}

function persistName() {
  localStorage.setItem("real-shogi-name", elements.playerName.value.trim());
}

function setConnection(isOnline) {
  elements.connectionPill.textContent = isOnline ? "online" : "offline";
  elements.connectionPill.classList.toggle("online", isOnline);
}

function appendLog(message) {
  const line = "[" + new Date().toLocaleTimeString() + "] " + message;
  elements.eventLog.textContent = line + "\\n" + elements.eventLog.textContent;
}

function loadOrCreatePlayerId() {
  const key = "real-shogi-player-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID().split("-")[0];
    localStorage.setItem(key, value);
  }
  return value;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
`;
