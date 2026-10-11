# Carom

Carom is a top-down browser paddle duel with curved shots, swaying obstacles,
and quick local matches. Two paddles face off across a dark field while the ball
ricochets off walls and rotating mid-field blockers. Move as you strike the ball
to add spin and bend the next return.

The game runs entirely in the browser on the Simple 2D engine. It ships as a
static Vite site with no backend, asset downloads, accounts, or runtime secrets.

## Install

```sh
npm ci
```

## Development

```sh
npm run dev
```

Vite prints the local URL. Open it in a browser to play with hot reload.

## Production Build

```sh
npm run build
```

The finished static site is written to `dist/`, with `dist/index.html` as the
entry point.

## Controls

- Left paddle: `W` and `S`
- Right paddle in Versus: `ArrowUp` and `ArrowDown`
- Solo: either movement key pair controls the left paddle
- Confirm: `Enter` or `Space`
- Pause: `P` or `Escape`
- Back: `Escape`
- Mute: `M`
