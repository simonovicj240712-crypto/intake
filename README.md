# INTAKE

**A dark, flat-shaded vent survival horror game.**
One flashlight. One breath. One way out.

Playable in the browser. No install, no build step.

## Play

**https://simonovicj240712-crypto.github.io/intake/?v=34**

Or run locally with any static file server. For example, with Java 18+:

```powershell
jwebserver -p 8000 -d .
```

Then open <http://127.0.0.1:8000/>.

> Desktop only. Mouse + keyboard. Headphones recommended.
> Click the play glyph. The mouse is captured immediately; there are no look or interaction prompts.

## Current build

This is the **complete playable campaign pass** — a condensed version of the full 3–3.5 hour design. All major story beats are in:

- **Prologue — The Last Night in the Bunker.** A Metro-style underground room with the outside visible only through gaps in the boards, the family dinner, the father leaving through the floor hatch, the spinning ceiling alarm, the Broodmother breaking through the boards, Tokar's rescue, and the armored-car ride through the ruins. The attack now has a longer escalation, a growing Broodmother, and a final low-angle shot looking up at the rat before the gunshot.
- **Animated Tenants.** The black, faceless tall creatures now sway, turn their heads, reach with long arms, and dissolve when observed instead of standing frozen.
- **Kryl Station.** An expanded survivor market with bunk rooms, a clinic, a canteen, a shrine, wandering NPCs, Tokar, the first pistol, and the descent.
- **Act I — The Descent.** First vent, body looting, and the first Crawler jumpscare.
- **The Dead Rail.** Open rail yard, ruined skyline, scavengers, rats, the gate to Zarya, and the Passenger Car vision.
- **Zarya Station.** An expanded trade city with a hospital, restaurant, residential gallery, market plaza, Vera's shop, the shotgun and rifle, and the lower-platform vision.
- **The Deep.** Branching vent mazes: the Warren (fuses), the Flooded Duct (valves), the Dead Fan, and the safe room.
- **The Lair.** A larger maze, the valves, the watchers, and the Mirror vision.
- **The Last Crawl.** A forced-crawl vent run with a Tenant sighting, a final Crawler, and the Sanctuary hatch.
- **The Nest.** The ending. No retry.

The current pass also includes:

- **Cel-shaded comic look** — `MeshToonMaterial` lighting, thick black character outlines, rounded low-poly heads and bodies, and saturated teal/blue + orange/yellow palettes.
- **Procedural surface textures** — riveted metal walls, concrete floors, wood planks, tile, grime, and rust.
- **Light glow halos** around lamps, signs, warning lights, and the moon.
- **3D memory dioramas** instead of text-only flashbacks. Click or press **E** to let go of a memory.
- **Branching vent mazes** with dead ends, loops, hanging signs, wall fans, ducts, hazard bands, pipes, grates, crates, and flickering lamps.
- **Visual-only interaction** — pickups, bodies, notes, fuses, valves, consoles, radios, and unlocked doors trigger automatically on approach. Doors use three progress pips and a red/green status lamp instead of text. Vera's shop is marked by a floating coin and opened with **E**.
- **Pictogram signage** — station, rail, vent, hatch, fan, hazard, shelter, lock, air, water, and count signs are drawn as icons, never words.
- **Show-don't-tell presentation** — narration subtitles are removed. Speech appears only for character dialogue, with clickable/Enter-advanced conversation and a player response.
- **A new wordless prologue** — a Metro-style bunker home, a living city seen through the reinforced window, a spinning ceiling alarm, the Broodmother attack, Tokar’s rescue, and an armored-car ride through the ruined city.
- **Expanded city hubs** — Kryl and Zarya are now multi-room districts with markets, bunk rooms, clinics, canteens, shrines, guard posts, wandering NPCs, and short ambient dialogue.
- **Real recorded audio** — a bundled CC0/UGC sound set for the Crawler scream, monster growls, gunshots, rat squeals, footsteps, breathing, doors, city crowd, calm jazz, and vent ambience, with synthesized fallbacks.
- **One-shot vermin** — normal rats are standardized brown versions and die from one pistol round; the pale Crawler can be dropped with one shot during the grab.
- **City jazz and vent dread** — Kryl and Zarya run calm, spatial jazz loops under crowd noise; the vents replace them with a low hum, breathing, and metal creaks.
- **Scene overhaul** — Kryl is a lived-in station market with a city window and station sign; the Dead Rail has a gantry, containers, signal masts and sleepers; the Fan chamber has a huge fan housing, catwalk, console and floodlights; the safe room has a bunk, desk, shelves and stove; the Last Crawl has low bulkheads, support frames and wall lights; the Nest has an organic mound, pulsing heart and hanging pods.
- **A title-screen diorama** behind a wordless brand-and-play title.
- **An icon-only HUD** for health, medkits, MGR, logs, and ammo.
- **Aim-down-sights**, hit markers, enemy line-of-sight, spawn grace, knockback, and melee damage.
- **Ceiling Crawler sightings** and ambush scares in the deep vents.
- **A hardened play button** — click anywhere on the title, or press Enter; if the engine fails to load, the play glyph pulses red instead of doing nothing.

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
| **E / Enter** | Open Vera's shop / advance dialogue / let go of a memory |
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
- Pointer lock must be granted by the browser. Starting the game with the play glyph requests it immediately; if the browser dismisses it, click the screen once. There is deliberately no on-screen look hint.
- If the play glyph appears to do nothing, wait up to five seconds: a hidden boot status records engine errors in the console, and the glyph pulses red on failure. A hard refresh (`Ctrl+F5`) or opening the live link with `?v=34` clears old cached builds.
- Some set dressing and creature animation still reads as placeholder; the maze layout is procedurally generated on every load.
- Automated tests cover transitions, auto-interaction, shop, death/retry, and the ending, but not trusted user pointer-lock input.

## Tech

- [Three.js](https://threejs.org/) r160, vendored in `vendor/three.module.js`
- Vanilla ES modules
- No build step, no bundler, no npm
- Flat-shaded low-poly geometry
- Procedural Web Audio sound with bundled CC0 recordings and synthesized fallbacks
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
