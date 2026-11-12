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

This is the **complete playable campaign pass** — a condensed version of the full 3–3.5 hour design. All major story beats are in:

- **Prologue — The Last Dinner.** A playable family dinner, the alarm, the Tenant in the corner, the first flashback, the Broodmother under the floor, Tokar's rescue.
- **Kryl Station.** Tokar, the first pistol, and the descent.
- **Act I — The Descent.** First vent, body looting, and the first Crawler jumpscare.
- **The Dead Rail.** Open rail yard, ruined skyline, scavengers, rats, the gate to Zarya, and the Passenger Car vision.
- **Zarya Station.** Vera's shop, the shotgun and rifle, ammo, medkits, and the lower-platform vision.
- **The Deep.** Branching vent mazes: the Warren (fuses), the Flooded Duct (valves), the Dead Fan, and the safe room.
- **The Lair.** A larger maze, the valves, the watchers, and the Mirror vision.
- **The Last Crawl.** A forced-crawl vent run with a Tenant sighting, a final Crawler, and the Sanctuary hatch.
- **The Nest.** The ending. No retry.

The current pass also includes:

- **Cel-shaded comic look** — `MeshToonMaterial` lighting, thick black character outlines, rounded low-poly heads and bodies, and saturated teal/blue + orange/yellow palettes.
- **Procedural surface textures** — riveted metal walls, concrete floors, wood planks, tile, grime, and rust.
- **Light glow halos** around lamps, signs, warning lights, and the moon.
- **3D memory dioramas** instead of text-only flashbacks. Press **E** or click to let go of a memory.
- **Branching vent mazes** with dead ends, loops, hanging signs, wall fans, ducts, hazard bands, pipes, grates, crates, and flickering lamps.
- **A title-screen diorama** behind the main menu, with a bold comic title treatment.
- **A minimal HUD** for health, medkits, MGR, logs, current weapon, and ammo.
- **Aim-down-sights**, hit markers, enemy line-of-sight, spawn grace, knockback, and melee damage.
- **Ceiling Crawler sightings** and ambush scares in the deep vents.
- **A hardened start button** — click anywhere on the title, or press Enter; if the engine fails to load, the title shows a boot error instead of doing nothing.

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
| **E / Enter** | Interact / loot / advance dialogue / let go of a memory |
| **1 / 2 / 3** | Pistol / shotgun / rifle |
| **R** | Reload |
| **T** | Check magazine and reserve |
| **H** | Use medkit |
| **V** | Knife / break a Crawler grab |
| **Esc** | Release the mouse / close the shop |

## Content warning

Contains sudden loud sounds, flashing lights, claustrophobic spaces, psychological horror, family tragedy, child peril, character death, stylized violence, and corpses. No gore.

## Debug

These are development shortcuts and do not affect normal play:

- `?scene=dead_rail`, `?scene=zarya`, `?scene=warren`, `?scene=flooded`, `?scene=fan`, `?scene=safe_room`, `?scene=lair`, `?scene=last_crawl`, `?scene=nest`.
- `?scene=vent`, `?scene=kryl`.
- In the console: `__intake.snapshot()`, `__intake.goto("zarya")`, `__intake.step(0.1)`, `__intake.worldInfo()`, `__intake.interact()`, `__intake.addMgr(50)`, `__intake.give("shotgun")`, `__intake.heal()`, `__intake.damage(10)`, `__intake.scare()`, `__intake.jumpscareHit()`.
- Test hooks: `__intake.setHealth(n)`, `__intake.setPos(x, z)`, `__intake.look(yaw, pitch)`, `__intake.fire()`, `__intake.reload()`, `__intake.melee()`, `__intake.die()`, `__intake.kill()`.

## Known limitations

- This is a condensed prototype, not the full 3–3.5 hour design.
- Pointer lock must be granted by the browser. If the mouse does not capture, click the screen once.
- If **ENTER THE VENTS** appears to do nothing, wait up to five seconds: the title now prints a boot error if the engine module did not load. A hard refresh (`Ctrl+F5`) or opening the live link with `?v=10` clears old cached builds.
- Some set dressing and creature animation still reads as placeholder; the maze layout is procedurally generated on every load.
- Automated tests cover transitions, interactions, combat, shop, death/retry, and the ending, but not real user pointer-lock input.

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

1. **Current:** complete campaign pass with 3D memories, branching mazes, HUD, and mouse-look.
2. **Next:** more side rooms and logs, expanded Dead Rail/Zarya, and more vision variants.
3. **Then:** expand the Deep into the full Warren, Flooded Duct, and Dead Fan acts.
4. **Finally:** animation polish, more creature behaviors, accessibility options, and balance passes.

## Credits

See [`CREDITS.md`](CREDITS.md).
