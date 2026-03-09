export function renderHtml() {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>実践将棋</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">練度制オンライン対局</p>
          <h1>実践将棋</h1>
          <p class="lede">
            和の空気感を残しながら、ルーム作成、招待、接続確認までを静かに進めるための対局ロビーです。
          </p>
        </div>
        <aside class="hero-note">
          <p class="note-title">現在できること</p>
          <ul>
            <li>対局ルームを作る</li>
            <li>招待URLを共有する</li>
            <li>二人まで入室する</li>
            <li>接続状態を確認する</li>
          </ul>
        </aside>
      </section>

      <section class="panel controls">
        <div class="section-head">
          <div>
            <p class="section-kicker">対局支度</p>
            <h2>入室の準備</h2>
          </div>
          <span class="chip">試作版ロビー</span>
        </div>

        <div class="row single">
          <label for="player-name">表示名</label>
          <input id="player-name" maxlength="24" placeholder="平原" />
        </div>

        <div class="row actions">
          <button id="create-room" class="primary">新しい対局室を作る</button>
          <button id="refresh-room">部屋情報を更新する</button>
        </div>

        <div class="row room-line">
          <label for="room-id">ルームID</label>
          <input id="room-id" maxlength="16" placeholder="例: 3f8ac912" />
          <button id="connect-room">この部屋に入る</button>
        </div>

        <div class="row invite-line">
          <label for="invite-link">招待URL</label>
          <input id="invite-link" readonly />
          <button id="copy-link">URLをコピー</button>
        </div>

        <p class="help-text">
          まず部屋を作り、そのあと招待URLを相手に渡すのが最も自然です。
        </p>
      </section>

      <section class="grid">
        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="section-kicker">対局室</p>
              <h2>現在の状態</h2>
            </div>
            <span id="connection-pill" class="pill">未接続</span>
          </div>
          <dl class="stats">
            <div>
              <dt>ルーム</dt>
              <dd id="room-label">未設定</dd>
            </div>
            <div>
              <dt>状態</dt>
              <dd id="status-label">未設定</dd>
            </div>
            <div>
              <dt>あなたのID</dt>
              <dd id="player-id-label">-</dd>
            </div>
          </dl>
          <div class="subsection">
            <h3>参加者</h3>
            <ul id="players" class="players"></ul>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="section-kicker">記録</p>
              <h2>イベントログ</h2>
            </div>
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
  --bg-top: #f6f0e5;
  --bg-bottom: #e7dcc7;
  --paper: rgba(255, 250, 241, 0.86);
  --paper-strong: rgba(255, 248, 236, 0.97);
  --line: #cfbb98;
  --line-soft: rgba(118, 83, 41, 0.16);
  --ink: #201710;
  --muted: #6a5b4a;
  --accent: #7d2f1f;
  --accent-soft: #c56d45;
  --gold: #a68743;
  --online: #356857;
  --offline: #7a756d;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--ink);
  font-family: "BIZ UDPMincho", "Yu Mincho", "Hiragino Mincho ProN", serif;
  background:
    radial-gradient(circle at top left, rgba(197, 109, 69, 0.18), transparent 26%),
    radial-gradient(circle at bottom right, rgba(125, 47, 31, 0.12), transparent 24%),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.12) 0,
      rgba(255, 255, 255, 0.12) 1px,
      transparent 1px,
      transparent 28px
    ),
    linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(118, 83, 41, 0.04), transparent 14%, transparent 86%, rgba(118, 83, 41, 0.04)),
    linear-gradient(180deg, rgba(118, 83, 41, 0.05), transparent 20%, transparent 80%, rgba(118, 83, 41, 0.06));
}

.shell {
  position: relative;
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 44px 0 72px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 18px;
  align-items: stretch;
  margin-bottom: 18px;
}

.hero-copy,
.hero-note,
.panel {
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  background: var(--paper);
  box-shadow:
    0 22px 48px rgba(74, 45, 18, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.hero-copy {
  padding: 28px 28px 32px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.46), transparent 45%),
    var(--paper);
}

.hero-note {
  padding: 22px 22px 18px;
  background:
    linear-gradient(180deg, rgba(166, 135, 67, 0.08), transparent 48%),
    var(--paper-strong);
}

.eyebrow,
.section-kicker,
.note-title {
  margin: 0;
  color: var(--accent);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 12px;
}

h1 {
  margin: 12px 0 0;
  font-size: clamp(46px, 8vw, 92px);
  line-height: 0.94;
  font-weight: 600;
}

.lede {
  max-width: 36rem;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}

.hero-note ul {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.9;
}

.controls {
  margin-bottom: 18px;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28), transparent 24%),
    var(--paper);
}

.section-head,
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head {
  margin-bottom: 18px;
}

.panel-head {
  padding: 22px 22px 10px;
}

h2,
h3 {
  margin: 6px 0 0;
  font-size: 20px;
  font-weight: 600;
}

.chip,
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

.chip {
  border: 1px solid rgba(166, 135, 67, 0.28);
  color: var(--gold);
  background: rgba(166, 135, 67, 0.08);
}

.pill {
  background: rgba(122, 117, 109, 0.14);
  color: var(--offline);
}

.pill.online {
  background: rgba(53, 104, 87, 0.14);
  color: var(--online);
}

.row {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.single {
  max-width: 420px;
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
  min-height: 50px;
  border: 1px solid rgba(118, 83, 41, 0.18);
  border-radius: 14px;
  padding: 12px 14px;
  color: var(--ink);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(252, 246, 236, 0.9));
}

input:focus,
button:focus {
  outline: 2px solid rgba(166, 135, 67, 0.34);
  outline-offset: 2px;
}

button {
  min-height: 50px;
  border: 1px solid rgba(118, 83, 41, 0.14);
  border-radius: 14px;
  padding: 12px 16px;
  color: var(--ink);
  background:
    linear-gradient(180deg, #f7ecd8, #ebdcc0);
  cursor: pointer;
  transition: transform 140ms ease, filter 140ms ease, box-shadow 140ms ease;
  box-shadow: 0 8px 20px rgba(74, 45, 18, 0.08);
}

button.primary {
  color: #fff9f4;
  border-color: rgba(125, 47, 31, 0.28);
  background:
    linear-gradient(180deg, #96503b, #7d2f1f);
}

button:hover {
  transform: translateY(-1px);
  filter: brightness(0.99);
}

.help-text {
  margin: 8px 2px 0;
  color: var(--muted);
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 2px 22px 18px;
  margin: 0;
}

.stats dt {
  margin-bottom: 5px;
  font-size: 12px;
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.subsection {
  padding: 0 22px 22px;
}

.players {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.players li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(166, 135, 67, 0.14);
  background:
    linear-gradient(180deg, rgba(245, 233, 210, 0.62), rgba(239, 226, 200, 0.44));
}

.player-main {
  display: grid;
  gap: 4px;
}

.player-name {
  font-weight: 600;
}

.player-id {
  font-size: 12px;
  color: var(--muted);
}

.player-seat {
  color: var(--accent);
  font-size: 13px;
}

.empty-state {
  color: var(--muted);
  justify-content: center;
}

.log {
  min-height: 360px;
  margin: 0;
  padding: 0 22px 22px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "BIZ UDMincho", "Yu Mincho", serif;
  font-size: 13px;
  line-height: 1.75;
  color: var(--muted);
}

@media (max-width: 860px) {
  .hero,
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .shell {
    width: min(100vw - 20px, 100%);
    padding: 20px 0 44px;
  }

  .hero-copy,
  .hero-note,
  .controls {
    padding: 20px;
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
    appendLog("部屋はまだ選ばれていません。新しく作るか、招待URLから入ってください。");
  }
}

async function createRoom() {
  persistName();
  appendLog("対局室を作成しています...");

  const response = await fetch("/api/rooms", { method: "POST" });
  const room = await response.json();
  applyRoom(room);
  appendLog("対局室を作成しました。ルームID: " + room.roomId);
  await connectRoom();
}

async function refreshRoomState() {
  const roomId = elements.roomId.value.trim();
  if (!roomId) {
    appendLog("ルームIDを入力してください。");
    return;
  }

  const response = await fetch("/api/rooms/" + roomId);
  if (!response.ok) {
    appendLog("部屋情報の取得に失敗しました。status=" + response.status);
    return;
  }

  const room = await response.json();
  applyRoom(room);
  appendLog("部屋情報を更新しました。");
}

async function connectRoom() {
  persistName();

  const roomId = elements.roomId.value.trim();
  if (!roomId) {
    appendLog("接続するにはルームIDが必要です。");
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
    appendLog("接続しました。参加情報を送信します。");
    socket.send(JSON.stringify({
      type: "join",
      playerId: state.playerId,
      name: elements.playerName.value.trim() || "対局者"
    }));
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    appendLog("受信: " + formatMessage(payload));
    if (payload.room) {
      applyRoom(payload.room);
    }
  });

  socket.addEventListener("close", () => {
    setConnection(false);
    appendLog("接続が閉じられました。");
  });
}

async function copyInviteLink() {
  if (!elements.inviteLink.value) {
    appendLog("招待URLはまだありません。");
    return;
  }

  await navigator.clipboard.writeText(elements.inviteLink.value);
  appendLog("招待URLをコピーしました。");
}

function applyRoom(room) {
  state.roomId = room.roomId;
  elements.roomId.value = room.roomId;
  elements.roomLabel.textContent = room.roomId;
  elements.statusLabel.textContent = formatStatus(room.status);
  updateInviteLink();
  replaceQuery(room.roomId);

  elements.players.innerHTML = "";
  for (const player of room.players) {
    const item = document.createElement("li");
    const own = player.id === state.playerId ? "（あなた）" : "";
    item.innerHTML =
      "<div class=\\"player-main\\">" +
      "<span class=\\"player-name\\">" + escapeHtml(player.name) + own + "</span>" +
      "<span class=\\"player-id\\">ID: " + escapeHtml(player.id) + "</span>" +
      "</div>" +
      "<span class=\\"player-seat\\">" + formatSeat(player.seat) + "</span>";
    elements.players.appendChild(item);
  }

  if (room.players.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "まだ誰も入室していません。";
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
  elements.connectionPill.textContent = isOnline ? "接続中" : "未接続";
  elements.connectionPill.classList.toggle("online", isOnline);
}

function appendLog(message) {
  const line = "［" + new Date().toLocaleTimeString("ja-JP") + "］" + message;
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

function formatStatus(status) {
  if (status === "waiting") return "待機中";
  if (status === "ready") return "対局開始待ち";
  return status;
}

function formatSeat(seat) {
  if (seat === "sente") return "先手";
  if (seat === "gote") return "後手";
  return seat;
}

function formatMessage(payload) {
  if (payload.type === "connected") return "部屋との接続を確立しました。";
  if (payload.type === "joined") return "入室情報が反映されました。";
  if (payload.type === "room_state") return "部屋の状態が更新されました。";
  if (payload.type === "error") return "エラー: " + payload.message;
  return JSON.stringify(payload);
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
