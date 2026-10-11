import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import {
  BALL_R,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  OBSTACLE_CENTERS,
  P1_X1,
} from "./constants";
import { BACKGROUND, game } from "./game";
import type { CaromDebugApi, CaromState } from "./game";

function makeEngine(stepMs = 16) {
  const target = new EventTarget();
  const canvas = createCanvas(FIELD_W, FIELD_H);
  const engine = createEngine<CaromState, CaromDebugApi>({
    canvas: canvas as unknown as HTMLCanvasElement,
    width: FIELD_W,
    height: FIELD_H,
    game,
    background: BACKGROUND,
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => FIELD_W,
      cssHeight: () => FIELD_H,
      dpr: () => 1,
      events: () => target,
    },
  });
  return engine;
}

describe("Carom", () => {
  it("initializes the title state and debug snapshot", async () => {
    const engine = makeEngine();
    await engine.initialize();

    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.version).toBe(1);
    expect(snapshot.screen).toBe("title");
    expect(snapshot.mode).toBe("solo");
    expect(snapshot.ball?.held).toBe(true);
    expect(snapshot.ball?.x).toBe(FIELD_CX);
    expect(snapshot.ball?.y).toBe(FIELD_CY);
    expect(snapshot.obstacles).toHaveLength(2);
    expect(engine.debug.menuItemRect(engine.state, 0)).not.toBeNull();
  });

  it("serves toward the receiver when the hold timer elapses", async () => {
    const engine = makeEngine();
    await engine.initialize();

    engine.apply((state) => engine.debug.setScreen(state, "countdown"));
    engine.apply((state) => engine.debug.setBallHoldTimer(state, 0.01));
    engine.apply((state) => engine.debug.setBallServeSign(state, 1));
    await engine.advance(1);

    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.screen).toBe("playing");
    expect(snapshot.ball?.held).toBe(false);
    expect(snapshot.ball?.holdTimer).toBe(0);
    expect(snapshot.ball?.vx).toBeLessThan(0);
    expect(snapshot.ball?.vy).toBeGreaterThan(0);
    expect(snapshot.ball?.trail).toHaveLength(1);
  });

  it("adds paddle spin from a driven paddle hit", async () => {
    const engine = makeEngine();
    await engine.initialize();

    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) => engine.debug.setPaddleDriven(state, "left", true));
    engine.apply((state) => engine.debug.setPaddleVy(state, "left", 720));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, P1_X1 + BALL_R + 2, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, -520, 0));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    await engine.advance(1);

    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.ball?.vx).toBeGreaterThan(0);
    expect(snapshot.ball?.spin).toBeGreaterThan(500);
    expect(snapshot.paddles.left.vy).toBeGreaterThan(0);
  });

  it("scores, parks the ball, and sets the next receiver", async () => {
    const engine = makeEngine();
    await engine.initialize();

    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, FIELD_W + BALL_R + 2, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, 120, 0));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    await engine.advance(1);

    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.score).toEqual({ p1: 1, p2: 0 });
    expect(snapshot.screen).toBe("countdown");
    expect(snapshot.receiver).toBe("right");
    expect(snapshot.ball?.held).toBe(true);
    expect(snapshot.ball?.holdTimer).toBe(HOLD_TIME);
    expect(snapshot.ball?.trail).toHaveLength(0);
  });

  it("reconciles obstacle poses from the obstacle clock", async () => {
    const engine = makeEngine();
    await engine.initialize();

    engine.apply((state) => engine.debug.setObstacleClock(state, 0.9));
    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.obstacles[0].cx).toBe(OBSTACLE_CENTERS[0].x);
    expect(snapshot.obstacles[1].cx).toBe(OBSTACLE_CENTERS[1].x);
    expect(snapshot.obstacles[0].cy).toBeGreaterThan(OBSTACLE_CENTERS[0].y);
    expect(snapshot.obstacles[1].cy).toBeLessThan(OBSTACLE_CENTERS[1].y);
    expect(snapshot.obstacles[0].theta).toBeGreaterThan(0);
  });
});
