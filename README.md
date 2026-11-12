# INTAKE

**A dark, flat-shaded vent survival horror game.**
One flashlight. One breath. One way out.

This repository contains the first playable vertical slice of **INTAKE** — the prologue, Kryl Station, and the first vent descent. The full 3–3.5 hour campaign is designed in [`DESIGN.md`](DESIGN.md) and will be built chapter by chapter.

## Play the slice

If GitHub Pages is enabled for this repository, play at:

**https://simonovicj240712-crypto.github.io/intake/**

Or run it locally with any static file server. There is **no build step and no npm install**. For example, with Java 18+:

```powershell
jwebserver -p 8000 -d .
```

Then open <http://127.0.0.1:8000/>.

> Desktop only. Mouse + keyboard. Headphones recommended.
> Click **ENTER THE VENTS**, then click the screen if the mouse is not captured.

## What is in this build

- **Prologue — The Last Dinner.** A camera-only family dinner, the alarm, the Tenant in the corner, the first flashback, the Broodmother under the floor, and Tokar's rescue.
- **Kryl Station.** A small playable hub with Tokar, dialogue, a pistol, and the maintenance vent.
- **Act I — The Descent.** First-person vent movement, flashlight, crouch/crawl, sprint, body looting, and ammo/MGR.
- **The Crawler jumpscare.** Metal-running warning, lunge, 1.8-second kill window, death, and instant checkpoint retry.
- **End of the slice.** Open the hatch after surviving the Crawler.

The full campaign — the Dead Rail, Zarya, the deep vents, the hallucinations, and the final Sanctuary nest — is **not in this build yet**.

## Controls

| Input | Action |
|---|---|
| **W A S D** | Move |
| **Mouse** | Look |
| **Left Mouse** | Fire (in the vents) / strike during a Crawler grab |
| **F** | Flashlight |
| **Ctrl** | Crouch / crawl |
| **Shift** | Sprint |
| **E / Enter** | Interact / search bodies / advance dialogue |
| **R** | Reload |
| **T** | Check magazine |
| **V** | Knife / kick the Crawler off during a grab |
| **Esc** | Release the mouse |

## Content warning

Contains sudden loud sounds, flashing lights, claustrophobic spaces, psychological horror, family tragedy, child peril, character death, stylized violence, and corpses. No gore.

## Debug

These are development shortcuts and do not affect normal play:

- `?scene=vent` — start directly in the first vent.
- `?scene=kryl` — start at Kryl Station.
- In the browser console: `__intake.snapshot()`, `__intake.goto("vent")`, `__intake.triggerAmbush()`, `__intake.kill()`, `__intake.step(0.1)`.

## Tech

- [Three.js](https://threejs.org/) r160, vendored in `vendor/three.module.js`
- Vanilla ES modules
- No build step, no bundler, no npm
- Flat-shaded low-poly geometry and procedural audio
- Designed for GitHub Pages

## Visual direction

The flat-shaded low-poly **look** is inspired by *Fury Foot*. No Fury Foot mechanics, assets, characters, maps, HUD, or tone are used. The game itself is INTAKE: a Metro-inspired vent horror story.

## Roadmap

1. **Current:** vertical slice — prologue, Kryl, first vent.
2. **Next:** the Dead Rail open area and Zarya.
3. **Then:** the deep vents, the Warren, the Flooded Duct, and the Dead Fan.
4. **Finally:** the Lair, the last crawl to Sanctuary, and the nest ending.
5. **Polish:** accessibility, audio pass, lighting pass, playtests, GitHub Pages release.

The full design — story, systems, enemies, hallucinations, economy, and ending — is in [`DESIGN.md`](DESIGN.md).
