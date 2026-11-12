# INTAKE

**A dark, flat-shaded vent survival horror game.**
One flashlight. One breath. One way out.

Playable in the browser. No install, no build step.

## Play

**https://simonovicj240712-crypto.github.io/intake/**

Or run locally with any static file server. For example, with Java 18+:

```powershell
jwebserver -p 8000 -d .
```

Then open <http://127.0.0.1:8000/>.

> Desktop only. Mouse + keyboard. Headphones recommended.
> Click **ENTER THE VENTS**, then click the screen if the mouse is not captured.

## Current build

This is the **first complete playable campaign pass** — a condensed version of the full 3–3.5 hour design. All major story beats are in:

- **Prologue — The Last Dinner.** Family dinner, the alarm, the Tenant in the corner, the first flashback, the Broodmother under the floor, Tokar's rescue.
- **Kryl Station.** Tokar, the first pistol, and the descent.
- **Act I — The Descent.** First vent, body looting, and the first Crawler jumpscare.
- **The Dead Rail.** Open rail yard, scavengers, rats, the gate to Zarya, and the Passenger Car vision.
- **Zarya Station.** Vera's shop, the shotgun and rifle, ammo, medkits, and the lower-platform vision.
- **The Deep.** The Warren, the Flooded Duct, the Dead Fan, and the safe room.
- **The Lair.** The nest, the valves, the watchers, and the Mirror vision.
- **The Last Crawl.** A quiet vent run to Sanctuary Intake 04.
- **The Nest.** The ending. No retry.

The full 3–3.5 hour design — more logs, side jobs, city detail, expanded Deep chapter, and more hallucinations — is in [`DESIGN.md`](DESIGN.md). This build is the foundation; future updates will expand it.

## Controls

| Input | Action |
|---|---|
| **W A S D** | Move |
| **Mouse** | Look |
| **Left Mouse** | Fire |
| **Right Mouse** | Aim down sights |
| **F** | Flashlight |
| **Ctrl** | Crouch / crawl |
| **Shift** | Sprint |
| **E / Enter** | Interact / loot / advance dialogue |
| **1 / 2 / 3** | Pistol / shotgun / rifle |
| **R** | Reload |
| **T** | Check magazine and reserve |
| **H** | Use medkit |
| **V** | Knife / break a Crawler grab |
| **Esc** | Pause / release mouse |

## Content warning

Contains sudden loud sounds, flashing lights, claustrophobic spaces, psychological horror, family tragedy, child peril, character death, stylized violence, and corpses. No gore.

## Debug

These are development shortcuts and do not affect normal play:

- `?scene=dead_rail`, `?scene=zarya`, `?scene=warren`, `?scene=flooded`, `?scene=fan`, `?scene=safe_room`, `?scene=lair`, `?scene=last_crawl`, `?scene=nest`.
- `?scene=vent`, `?scene=kryl`.
- In the console: `__intake.snapshot()`, `__intake.goto("zarya")`, `__intake.step(0.1)`, `__intake.addMgr(50)`, `__intake.give("shotgun")`, `__intake.heal()`.

## Tech

- [Three.js](https://threejs.org/) r160, vendored in `vendor/three.module.js`
- Vanilla ES modules
- No build step, no bundler, no npm
- Flat-shaded low-poly geometry
- Procedural Web Audio sound
- GitHub Pages

## Visual direction

The flat-shaded low-poly **look** is inspired by *Fury Foot*. No Fury Foot mechanics, assets, characters, maps, HUD, or tone are used. The game itself is INTAKE: a Metro-inspired vent horror story.

## Roadmap

1. **Current:** complete campaign pass (condensed).
2. **Next:** expand the Dead Rail and Zarya, add side jobs and more logs.
3. **Then:** expand the Deep into the full Warren, Flooded Duct, and Dead Fan acts.
4. **Finally:** more hallucination variants, more corpse interactions, audio/lighting polish, and accessibility passes.

## Credits

See [`CREDITS.md`](CREDITS.md).
