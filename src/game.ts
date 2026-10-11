import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_HH,
  OBSTACLE_HW,
  OBSTACLE_SPIN_RATE,
  OBSTACLE_SWAY_AMP,
  OBSTACLE_SWAY_PERIOD,
  OBSTACLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_HALF,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export const BACKGROUND = "#071119";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";

export type Mode = "solo" | "versus";

export type Side = "left" | "right";

export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}

export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}

export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}

export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly theta: number;
}

export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";

  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;

  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;

  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly obstacleClock: number;
  readonly obstacleClockRunning: boolean;

  readonly simTime: number;
  readonly muted: boolean;
}

export interface MenuRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface BallSnapshot extends BallState {
  readonly speed: number;
}

export interface CaromSnapshot extends Omit<CaromState, "ball" | "obstacles"> {
  readonly version: number;
  readonly ball: BallSnapshot | null;
  readonly obstacles: readonly ObstacleState[];
}

export interface CaromDebugApi {
  readonly version: number;
  clearWorld(state: DeepReadonly<CaromState>): CaromState;
  spawnBall(state: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(state: DeepReadonly<CaromState>, index: number): CaromState;
  reset(state: DeepReadonly<CaromState>): CaromState;
  reconcile(state: DeepReadonly<CaromState>): CaromState;
  setScreen(state: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(state: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    state: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(state: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(state: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(state: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(
    state: DeepReadonly<CaromState>,
    side: Side,
    cy: number,
  ): CaromState;
  setPaddleVy(
    state: DeepReadonly<CaromState>,
    side: Side,
    vy: number,
  ): CaromState;
  setPaddleDriven(
    state: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    state: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    state: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(state: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(state: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(
    state: DeepReadonly<CaromState>,
    seconds: number,
  ): CaromState;
  setBallServeSign(state: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(state: DeepReadonly<CaromState>): CaromState;
  setAiTracking(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(state: DeepReadonly<CaromState>, muted: boolean): CaromState;
  setObstacleClock(state: DeepReadonly<CaromState>, t: number): CaromState;
  setObstacleClockRunning(
    state: DeepReadonly<CaromState>,
    running: boolean,
  ): CaromState;
  snapshot(state: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(state: DeepReadonly<CaromState>, index: number): MenuRect | null;
}

interface InputEdges {
  readonly up: boolean;
  readonly down: boolean;
  readonly confirm: boolean;
  readonly back: boolean;
  readonly pause: boolean;
  readonly mute: boolean;
}

interface PhysicsEvents {
  wall: boolean;
  paddle: boolean;
  obstacle: boolean;
}

const TAU = Math.PI * 2;
const MENU_W = 360;
const MENU_H = 58;
const MENU_GAP = 16;
const TITLE_MENU_Y = 450;
const PAUSE_MENU_Y = 292;
const MATCH_MENU_Y = 398;
const HOWTO_MENU_Y = 602;
const HOWTO_ITEMS = ["BACK"] as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const signChoice = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);

function copyState(state: DeepReadonly<CaromState>): CaromState {
  return {
    screen: state.screen,
    mode: state.mode,
    menuIndex: state.menuIndex,
    titleIndex: state.titleIndex,
    resumeScreen: state.resumeScreen,
    score: { p1: state.score.p1, p2: state.score.p2 },
    winner: state.winner,
    paddles: {
      left: { ...state.paddles.left },
      right: { ...state.paddles.right },
    },
    ai: { ...state.ai },
    receiver: state.receiver,
    ball: state.ball
      ? { ...state.ball, trail: state.ball.trail.map((sample) => sample) }
      : null,
    obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
    obstacleClock: state.obstacleClock,
    obstacleClockRunning: state.obstacleClockRunning,
    simTime: state.simTime,
    muted: state.muted,
  };
}

function ballAtHome(): BallState {
  return {
    x: FIELD_CX,
    y: FIELD_CY,
    vx: 0,
    vy: 0,
    spin: 0,
    held: true,
    holdTimer: HOLD_TIME,
    serveSign: signChoice(),
    trail: [],
  };
}

function obstaclePose(index: number, t: number): ObstacleState {
  const base = OBSTACLE_CENTERS[index];
  if (!base) throw new Error(`Carom: obstacle ${index} does not exist`);

  const sway = OBSTACLE_SWAY_AMP * Math.sin((TAU * t) / OBSTACLE_SWAY_PERIOD);
  return {
    index,
    cx: base.x,
    cy: base.y + (index === 0 ? sway : -sway),
    theta: OBSTACLE_SPIN_RATE * t,
  };
}

function allObstacles(t: number): readonly ObstacleState[] {
  return OBSTACLE_CENTERS.map((_, index) => obstaclePose(index, t));
}

function initialState(muted: boolean): CaromState {
  return {
    screen: "title",
    mode: "solo",
    menuIndex: 0,
    titleIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: {
      left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
      right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    },
    ai: { tracking: true, movement: true },
    receiver: "left",
    ball: ballAtHome(),
    obstacles: allObstacles(0),
    obstacleClock: 0,
    obstacleClockRunning: true,
    simTime: 0,
    muted,
  };
}

function withObstaclePoses(state: CaromState): CaromState {
  const present = new Set(state.obstacles.map((obstacle) => obstacle.index));
  return {
    ...state,
    obstacles: OBSTACLE_CENTERS.map((_, index) =>
      present.has(index) ? obstaclePose(index, state.obstacleClock) : null,
    ).filter((obstacle): obstacle is ObstacleState => obstacle !== null),
  };
}

function integratePaddle(
  paddle: DeepReadonly<PaddleState>,
  desiredVy: number,
  dt: number,
): PaddleState {
  if (dt <= 0) return { ...paddle, vy: 0 };

  const next = clamp(paddle.cy + desiredVy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  return {
    ...paddle,
    cy: next,
    vy: (next - paddle.cy) / dt,
  };
}

function movementVy(up: number, down: number): number {
  return (down - up) * PADDLE_SPEED;
}

function aiVy(state: DeepReadonly<CaromState>, dt: number): number {
  if (!state.ai.movement || dt <= 0) return 0;

  const ball = state.ball;
  let target = AI_HOME_Y;
  let deadzone = AI_HOME_DEADZONE;
  if (
    state.ai.tracking &&
    state.screen === "playing" &&
    ball &&
    !ball.held &&
    ball.vx > 0
  ) {
    target = ball.y - ball.vy * AI_REACT;
    deadzone = AI_DEADZONE;
  }

  const diff = target - state.paddles.right.cy;
  if (Math.abs(diff) <= deadzone) return 0;
  return Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
}

function advancePaddles(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
  dt: number,
): CaromState["paddles"] {
  const soloUp =
    api.input.value("p1-up") > 0 || api.input.value("p2-up") > 0 ? 1 : 0;
  const soloDown =
    api.input.value("p1-down") > 0 || api.input.value("p2-down") > 0 ? 1 : 0;

  const leftHumanVy =
    state.mode === "solo"
      ? movementVy(soloUp, soloDown)
      : movementVy(api.input.value("p1-up"), api.input.value("p1-down"));
  const rightHumanVy = movementVy(
    api.input.value("p2-up"),
    api.input.value("p2-down"),
  );

  const leftVy = state.paddles.left.driven
    ? state.paddles.left.drivenVy
    : leftHumanVy;
  const rightVy = state.paddles.right.driven
    ? state.paddles.right.drivenVy
    : state.mode === "solo"
      ? aiVy(state, dt)
      : rightHumanVy;

  return {
    left: integratePaddle(state.paddles.left, leftVy, dt),
    right: integratePaddle(state.paddles.right, rightVy, dt),
  };
}

function startMatch(state: DeepReadonly<CaromState>, mode: Mode): CaromState {
  return {
    ...copyState(state),
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: ballAtHome(),
    paddles: {
      left: { ...state.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...state.paddles.right, cy: FIELD_CY, vy: 0 },
    },
    obstacleClock: 0,
    obstacleClockRunning: true,
    obstacles: allObstacles(0),
  };
}

function returnToTitle(state: DeepReadonly<CaromState>): CaromState {
  return {
    ...initialState(state.muted),
    titleIndex: state.titleIndex,
    simTime: state.simTime,
    menuIndex: state.titleIndex,
  };
}

function menuItems(screen: Screen): readonly string[] {
  if (screen === "title") return TITLE_ITEMS;
  if (screen === "howto") return HOWTO_ITEMS;
  if (screen === "paused") return PAUSE_ITEMS;
  if (screen === "matchover") return MATCHOVER_ITEMS;
  return [];
}

function menuRectFor(screen: Screen, index: number): MenuRect | null {
  const items = menuItems(screen);
  if (index < 0 || index >= items.length) return null;

  const blockH = items.length * MENU_H + (items.length - 1) * MENU_GAP;
  const y0 =
    screen === "title"
      ? TITLE_MENU_Y
      : screen === "paused"
        ? PAUSE_MENU_Y
        : screen === "matchover"
          ? MATCH_MENU_Y
          : HOWTO_MENU_Y;

  return {
    x: FIELD_CX - MENU_W / 2,
    y: y0 + index * (MENU_H + MENU_GAP) - blockH / 2,
    w: MENU_W,
    h: MENU_H,
  };
}

function indexAt(screen: Screen, x: number, y: number): number | null {
  for (let index = 0; index < menuItems(screen).length; index += 1) {
    const rect = menuRectFor(screen, index);
    if (
      rect &&
      x >= rect.x &&
      x <= rect.x + rect.w &&
      y >= rect.y &&
      y <= rect.y + rect.h
    ) {
      return index;
    }
  }
  return null;
}

function moveMenu(state: CaromState, up: boolean, down: boolean): CaromState {
  const count = menuItems(state.screen).length;
  if (count === 0 || (!up && !down)) return state;
  const delta = up ? -1 : 1;
  return { ...state, menuIndex: (state.menuIndex + count + delta) % count };
}

function confirmMenu(state: CaromState): CaromState {
  if (state.screen === "title") {
    if (state.menuIndex === 0)
      return startMatch({ ...state, titleIndex: state.menuIndex }, "solo");
    if (state.menuIndex === 1)
      return startMatch({ ...state, titleIndex: state.menuIndex }, "versus");
    return {
      ...state,
      titleIndex: state.menuIndex,
      screen: "howto",
      menuIndex: 0,
    };
  }

  if (state.screen === "howto") return returnToTitle(state);

  if (state.screen === "paused") {
    if (state.menuIndex === 0) return { ...state, screen: state.resumeScreen };
    if (state.menuIndex === 1) return startMatch(state, state.mode);
    return returnToTitle(state);
  }

  if (state.screen === "matchover") {
    if (state.menuIndex === 0) return startMatch(state, state.mode);
    return returnToTitle(state);
  }

  return state;
}

function pointerMenu(state: CaromState, api: UpdateApi): CaromState {
  if (!["title", "howto", "paused", "matchover"].includes(state.screen))
    return state;

  let next = state;
  const pointer = api.input.pointer();
  const hover = indexAt(state.screen, pointer.x, pointer.y);
  if (hover !== null) next = { ...next, menuIndex: hover };

  for (const sample of api.input.pointerSamples()) {
    const index = indexAt(state.screen, sample.x, sample.y);
    if (index !== null) next = { ...next, menuIndex: index };
  }

  const pressedInside = api.input.pointerPressed()
    ? indexAt(state.screen, pointer.x, pointer.y)
    : null;
  const releasedInside = api.input.pointerReleased()
    ? indexAt(state.screen, pointer.x, pointer.y)
    : null;

  if (
    pressedInside !== null &&
    releasedInside !== null &&
    pressedInside === releasedInside
  ) {
    next = { ...next, menuIndex: releasedInside };
    if (state.screen === "title")
      next = { ...next, titleIndex: releasedInside };
    return confirmMenu(next);
  }

  return next;
}

function readEdges(api: UpdateApi): InputEdges {
  return {
    up: api.input.pressed("p1-up") || api.input.pressed("p2-up"),
    down: api.input.pressed("p1-down") || api.input.pressed("p2-down"),
    confirm: api.input.pressed("confirm"),
    back: api.input.pressed("back"),
    pause: api.input.pressed("pause"),
    mute: api.input.pressed("mute"),
  };
}

function applyScreenInput(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
): CaromState {
  const edges = readEdges(api);
  let next = copyState(state);

  if (edges.mute) {
    api.audio.setMuted(!api.audio.muted());
    next = { ...next, muted: api.audio.muted() };
  }

  if (
    (next.screen === "countdown" || next.screen === "playing") &&
    edges.pause
  ) {
    return {
      ...next,
      screen: "paused",
      resumeScreen: next.screen,
      menuIndex: 0,
    };
  }

  if (next.screen === "paused" && (edges.pause || edges.back)) {
    return { ...next, screen: next.resumeScreen };
  }

  if (next.screen === "howto" && (edges.confirm || edges.back))
    return returnToTitle(next);

  if (next.screen === "matchover" && edges.back) return returnToTitle(next);

  if (["title", "paused", "matchover"].includes(next.screen)) {
    const moved = edges.up || edges.down;
    next = moveMenu(next, edges.up, edges.down);
    if (!moved && edges.confirm) next = confirmMenu(next);
  }

  return pointerMenu(next, api);
}

function serveBall(ball: DeepReadonly<BallState>, receiver: Side): BallState {
  const dir = receiver === "left" ? -1 : 1;
  return {
    ...ball,
    held: false,
    holdTimer: 0,
    trail: [],
    vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
    vy: ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
  };
}

function addTrail(ball: BallState, simTime: number): BallState {
  const trail = [
    ...ball.trail.filter((sample) => simTime - sample.t <= TRAIL_TIME),
    { x: ball.x, y: ball.y, t: simTime },
  ];
  return { ...ball, trail };
}

function resolveWall(ball: BallState, events: PhysicsEvents): BallState {
  let next = ball;
  if (next.y - BALL_R < 0 && next.vy < 0) {
    next = { ...next, y: BALL_R, vy: -next.vy };
    events.wall = true;
  } else if (next.y + BALL_R > FIELD_H && next.vy > 0) {
    next = { ...next, y: FIELD_H - BALL_R, vy: -next.vy };
    events.wall = true;
  }
  return next;
}

function resolvePaddle(
  ball: BallState,
  paddle: DeepReadonly<PaddleState>,
  side: Side,
  events: PhysicsEvents,
): BallState {
  const x0 = side === "left" ? P1_X0 : P2_X0;
  const x1 = side === "left" ? P1_X1 : P2_X1;
  const y0 = paddle.cy - PADDLE_HALF;
  const y1 = paddle.cy + PADDLE_HALF;

  if (
    ball.x <= x0 - BALL_R ||
    ball.x >= x1 + BALL_R ||
    ball.y <= y0 - BALL_R ||
    ball.y >= y1 + BALL_R
  ) {
    return ball;
  }

  const depths = [
    ball.x - (x0 - BALL_R),
    x1 + BALL_R - ball.x,
    ball.y - (y0 - BALL_R),
    y1 + BALL_R - ball.y,
  ];
  let face = 0;
  for (let i = 1; i < depths.length; i += 1) {
    if (depths[i] < depths[face]) face = i;
  }

  if (face === 2) {
    events.wall = true;
    return {
      ...ball,
      y: y0 - BALL_R,
      vy: ball.vy > 0 ? -ball.vy : ball.vy,
    };
  }
  if (face === 3) {
    events.wall = true;
    return {
      ...ball,
      y: y1 + BALL_R,
      vy: ball.vy < 0 ? -ball.vy : ball.vy,
    };
  }

  const hitFront = side === "left" ? face === 1 : face === 0;
  if (!hitFront) {
    return {
      ...ball,
      x: face === 0 ? x0 - BALL_R : x1 + BALL_R,
      vx:
        face === 0 && ball.vx > 0
          ? -ball.vx
          : face === 1 && ball.vx < 0
            ? -ball.vx
            : ball.vx,
    };
  }

  const speed = Math.min(Math.hypot(ball.vx, ball.vy) * SPEED_MULT, SPEED_CAP);
  const offset = clamp((ball.y - paddle.cy) / PADDLE_HALF, -1, 1);
  const theta = offset * MAX_BOUNCE_ANGLE;
  const dir = side === "left" ? 1 : -1;

  events.paddle = true;
  return {
    ...ball,
    x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
    vx: dir * speed * Math.cos(theta),
    vy: speed * Math.sin(theta),
    spin: clamp(
      ball.spin + paddle.vy * SPIN_FROM_PADDLE,
      -SPIN_CLAMP,
      SPIN_CLAMP,
    ),
  };
}

function resolveObstacle(
  ball: BallState,
  obstacle: DeepReadonly<ObstacleState>,
  events: PhysicsEvents,
): BallState {
  const cos = Math.cos(obstacle.theta);
  const sin = Math.sin(obstacle.theta);
  const dx = ball.x - obstacle.cx;
  const dy = ball.y - obstacle.cy;
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;
  const qx = clamp(lx, -OBSTACLE_HW, OBSTACLE_HW);
  const qy = clamp(ly, -OBSTACLE_HH, OBSTACLE_HH);
  const ox = lx - qx;
  const oy = ly - qy;
  const d2 = ox * ox + oy * oy;

  if (d2 >= BALL_R * BALL_R) return ball;

  let nlx = 0;
  let nly = 0;
  let penetration: number;

  if (d2 > 0) {
    const d = Math.sqrt(d2);
    nlx = ox / d;
    nly = oy / d;
    penetration = BALL_R - d;
  } else {
    const depths = [
      OBSTACLE_HW - lx,
      lx + OBSTACLE_HW,
      OBSTACLE_HH - ly,
      ly + OBSTACLE_HH,
    ];
    let face = 0;
    for (let i = 1; i < depths.length; i += 1) {
      if (depths[i] < depths[face]) face = i;
    }
    if (face === 0) nlx = 1;
    else if (face === 1) nlx = -1;
    else if (face === 2) nly = 1;
    else nly = -1;
    penetration = BALL_R + depths[face];
  }

  const nx = nlx * cos - nly * sin;
  const ny = nlx * sin + nly * cos;
  const dot = ball.vx * nx + ball.vy * ny;
  const reflected =
    dot < 0
      ? {
          vx: ball.vx - 2 * dot * nx,
          vy: ball.vy - 2 * dot * ny,
        }
      : { vx: ball.vx, vy: ball.vy };

  events.obstacle = true;
  return {
    ...ball,
    x: ball.x + nx * (penetration + 0.001),
    y: ball.y + ny * (penetration + 0.001),
    vx: reflected.vx,
    vy: reflected.vy,
  };
}

function stepBall(
  ball: BallState,
  state: DeepReadonly<CaromState>,
  dt: number,
  events: PhysicsEvents,
): BallState {
  if (ball.held || dt <= 0) return ball;

  let next = ball;
  const frameSpeed = Math.hypot(next.vx, next.vy);
  const steps = Math.max(1, Math.ceil((frameSpeed * dt) / MAX_SUBSTEP));
  const h = dt / steps;

  for (let i = 0; i < steps; i += 1) {
    const speed = Math.hypot(next.vx, next.vy);
    if (speed > 0) {
      const angle = (next.spin / speed) * h;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      next = {
        ...next,
        vx: next.vx * cos - next.vy * sin,
        vy: next.vx * sin + next.vy * cos,
      };
    }
    next = {
      ...next,
      spin: next.spin * 0.5 ** (h / SPIN_HALFLIFE),
      x: next.x + next.vx * h,
      y: next.y + next.vy * h,
    };

    next = resolveWall(next, events);
    next = resolvePaddle(next, state.paddles.left, "left", events);
    next = resolvePaddle(next, state.paddles.right, "right", events);
    for (const obstacle of state.obstacles) {
      next = resolveObstacle(next, obstacle, events);
    }
  }

  return next;
}

function scorePoint(
  state: CaromState,
  scorer: Side,
  ball: BallState,
): CaromState {
  const score = {
    p1: state.score.p1 + (scorer === "left" ? 1 : 0),
    p2: state.score.p2 + (scorer === "right" ? 1 : 0),
  };
  const leftWins = score.p1 >= WIN_SCORE && score.p1 - score.p2 >= WIN_LEAD;
  const rightWins = score.p2 >= WIN_SCORE && score.p2 - score.p1 >= WIN_LEAD;

  if (leftWins || rightWins) {
    return {
      ...state,
      score,
      ball,
      winner: scorer,
      screen: "matchover",
      menuIndex: 0,
    };
  }

  return {
    ...state,
    score,
    receiver: scorer === "left" ? "right" : "left",
    ball: ballAtHome(),
    screen: "countdown",
  };
}

function advanceMatch(
  state: CaromState,
  api: UpdateApi,
  dt: number,
): CaromState {
  if (state.screen !== "countdown" && state.screen !== "playing") return state;

  let next: CaromState = {
    ...state,
    paddles: advancePaddles(state, api, dt),
  };

  if (next.obstacleClockRunning) {
    next = {
      ...next,
      obstacleClock: next.obstacleClock + dt,
    };
  }

  const obstacleCollisionState = withObstaclePoses({
    ...next,
    obstacleClock: state.obstacleClock,
  });
  next = withObstaclePoses(next);

  if (!next.ball) return next;

  if (next.screen === "countdown") {
    const holdTimer = Math.max(0, next.ball.holdTimer - dt);
    let ball: BallState = { ...next.ball, holdTimer, x: FIELD_CX, y: FIELD_CY };
    let screen: Screen = next.screen;
    if (holdTimer <= 0) {
      ball = serveBall(ball, next.receiver);
      screen = "playing";
    }
    return {
      ...next,
      screen,
      ball: addTrail(ball, next.simTime),
    };
  }

  const events: PhysicsEvents = { wall: false, paddle: false, obstacle: false };
  const physicsState = {
    ...obstacleCollisionState,
    paddles: next.paddles,
  };
  let ball = stepBall(next.ball, physicsState, dt, events);

  if (ball.x - BALL_R > FIELD_W) {
    api.audio.play(CUES.score);
    return scorePoint(next, "left", ball);
  }
  if (ball.x + BALL_R < 0) {
    api.audio.play(CUES.score);
    return scorePoint(next, "right", ball);
  }

  ball = addTrail(ball, next.simTime);
  if (events.wall) api.audio.play(CUES.wallBounce);
  if (events.paddle) api.audio.play(CUES.paddleHit);
  if (events.obstacle) api.audio.play(CUES.obstacleBounce);
  return { ...next, ball };
}

function requireBall(state: DeepReadonly<CaromState>): DeepReadonly<BallState> {
  if (!state.ball) throw new Error("Carom: no ball is present");
  return state.ball;
}

function replaceBall(
  state: DeepReadonly<CaromState>,
  ball: BallState,
): CaromState {
  return { ...copyState(state), ball };
}

function buildDebug(): CaromDebugApi {
  return {
    version: CAROM_DEBUG_VERSION,
    clearWorld: (state) => ({ ...copyState(state), ball: null, obstacles: [] }),
    spawnBall: (state) => ({ ...copyState(state), ball: ballAtHome() }),
    spawnObstacle: (state, index) => {
      const next = copyState(state);
      const obstacle = obstaclePose(index, next.obstacleClock);
      return {
        ...next,
        obstacles: [
          ...next.obstacles.filter((item) => item.index !== index),
          obstacle,
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (state) => initialState(state.muted),
    reconcile: (state) => withObstaclePoses(copyState(state)),
    setScreen: (state, screen) => ({ ...copyState(state), screen }),
    setMode: (state, mode) => ({ ...copyState(state), mode }),
    setMenuIndex: (state, menuIndex) => ({ ...copyState(state), menuIndex }),
    setTitleIndex: (state, titleIndex) => ({ ...copyState(state), titleIndex }),
    setResumeScreen: (state, resumeScreen) => ({
      ...copyState(state),
      resumeScreen,
    }),
    setScore: (state, p1, p2) => ({ ...copyState(state), score: { p1, p2 } }),
    setWinner: (state, winner) => ({ ...copyState(state), winner }),
    setReceiver: (state, receiver) => ({ ...copyState(state), receiver }),
    setPaddleCy: (state, side, cy) => ({
      ...copyState(state),
      paddles: {
        ...state.paddles,
        [side]: { ...state.paddles[side], cy },
      },
    }),
    setPaddleVy: (state, side, drivenVy) => ({
      ...copyState(state),
      paddles: {
        ...state.paddles,
        [side]: { ...state.paddles[side], drivenVy },
      },
    }),
    setPaddleDriven: (state, side, driven) => ({
      ...copyState(state),
      paddles: {
        ...state.paddles,
        [side]: { ...state.paddles[side], driven },
      },
    }),
    setBallPosition: (state, x, y) =>
      replaceBall(state, { ...requireBall(state), x, y }),
    setBallVelocity: (state, vx, vy) =>
      replaceBall(state, { ...requireBall(state), vx, vy }),
    setBallSpin: (state, spin) =>
      replaceBall(state, { ...requireBall(state), spin }),
    setBallHeld: (state, held) =>
      replaceBall(state, { ...requireBall(state), held }),
    setBallHoldTimer: (state, holdTimer) =>
      replaceBall(state, { ...requireBall(state), holdTimer }),
    setBallServeSign: (state, serveSign) =>
      replaceBall(state, { ...requireBall(state), serveSign }),
    drawBallServeSign: (state) =>
      replaceBall(state, { ...requireBall(state), serveSign: signChoice() }),
    setAiTracking: (state, tracking) => ({
      ...copyState(state),
      ai: { ...state.ai, tracking },
    }),
    setAiMovement: (state, movement) => ({
      ...copyState(state),
      ai: { ...state.ai, movement },
    }),
    setMuted: (state, muted) => ({ ...copyState(state), muted }),
    setObstacleClock: (state, obstacleClock) =>
      withObstaclePoses({ ...copyState(state), obstacleClock }),
    setObstacleClockRunning: (state, obstacleClockRunning) => ({
      ...copyState(state),
      obstacleClockRunning,
    }),
    snapshot: (state) => ({
      ...copyState(state),
      version: CAROM_DEBUG_VERSION,
      ball: state.ball
        ? {
            ...state.ball,
            trail: state.ball.trail.map((sample) => ({ ...sample })),
            speed: Math.hypot(state.ball.vx, state.ball.vy),
          }
        : null,
      obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
    }),
    menuItemRect: (state, index) => menuRectFor(state.screen, index),
  };
}

function register(api: InitApi<CaromState>): void {
  for (const action of ACTIONS) {
    api.input.register(action, { keys: [...BINDINGS[action]] });
  }

  api.audio.define(CUES.paddleHit, {
    wave: "triangle",
    freq: 440,
    freqTo: 680,
    gain: 0.17,
    durationMs: 60,
  });
  api.audio.define(CUES.wallBounce, {
    wave: "sine",
    freq: 260,
    freqTo: 180,
    gain: 0.14,
    durationMs: 50,
  });
  api.audio.define(CUES.obstacleBounce, {
    wave: "square",
    freq: 720,
    freqTo: 360,
    gain: 0.11,
    durationMs: 70,
  });
  api.audio.define(CUES.score, {
    wave: "sawtooth",
    freq: 320,
    freqTo: 120,
    gain: 0.16,
    durationMs: 180,
  });

  api.diagnostics.register("screen", (state) => state.screen);
  api.diagnostics.register("mode", (state) => state.mode);
  api.diagnostics.register(
    "score",
    (state) => `${state.score.p1}-${state.score.p2}`,
  );
  api.diagnostics.register("ball pos", (state) =>
    state.ball ? `${state.ball.x.toFixed(1)},${state.ball.y.toFixed(1)}` : "-",
  );
  api.diagnostics.register("ball vel", (state) =>
    state.ball
      ? `${state.ball.vx.toFixed(1)},${state.ball.vy.toFixed(1)}`
      : "-",
  );
  api.diagnostics.register("ball speed", (state) =>
    state.ball ? Math.hypot(state.ball.vx, state.ball.vy) : 0,
  );
  api.diagnostics.register("ball spin", (state) =>
    state.ball ? state.ball.spin : 0,
  );
  api.diagnostics.register(
    "left paddle",
    (state) =>
      `${state.paddles.left.cy.toFixed(1)},${state.paddles.left.vy.toFixed(1)}`,
  );
  api.diagnostics.register(
    "right paddle",
    (state) =>
      `${state.paddles.right.cy.toFixed(1)},${state.paddles.right.vy.toFixed(1)}`,
  );
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawField(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);

  ctx.strokeStyle = "rgba(184, 224, 255, 0.28)";
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 18]);
  ctx.beginPath();
  ctx.moveTo(NET_X, 34);
  ctx.lineTo(NET_X, FIELD_H - 34);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const obstacle of state.obstacles) {
    ctx.save();
    ctx.translate(obstacle.cx, obstacle.cy);
    ctx.rotate(obstacle.theta);
    ctx.shadowColor = "#ffce5c";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffb84d";
    drawRoundRect(
      ctx,
      -OBSTACLE_W / 2,
      -OBSTACLE_H / 2,
      OBSTACLE_W,
      OBSTACLE_H,
      10,
    );
    ctx.restore();
  }

  ctx.shadowBlur = 18;
  ctx.shadowColor = "#25d7ff";
  ctx.fillStyle = "#25d7ff";
  drawRoundRect(
    ctx,
    P1_X0,
    state.paddles.left.cy - PADDLE_HALF,
    PADDLE_W,
    PADDLE_H,
    8,
  );
  ctx.shadowColor = "#ff5e9c";
  ctx.fillStyle = "#ff5e9c";
  drawRoundRect(
    ctx,
    P2_X0,
    state.paddles.right.cy - PADDLE_HALF,
    PADDLE_W,
    PADDLE_H,
    8,
  );
  ctx.shadowBlur = 0;

  if (state.ball) {
    const trail = state.ball.trail;
    if (trail.length > 1) {
      ctx.lineWidth = BALL_R * 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < trail.length; i += 1) {
        const alpha = i / trail.length;
        ctx.strokeStyle = `rgba(227, 255, 116, ${0.08 + alpha * 0.32})`;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }

    ctx.shadowColor = "#e8ff74";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#e8ff74";
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawScores(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = "rgba(231, 246, 255, 0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "700 54px Inter, system-ui, sans-serif";
  ctx.fillText(String(state.score.p1), FIELD_CX - 130, 30);
  ctx.fillText(String(state.score.p2), FIELD_CX + 130, 30);

  ctx.font = "700 18px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(231, 246, 255, 0.62)";
  ctx.fillText(
    state.mode === "solo" ? "SOLO DUEL" : "VERSUS DUEL",
    FIELD_CX,
    96,
  );
}

function drawMenu(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  const items = menuItems(state.screen);
  for (let index = 0; index < items.length; index += 1) {
    const rect = menuRectFor(state.screen, index);
    if (!rect) continue;

    const active = index === state.menuIndex;
    ctx.fillStyle = active
      ? "rgba(232, 255, 116, 0.96)"
      : "rgba(16, 32, 43, 0.92)";
    drawRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? "#e8ff74" : "rgba(184, 224, 255, 0.32)";
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    ctx.fillStyle = active ? "#071119" : "rgba(231, 246, 255, 0.88)";
    ctx.font = "800 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(items[index], FIELD_CX, rect.y + rect.h / 2);
  }
}

function drawOverlay(
  state: DeepReadonly<CaromState>,
  ctx: CanvasRenderingContext2D,
): void {
  if (state.screen === "title") {
    ctx.fillStyle = "rgba(7, 17, 25, 0.66)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e8ff74";
    ctx.font = "900 104px Inter, system-ui, sans-serif";
    ctx.fillText(TITLE_TEXT, FIELD_CX, 210);
    ctx.fillStyle = "rgba(231, 246, 255, 0.76)";
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillText("curve the rally, bank the angle", FIELD_CX, 282);
    drawMenu(state, ctx);
  } else if (state.screen === "howto") {
    ctx.fillStyle = "rgba(7, 17, 25, 0.82)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    ctx.fillStyle = "#e8ff74";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "900 54px Inter, system-ui, sans-serif";
    ctx.fillText("HOW TO PLAY", FIELD_CX, 90);
    ctx.fillStyle = "rgba(231, 246, 255, 0.86)";
    ctx.font = "600 25px Inter, system-ui, sans-serif";
    const lines = [
      "W/S moves the left paddle. Arrow keys move the right paddle in Versus.",
      "In Solo, either set of movement keys drives the left paddle.",
      "Move as you strike the ball to bend its flight with spin.",
      "Use the swaying obstacles for bank shots and awkward returns.",
      "First to 11, win by 2, takes the match.",
    ];
    lines.forEach((line, index) =>
      ctx.fillText(line, FIELD_CX, 190 + index * 48),
    );
    drawMenu(state, ctx);
  } else if (state.screen === "paused") {
    ctx.fillStyle = "rgba(7, 17, 25, 0.72)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e8ff74";
    ctx.font = "900 64px Inter, system-ui, sans-serif";
    ctx.fillText("PAUSED", FIELD_CX, 190);
    drawMenu(state, ctx);
  } else if (state.screen === "matchover") {
    ctx.fillStyle = "rgba(7, 17, 25, 0.78)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e8ff74";
    ctx.font = "900 58px Inter, system-ui, sans-serif";
    ctx.fillText(
      `${state.winner === "left" ? "LEFT" : "RIGHT"} WINS`,
      FIELD_CX,
      176,
    );
    ctx.fillStyle = "rgba(231, 246, 255, 0.86)";
    ctx.font = "800 34px Inter, system-ui, sans-serif";
    ctx.fillText(`${state.score.p1} - ${state.score.p2}`, FIELD_CX, 246);
    drawMenu(state, ctx);
  } else if (state.screen === "countdown" && state.ball) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(232, 255, 116, 0.88)";
    ctx.font = "900 80px Inter, system-ui, sans-serif";
    ctx.fillText(
      Math.ceil(state.ball.holdTimer).toString(),
      FIELD_CX,
      FIELD_CY - 88,
    );
  }
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    register(api);
    return [initialState(false), buildDebug()];
  },

  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    let next = applyScreenInput(
      { ...state, simTime: state.simTime + dt, muted: api.audio.muted() },
      api,
    );
    next = advanceMatch(next, api, dt);
    return { ...next, muted: api.audio.muted() };
  },

  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const { ctx } = api;
    drawField(state, ctx);
    if (
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover"
    ) {
      drawScores(state, ctx);
    }
    drawOverlay(state, ctx);
  },
};
