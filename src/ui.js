const PIECE_LABELS = {
  FU: "歩",
  KY: "香",
  KE: "桂",
  GI: "銀",
  KI: "金",
  KA: "角",
  HI: "飛",
  OU: "王"
};

const PROMOTED_LABELS = {
  FU: "と",
  KY: "成香",
  KE: "成桂",
  GI: "成銀",
  KA: "馬",
  HI: "龍"
};

export function renderHtml() {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>リアル将棋</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">練度制オンライン対局</p>
          <h1>リアル将棋</h1>
          <p class="lede">
            駒ごとに割り振った「練度」が、その一手の成功率になります。
            同じ将棋の形でも、駒の精度と読み合いで勝敗が揺れる対戦ゲームです。
            相手の練度は隠され、取った駒だけが正体を見せます。
          </p>
        </div>
        <aside class="hero-note">
          <p class="note-title">現在できること</p>
          <ul>
            <li>対局ルームを作る</li>
            <li>招待URLを共有する</li>
            <li>二人まで入室する</li>
            <li>初期配置から一手だけ指す</li>
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
          <input id="player-name" maxlength="24" placeholder="名前を入力" />
        </div>

        <div class="row actions">
          <button id="create-room" class="primary">新しい対局室を作る</button>
          <button id="refresh-room">部屋の状態を更新する</button>
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
          先に部屋を作ると、そのあと招待URLを相手に共有できます。
          招待リンクで開いた側は自動で入室接続を試みます。
        </p>
      </section>

      <section class="battlefield">
        <article class="panel board-panel">
          <div class="panel-head">
            <div>
              <p class="section-kicker">対局面</p>
              <h2>盤面表示</h2>
            </div>
            <div class="turn-badges">
              <span class="chip" id="phase-label">入室待機中</span>
              <span class="pill" id="turn-label">手番: 先手</span>
            </div>
          </div>

          <div class="captured captured-top">
            <div class="captured-head">
              <span id="top-captured-label">後手の持ち駒</span>
              <span class="captured-note">打つ機能は未実装</span>
            </div>
            <div id="top-captured" class="captured-list"></div>
          </div>

          <div class="board-wrap">
            <div class="board-top-labels" id="board-top-labels"></div>
            <div class="board-main">
              <div class="board-side-labels" id="board-side-labels"></div>
              <div id="board" class="board"></div>
            </div>
          </div>

          <div class="captured captured-bottom">
            <div class="captured-head">
              <span id="bottom-captured-label">先手の持ち駒</span>
              <span class="captured-note">打つ機能は未実装</span>
            </div>
            <div id="bottom-captured" class="captured-list"></div>
          </div>
        </article>

        <div class="side-stack">
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
        </div>
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
  --board-surface: #d8b97c;
  --board-cell: #e6ca94;
  --board-cell-dark: #d7b57a;
  --board-line: #8d6b3e;
  --line-soft: rgba(118, 83, 41, 0.16);
  --ink: #201710;
  --muted: #6a5b4a;
  --accent: #7d2f1f;
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
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 44px 0 72px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
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
  max-width: 38rem;
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

.turn-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.battlefield {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.72fr);
  gap: 18px;
}

.side-stack {
  display: grid;
  gap: 18px;
}

.board-panel {
  padding-bottom: 22px;
}

.captured {
  margin: 0 22px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(141, 107, 62, 0.18);
  background:
    linear-gradient(180deg, rgba(245, 233, 210, 0.52), rgba(239, 226, 200, 0.32));
}

.captured-top {
  margin-top: 4px;
  margin-bottom: 12px;
}

.captured-bottom {
  margin-top: 14px;
}

.captured-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}

.captured-note {
  color: var(--muted);
}

.captured-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.captured-piece,
.captured-empty {
  min-height: 36px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid rgba(141, 107, 62, 0.18);
  background: rgba(255, 250, 241, 0.72);
}

.captured-empty {
  color: var(--muted);
}

.board-wrap {
  margin: 0 22px;
  padding: 16px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(125, 47, 31, 0.08), transparent 14%),
    rgba(115, 82, 39, 0.08);
}

.board-top-labels {
  display: grid;
  grid-template-columns: 22px repeat(9, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

.board-main {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 6px;
  align-items: stretch;
}

.board-side-labels {
  display: grid;
  grid-template-rows: repeat(9, minmax(0, 1fr));
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

.board-axis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
}

.board {
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  grid-template-rows: repeat(9, minmax(0, 1fr));
  gap: 1px;
  padding: 2px;
  border-radius: 6px;
  background: var(--board-line);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 18px 30px rgba(74, 45, 18, 0.12);
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(180deg, var(--board-cell), var(--board-cell-dark));
}

.square::after {
  content: attr(data-pos);
  position: absolute;
  right: 5px;
  bottom: 4px;
  color: rgba(60, 43, 24, 0.35);
  font-size: 10px;
  line-height: 1;
}

.square.legal::before {
  content: "";
  position: absolute;
  width: 24%;
  height: 24%;
  border-radius: 999px;
  background: rgba(53, 104, 87, 0.38);
}

.square.selected {
  background:
    linear-gradient(180deg, #f2dcae, #e0bc78);
}

.square.empty {
  background:
    linear-gradient(180deg, rgba(230, 202, 148, 0.88), rgba(215, 181, 122, 0.84));
}

.piece {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 78%;
  height: 84%;
  clip-path: polygon(50% 0%, 90% 22%, 84% 100%, 16% 100%, 10% 22%);
  background:
    linear-gradient(180deg, #f7ecd1, #ead0a3);
  border: 1px solid rgba(95, 62, 26, 0.18);
  color: var(--ink);
  font-size: clamp(14px, 2vw, 21px);
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 2px 6px rgba(40, 24, 8, 0.08);
}

.piece.opponent {
  transform: rotate(180deg);
}

.piece.promoted {
  color: var(--accent);
}

.piece.selectable {
  cursor: pointer;
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

@media (max-width: 980px) {
  .battlefield,
  .hero {
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

  .board-wrap,
  .captured {
    margin-left: 14px;
    margin-right: 14px;
  }

  .panel-head,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

export const appJs = `
const FILE_LABELS = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];
const RANK_LABELS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
const PIECE_LABELS = ${JSON.stringify(PIECE_LABELS)};
const PROMOTED_LABELS = ${JSON.stringify(PROMOTED_LABELS)};

const state = {
  roomId: "",
  room: null,
  socket: null,
  playerId: loadOrCreatePlayerId(),
  selectedPieceId: null,
  legalMoves: []
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
  eventLog: document.querySelector("#event-log"),
  phaseLabel: document.querySelector("#phase-label"),
  turnLabel: document.querySelector("#turn-label"),
  topCapturedLabel: document.querySelector("#top-captured-label"),
  bottomCapturedLabel: document.querySelector("#bottom-captured-label"),
  topCaptured: document.querySelector("#top-captured"),
  bottomCaptured: document.querySelector("#bottom-captured"),
  board: document.querySelector("#board"),
  boardTopLabels: document.querySelector("#board-top-labels"),
  boardSideLabels: document.querySelector("#board-side-labels")
};

bootstrap();

function bootstrap() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room");
  const savedName = localStorage.getItem("real-shogi-name") ?? "";

  elements.playerName.value = savedName;
  elements.playerIdLabel.textContent = state.playerId;

  renderBoardLabels();
  renderCapturedAreas();
  renderBoard(null);

  elements.board.addEventListener("click", handleBoardClick);
  elements.createRoom.addEventListener("click", createRoom);
  elements.refreshRoom.addEventListener("click", refreshRoomState);
  elements.connectRoom.addEventListener("click", connectRoom);
  elements.copyLink.addEventListener("click", copyInviteLink);
  elements.playerName.addEventListener("change", persistName);

  if (roomId) {
    state.roomId = roomId;
    elements.roomId.value = roomId;
    updateInviteLink();
    connectRoom();
    return;
  }

  appendLog("ルームをまだ選ばれていません。新しく作るか、招待URLから入ってください。");
}

async function createRoom() {
  persistName();
  appendLog("対局室を作成しています...");

  const response = await fetch("/api/rooms", { method: "POST" });
  if (!response.ok) {
    appendLog("対局室の作成に失敗しました。");
    return;
  }

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
    appendLog("部屋の取得に失敗しました。status=" + response.status);
    return;
  }

  const room = await response.json();
  applyRoom(room);
  appendLog("部屋の状態を更新しました。");
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
    state.socket._manualClose = true;
    state.socket.close();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(protocol + "//" + window.location.host + "/api/rooms/" + roomId + "/ws");
  state.socket = socket;

  socket.addEventListener("open", () => {
    if (state.socket !== socket) {
      return;
    }

    setConnection(true);
    appendLog("接続しました。参加情報を送信します。");
    socket.send(JSON.stringify({
      type: "join",
      playerId: state.playerId,
      name: elements.playerName.value.trim() || "ゲスト"
    }));
  });

  socket.addEventListener("message", (event) => {
    if (state.socket !== socket) {
      return;
    }

    const payload = JSON.parse(event.data);
    appendLog("受信: " + formatMessage(payload));

    if (payload.room) {
      applyRoom(payload.room);
    }
  });

  socket.addEventListener("error", () => {
    if (state.socket !== socket) {
      return;
    }

    appendLog("接続で問題が発生しました。");
  });

  socket.addEventListener("close", () => {
    if (socket._manualClose) {
      return;
    }

    if (state.socket === socket) {
      state.socket = null;
      setConnection(false);
    }

    appendLog("接続が切れました。");
  });
}

async function copyInviteLink() {
  if (!elements.inviteLink.value) {
    appendLog("招待URLはまだありません。");
    return;
  }

  try {
    await navigator.clipboard.writeText(elements.inviteLink.value);
    appendLog("招待URLをコピーしました。");
  } catch {
    appendLog("URLのコピーに失敗しました。");
  }
}

function applyRoom(room) {
  state.room = room;
  state.roomId = room.roomId;
  state.selectedPieceId = null;
  state.legalMoves = [];

  elements.roomId.value = room.roomId;
  elements.roomLabel.textContent = room.roomId;
  elements.statusLabel.textContent = formatStatus(room.status);
  elements.phaseLabel.textContent = formatPhase(room.game?.phase);
  elements.turnLabel.textContent = formatTurn(room.game);
  updateInviteLink();
  replaceQuery(room.roomId);

  renderPlayers(room.players ?? []);
  renderBoardLabels();
  renderCapturedAreas();
  renderBoard(room.game?.board ?? null);
}

function renderPlayers(players) {
  elements.players.innerHTML = "";

  for (const player of players) {
    const item = document.createElement("li");
    const ownSuffix = player.id === state.playerId ? "（あなた）" : "";
    item.innerHTML =
      "<div class=\\"player-main\\">" +
      "<span class=\\"player-name\\">" + escapeHtml(player.name) + ownSuffix + "</span>" +
      "<span class=\\"player-id\\">ID: " + escapeHtml(player.id) + "</span>" +
      "</div>" +
      "<span class=\\"player-seat\\">" + formatSeat(player.seat) + "</span>";
    elements.players.appendChild(item);
  }

  if (players.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "まだ誰も入室していません。";
    elements.players.appendChild(item);
  }
}

function renderBoardLabels() {
  const orientation = getBoardOrientation();
  const fileLabels = orientation === "gote" ? [...FILE_LABELS].reverse() : FILE_LABELS;
  const rankLabels = orientation === "gote" ? [...RANK_LABELS].reverse() : RANK_LABELS;

  elements.boardTopLabels.innerHTML =
    "<span></span>" +
    fileLabels.map((label) => "<span class=\\"board-axis\\">" + label + "</span>").join("");

  elements.boardSideLabels.innerHTML =
    rankLabels.map((label) => "<span class=\\"board-axis\\">" + label + "</span>").join("");
}

function renderBoard(board) {
  elements.board.innerHTML = "";
  const orientation = getBoardOrientation();
  const fileLabels = orientation === "gote" ? [...FILE_LABELS].reverse() : FILE_LABELS;
  const rankLabels = orientation === "gote" ? [...RANK_LABELS].reverse() : RANK_LABELS;
  const displayRows = orientation === "gote" ? [...Array(9).keys()].reverse() : [...Array(9).keys()];
  const displayCols = orientation === "gote" ? [...Array(9).keys()].reverse() : [...Array(9).keys()];

  if (!board) {
    for (let i = 0; i < 81; i += 1) {
      const square = document.createElement("div");
      square.className = "square empty";
      elements.board.appendChild(square);
    }
    return;
  }

  displayRows.forEach((rowIndex, displayRow) => {
    displayCols.forEach((colIndex, displayCol) => {
      const piece = board[rowIndex][colIndex];
      const square = document.createElement("div");
      square.className = "square" + (piece ? "" : " empty");
      square.dataset.pos = fileLabels[displayCol] + rankLabels[displayRow];
      square.dataset.row = String(rowIndex);
      square.dataset.col = String(colIndex);

      if (piece) {
        square.dataset.pieceId = piece.id;
        square.dataset.owner = piece.owner;

        if (piece.id === state.selectedPieceId) {
          square.classList.add("selected");
        }

        if (state.legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) {
          square.classList.add("legal");
        }

        const pieceNode = document.createElement("div");
        pieceNode.className = "piece" + (piece.promoted ? " promoted" : "");

        if (piece.owner !== orientation) {
          pieceNode.classList.add("opponent");
        }

        if (canSelectPiece(piece)) {
          pieceNode.classList.add("selectable");
        }

        pieceNode.textContent = pieceLabel(piece);
        square.appendChild(pieceNode);
      } else if (state.legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)) {
        square.classList.add("legal");
      }

      elements.board.appendChild(square);
    });
  });
}

function renderCapturedAreas() {
  const orientation = getBoardOrientation();
  const topOwner = orientation === "gote" ? "sente" : "gote";
  const bottomOwner = orientation === "gote" ? "gote" : "sente";

  elements.topCapturedLabel.textContent = ownerLabel(topOwner) + "の持ち駒";
  elements.bottomCapturedLabel.textContent = ownerLabel(bottomOwner) + "の持ち駒";

  renderCapturedList(elements.topCaptured, state.room?.game?.captured?.[topOwner] ?? []);
  renderCapturedList(elements.bottomCaptured, state.room?.game?.captured?.[bottomOwner] ?? []);
}

function renderCapturedList(target, pieces) {
  target.innerHTML = "";

  if (pieces.length === 0) {
    const empty = document.createElement("span");
    empty.className = "captured-empty";
    empty.textContent = "なし";
    target.appendChild(empty);
    return;
  }

  pieces.forEach((piece) => {
    const node = document.createElement("span");
    node.className = "captured-piece";
    node.textContent = pieceLabel(piece);
    target.appendChild(node);
  });
}

function pieceLabel(piece) {
  if (piece.promoted) {
    return PROMOTED_LABELS[piece.kind] ?? ("成" + (PIECE_LABELS[piece.kind] ?? piece.kind));
  }

  return PIECE_LABELS[piece.kind] ?? piece.kind;
}

async function handleBoardClick(event) {
  const square = event.target.closest(".square");
  if (!square || !state.room) {
    return;
  }

  const row = Number(square.dataset.row);
  const col = Number(square.dataset.col);
  const pieceId = square.dataset.pieceId;

  if (state.selectedPieceId && isLegalDestination(row, col)) {
    await moveSelectedPiece(row, col);
    return;
  }

  if (!pieceId) {
    clearSelection();
    return;
  }

  const piece = square.dataset.owner ? { id: pieceId, owner: square.dataset.owner } : null;
  if (!piece || !canSelectPiece(piece)) {
    clearSelection();
    return;
  }

  if (state.selectedPieceId === pieceId) {
    clearSelection();
    return;
  }

  await loadLegalMoves(pieceId);
}

async function loadLegalMoves(pieceId) {
  const response = await fetch(
    "/api/rooms/" + state.roomId + "/legal-moves?pieceId=" + encodeURIComponent(pieceId) + "&playerId=" + encodeURIComponent(state.playerId)
  );
  const payload = await response.json();

  state.selectedPieceId = pieceId;
  state.legalMoves = payload.moves ?? [];
  renderBoard(state.room.game?.board ?? null);
}

async function moveSelectedPiece(toRow, toCol) {
  const response = await fetch("/api/rooms/" + state.roomId + "/move", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      playerId: state.playerId,
      pieceId: state.selectedPieceId,
      toRow,
      toCol
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    appendLog("着手できませんでした。理由: " + (payload.error ?? "不明"));
    return;
  }

  appendLog("一手進みました。");
  applyRoom(payload);
}

function clearSelection() {
  state.selectedPieceId = null;
  state.legalMoves = [];
  renderBoard(state.room?.game?.board ?? null);
}

function isLegalDestination(row, col) {
  return state.legalMoves.some((move) => move.row === row && move.col === col);
}

function canSelectPiece(piece) {
  const mySeat = currentPlayerSeat();
  if (!mySeat || !state.room?.game) {
    return false;
  }

  return piece.owner === mySeat && state.room.game.currentTurn === mySeat && state.room.game.phase !== "finished";
}

function currentPlayerSeat() {
  return state.room?.players?.find((player) => player.id === state.playerId)?.seat ?? null;
}

function getBoardOrientation() {
  return currentPlayerSeat() === "gote" ? "gote" : "sente";
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
  const line = "【" + new Date().toLocaleTimeString("ja-JP") + "】" + message;
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
  if (status === "active") return "対局中";
  if (status === "finished") return "終局";
  return status || "未設定";
}

function formatPhase(phase) {
  if (phase === "lobby") return "入室待機中";
  if (phase === "ready") return "対局開始待ち";
  if (phase === "active") return "対局中";
  if (phase === "finished") return "終局";
  return "未設定";
}

function formatSeat(seat) {
  if (seat === "sente") return "先手";
  if (seat === "gote") return "後手";
  return seat || "未定";
}

function ownerLabel(owner) {
  return owner === "gote" ? "後手" : "先手";
}

function formatTurn(game) {
  if (game?.phase === "finished" && game.result?.winner) {
    return "勝者: " + formatSeat(game.result.winner);
  }

  return "手番: " + formatSeat(game?.currentTurn);
}

function formatMessage(payload) {
  if (payload.type === "connected") return "部屋との接続を確認しました。";
  if (payload.type === "joined") return "参加情報が反映されました。";
  if (payload.type === "room_state") return "部屋の状態が更新されました。";
  if (payload.type === "error") return "エラー: " + payload.message;
  return JSON.stringify(payload);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
`;
