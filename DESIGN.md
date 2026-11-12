# INTAKE
### Working design document — v2.0

> **Implementation status:** the first complete playable campaign is in the repo — prologue, Kryl, Dead Rail, Zarya, the deep vents, the Lair, the last crawl, and the Nest ending. It is a condensed pass; the expanded 3–3.5 hour version described below is the target for future updates. The current build also has 3D memory dioramas, branching vent mazes, a title-screen diorama, an icon-only vitals/ammo HUD, and skippable memories. The visual pass is **cel-shaded comic horror**: toon-banded lighting, black outlines, rounded organic low-poly characters, and saturated teal/orange/yellow palettes. The scene pass has added lived-in hubs, landmark set pieces, support structures, hanging lamps and light shafts. The presentation is now **visual-first**: narration text is gone, interaction is automatic, doors show requirement pips, signage is pictograms, and words appear only in character dialogue and player responses.

> **Logline:** A scavenger descends into the ventilation system of a dead metro station to restore the air and reach Sanctuary, the last safe city. The vents are not empty. Something down here learned to move through them.

**Working title:** INTAKE
**Alternatives:** CRAWL, DUCT 13, LOW CEILING
**Genre:** First-person survival horror
**Platform:** Desktop browser (mouse + keyboard), GitHub Pages
**Length:** ~3–3.5 hours main path · up to ~4 hours with side jobs and logs
**Structure:** Prologue + 3 chapters · 11 acts · 2 city hubs · 2 open areas · 13 scripted scares · 8 hallucinations · systemic vent ambushes
**Combat:** Realistic guns, projectile ballistics, knife melee, ragdoll bodies
**Visual style:** Fury Foot-style flat-shaded low-poly, dark industrial palette
**Mutants:** The Tenant (psychological) · Crawlers (vent ambush) · Mutant Rats (swarm) · plus human scavengers
**Engine:** Three.js + cannon-es, vanilla JavaScript, no build step
**Content:** Sudden loud sounds, flashing lights, claustrophobic spaces, horror themes, family tragedy, character death, stylized violence, corpses. No gore.
**Realism target:** Systemic realism with stylized Fury Foot visuals — not photorealism.

> **Visual-first rules (current build):** narration and tutorial text are removed; the mouse is captured from the play glyph; pickups, bodies, notes, fuses, valves, consoles, radios, and unlocked doors trigger automatically; locked doors communicate progress through three pips and a red/green lamp; environmental signage is pictograms; the HUD and shop are icon-led; death, retry, jumpscare, and ending screens are wordless. Words are reserved for character speech and player responses.

---

## 0. Reality check

Photorealistic Metro visuals are not achievable in a no-build browser game made by a small team. We are not chasing them.

**Fury Foot gives us the visual language. Metro gives us the dread.** We are taking Fury Foot's flat-shaded low-poly geometry, simple materials, bold silhouettes, and first-person presentation — then dropping them into near-total darkness. Not its bright palette, not its arcade room-clear structure, not its HUD.

**Visual reference, not design reference.** The game remains INTAKE: a slow-burn vent horror game with cities, guns, hallucinations, and three mutants. We are copying the *look*, not the game. **No kick mechanic, no boot, no door-smashing, no arcade room-clear structure, no Fury Foot HUD, no Fury Foot tone.** Only the flat-shaded low-poly rendering style and first-person presentation.

What we **can** do is make the game feel real:

1. **Systems with consequences** — every bullet, filter, bandage, and repair matters.
2. **Diegetic information** — no floating minimap or quest log; a minimal vitals/ammo HUD, and the world itself supplies the rest.
3. **Grounded sound and lighting** — occlusion, reverb, near-total darkness, a flashlight that behaves like a flashlight.
4. **Weight and animation** — weapons have heft, reloads are physical, bodies have mass.
5. **World detail** — vents sized like real vents, stations that look lived in, props that tell stories.
6. **Fury Foot-style visuals** — flat-shaded low-poly geometry, simple materials, bold silhouettes, first-person hands and weapon. Readable in near-blackness.

**Realism budget order:** darkness & sound → systems → animation → world detail → visual consistency.

If a realism feature adds friction but not immersion, it does not go in.

---

## 1. The pitch

You wake up inside a collapsed air duct with a dying flashlight and a respirator that tastes like rust. The station above is sealed. The only way out is down, through the maintenance vents that feed the old metro tunnels.

The vents are a maze of galvanized steel, dead fans, and hand-dug side passages. Something else uses them. You hear it before you see it: a quick, metallic scrabble, like someone running on steel — then a scream, and a shape filling the vent.

The dead are everywhere. Workers curled in corners. Scavengers slumped against walls. Bodies that still have ammo, filter canisters, and notes in their pockets. You can search them. You can pick them up. You can throw them down a corridor and listen to what comes to investigate.

And then there is the tall black figure. It does not attack. It does not run. It stands at the edge of the light and shows you things — a memory, a warning, a room that isn't there. For thirty seconds to a minute, the world blurs into noise, and only the vision is sharp. When it ends, the figure is suddenly in front of you, close enough to touch. Then it is gone.

Between the vents are the last cities of the underground: **Kryl Station**, a dying market town held together by laundry lines and generator fumes, and **Zarya**, a richer, darker station where everything is for sale. Gunsmiths trade in **military-grade rounds** — bullets you can spend, or load into a magazine when the next corridor goes wrong.

**One flashlight. One breath. One way out.**

---

## 2. Why it's fun

- **Darkness is the default.** Most of the game is lit by your flashlight, a dying practical, or nothing at all. You are never comfortable.
- **Claustrophobia as a mechanic, not a texture.** Tight geometry, camera pressed near walls, muffled audio, crawling that actually changes your silhouette and speed.
- **Light is a risk.** The flashlight is how you navigate and how you see scares — but the beam can give you away. Turning it off is safety and blindness at the same time.
- **Sound is the map.** You navigate by drips, fan hum, and distant trains. You survive by controlling the noise you make.
- **Three mutants, three kinds of fear:**
  - **The Tenant** — psychological. It doesn't hurt you. It makes you see things — and it knows you.
  - **Crawlers** — ambush. Metal-running warnings, corners, screams, and a split-second to fight back.
  - **Mutant Rats** — swarm. Sharp, aggressive, and never alone.
- **The dead are loot and tools.** Search bodies for bullets, filters, and story. Carry them. Throw them to make noise, block a corridor, or find out what is listening. Some of them are not dead.
- **Bullets are money.** Military-grade rounds are the currency. Spend them on a new gun, or keep them for the fight ahead. You cannot afford both.
- **Your gear is physical.** Magazines remember how full they are. Weapons jam when dirty. Filters run out. Masks crack and fog. You check your watch because there is no HUD.
- **Combat is dangerous and loud.** A firefight costs ammo, health, and noise. The Tenant is not impressed by guns. The Crawlers are.
- **The look is readable in the dark.** Flat-shaded geometry and bold silhouettes let you identify a vent, a Crawler, or a door in near-blackness. It is the Fury Foot look, drained of color.
- **Cities between the horror.** Safe rooms with people, shops, arguments, and bad coffee. They make the vents feel colder.
- **Scares are earned.** Thirteen scripted set pieces, eight hand-authored hallucinations, and systemic vent ambushes. Not a scream every thirty seconds.
- **The Tenant knows you from the inside out.** It remembers how you died, what you looted, who you spared, what you carry, and which lies you told. Every vision is built from your own run — and it gets more personal each time.
- **A real journey.** Vents → Kryl → the Dead Rail → Zarya → the deep vents → the last crawl → the nest.
- **Big bookends.** A family dinner opens the game; the last crawl into the nest ends it. Small objects hold it together: a family photo, Dad's lighter, a radio voice, the first and last breath.
- **Replayable.** Side jobs, fourteen logs, and chapter select after the credits.

---

## 3. Design pillars

1. **Tight spaces, tight breath.** The player should feel the walls.
2. **Darkness is the default. Light is a decision.**
3. **Every sound is information.**
4. **The dead are part of the level.** Bodies are loot, landmarks, warnings, weapons, and occasionally lies.
5. **Bullets are both money and mercy.** Every shot is a purchase.
6. **Gear is physical.** Magazines, filters, masks, and weapons have state.
7. **Cities are relief. Vents are the price.**
8. **The Tenant is never a boss fight.** The one that follows you doesn't want to kill you. The nest is not a fight at all.
9. **Jumpscares must be fair.** A warning, a window, and a retry. No cheap deaths from nowhere.
10. **Realism serves immersion, not punishment.** No hunger, no permadeath, no inventory Tetris.
11. **Restraint before the scare.** Tension first, payoff second.
12. **Fair deaths.** The player always had a way to survive; reload is fast.

---

## 4. Core loop

**In the vents:**
```
Crawl → listen → loot the dead → check gear → solve a physical task → survive an ambush or a vision → checkpoint → descend
```

**In the cities:**
```
Talk → barter → repair / buy / stash gear → take side jobs → rest → go back down
```

**In the open areas:**
```
Choose a route → fight or avoid mutants and scavengers → loot bodies and caches → reach the next station
```

Each act teaches one new idea and ends with a checkpoint. Each chapter ends with a major set piece and a safe room.

---

## 5. Controls

| Input | Action |
|---|---|
| **W A S D** | Move |
| **Mouse** | Look |
| **Left Mouse** | Fire / throw carried body / strike during a grab |
| **Right Mouse** | Aim down sights |
| **R** | Reload |
| **T** | Check magazine / chamber (physical animation) |
| **1–3 / Wheel** | Switch weapon slot |
| **V** | Melee (knife) |
| **Shift** | Sprint (fast, loud, drains stamina) |
| **Ctrl** | Crouch / crawl (slow, quiet, lowers camera) |
| **Z / C** | Lean left / right |
| **Space** | Jump / mantle (context) |
| **E (tap)** | Interact / search body / talk |
| **E (hold)** | Pick up body or prop |
| **E (while carrying)** | Drop |
| **F** | Flashlight on/off |
| **G** | Throw a can (distraction) |
| **Q** | Light a flare (temporary safety) |
| **M** | Wipe mask / clear condensation |
| **H** | Check wristwatch (time, filter estimate, dosimeter) |
| **X** | Holster / draw weapon |
| **Space (hold)** | Hold breath (silences breathing, steadies aim) |
| **Tab** | Journal / map / inventory |
| **Esc** | Pause / settings |

Desktop only in v1. No gamepad, no mobile.

---

## 6. Systems

### 6.1 Movement & body
- Walk, sprint, crouch, crawl, lean, mantle.
- Movement has momentum and weight; no bunny-hopping, no air control.
- Low ducts force a crawl state; the camera drops, speed halves, breathing gets louder.
- Head-bob is subtle and toggleable.
- Narrow gaps squeeze the camera close to geometry and muffle audio.
- Stamina limits sprinting; sprinting is very loud.
- **Weight matters:** heavy weapons, ammo, and loot slow you down. Carrying a body slows movement by ~40%, lowers the camera, and blocks part of the view.
- **Injuries matter:** low health affects breathing, aim sway, and movement speed. A limp is visible and audible.

### 6.2 Darkness & light
- **The game is dark by design.** Ambient light is near zero. Rooms are lit by one weak practical, a broken emergency light, or nothing.
- **Darkness rules:** no fully lit rooms. Every light is weak, local, or dying. Cities are shadowed. No neon. Menus and UI are low-luminance. Black is black, not grey. Darkness never hides a required path or an incoming attack without an audio cue.
- **The flashlight is the primary light source.** Battery ~4 minutes of continuous use. Dims and flickers below 20%. Can be switched off to hide.
- **Dynamic exposure** adapts slowly. Stepping from a lit room into a vent leaves you blind for a moment. Stepping into light hurts.
- **Light is a beacon.** The beam reveals paths and scares, but Crawlers and scavengers notice it at range.
- **Cities are not bright.** Sodium lamps, cooking fires, string lights, and shadows. Warm, but never safe.
- **No free light.** Flares are scarce. Weapon-mounted lights cost weight and reveal you. Emergency lights die when you need them.
- **Brightness calibration** on first launch. Accessibility brightness does not count as cheating.
- **Readability rule:** darkness must never hide a required path or an incoming attack with no audio cue. If it does, the lighting is wrong.

### 6.3 Noise & sound propagation
- Every action produces noise: walking (low), crawling (very low), sprinting (high), bumping debris (high), metal grates (very high), gunshots (extreme), thrown bodies (high, scaled by impact).
- Noise has a radius and is affected by walls. Enemies investigate the last loud position.
- **Material footsteps:** concrete, steel grating, water, gravel, cloth, glass. Each has a distinct sound and noise value.
- **Gear rattle:** running with a heavy load is louder. Drawing a weapon is audible. Reloading is audible.
- **Cans** create noise at a distance: throw one down a side duct to pull enemies away.
- **Bodies** create a heavier, wetter impact sound. A body thrown into a grate can pull a Crawler or a rat pack toward it — or reveal that something was already there.
- **Suppressors** reduce gunshot radius but do not make shots silent. Supersonic cracks remain.
- Sound is occluded by walls: muffled, low-passed, and directionally ambiguous.

### 6.4 Breath
- Holding breath drains a breath meter (~6 seconds).
- While holding: footsteps soften, breathing stops, aim steadier, vision narrows slightly.
- Releasing with an empty meter causes a loud gasp — a real risk during hide moments.
- Used in scripted near-misses and while hiding.
- Panic raises breathing rate; low health makes it harder to hold.

### 6.5 Gas mask & filters
- The mask is a physical object with **condition**: clean, fogged, cracked, broken.
- **Filters** last ~90 seconds in toxic air. The wristwatch shows an estimate, not an exact timer.
- **Condensation** builds while running or panicking. Press **M** to wipe the lens; the animation takes a second and costs visibility.
- **Cracks** reduce peripheral vision and distort the image. Spare masks can be found or bought.
- **Mask on:** breathing is louder, peripheral vision narrows, and the world sounds muffled.
- **Mask off:** full vision and hearing, but toxic air damages health.
- **Safe zones:** stations have breathable air; the mask comes off automatically.
- **Surface and deep vents:** toxic dust, spores, and bad air require the mask.
- **Filter scarcity:** filters are found on bodies, in caches, and in city shops. Running out is a real emergency.

### 6.6 Health & damage
- **No regenerating health.** Damage stays until treated.
- **Bleeding:** some wounds cause blood loss over time. Bandages stop it; medkits restore health.
- **Pain:** low health causes heavy breathing, aim sway, blurred edges, and a limp.
- **Damage sources:** mutants, gunfire, falls, fire, toxic air, Crawler grabs.
- **Death:** short fade, no gore, reload last checkpoint in under 3 seconds.
- **Medkits and bandages** are scarce and weight-limited.
- **No limb-by-limb medical sim** in v1. It adds friction without enough payoff.

### 6.7 Weapons, ballistics & condition
**Realism first. Every gun is a physical object with state, weight, and recoil.**

- **Three weapon slots:** sidearm, primary, special. You own more guns than you can carry; the rest live in a city stash.
- **Projectile ballistics:** bullets travel, drop over distance, and lose energy. Shotguns fire pellets. The air rifle fires a slow dart. No hitscan.
- **Chambered rounds:** reloading keeps the round in the chamber. Magazine contents are tracked individually.
- **Magazine memory:** magazines remember how full they are. Partial reloads are a choice.
- **Manual actions:** bolt-action cycling, pump shotgun, break-action reload, air rifle pumping.
- **Recoil & handling:** per-weapon recoil patterns, muzzle climb, aim sway, ADS time, weight affecting movement speed. No crosshair; use iron sights.
- **Suppression:** near misses make human enemies flinch, duck, and stop shooting for a moment.
- **Jamming:** weapons accumulate dirt and wear. Low-condition guns can jam mid-fight; clearing a jam takes ~1.5s and makes noise.
- **Cleaning kits** restore condition. Gunsmiths repair and upgrade.
- **Ammo types:** pistol, carbine, shotgun, rifle, air darts. MGR is a separate premium round.
- **MGR:** military-grade rounds can be loaded into the pistol or rifle for more damage — but every shot spends money.
- **Upgrades:** suppressor, extended magazine, stock, scope, choke, pump, flashlight mount. Two per gun.
- **Damage:** headshots are lethal on humans and most mutants. Body shots wound and stagger. Shotguns are devastating at contact range and useless past it.
- **Weapon weight** is part of the inventory; a rifle and a shotgun together are a commitment.

**Weapon roster:**

| Weapon | Role | Action | Magazine | Caliber | Loudness | Price (MGR) |
|---|---|---|---|---|---|---|
| **PM pistol** | Starter, reliable | Semi-auto | 8+1 | 9×18 | Medium | 30 |
| **"Bastard" carbine** | Cheap spray, inaccurate | Full-auto | 30 | 5.45 | High | 70 |
| **Sawed-off shotgun** | Close-range panic | Break-action | 2 | 12 ga | Extreme | 60 |
| **"Tihar" air rifle** | Silent, expensive darts | Pump | 1 | darts | Very low | 90 |
| **Bolt-action rifle** | Scoped, open areas | Bolt | 5+1 | 7.62 | High | 120 |

### 6.8 Inventory & weight
- **Backpack with a weight limit** (generous, but real). Weapons, ammo, filters, medkits, and loot all weigh something.
- **Three weapon slots**; extra guns go to a stash in Kryl or Zarya.
- **No grid Tetris.** A list with weight, condition, and ammo state.
- **Loot has weight.** Carrying every rifle you find is not possible.
- **Quick slots:** medkit, bandage, filter, flare, can.
- **Stash:** safe storage in both cities; loadout prepared before a descent.
- **The journal** tracks inventory, not the HUD.

### 6.9 Bodies, looting & corpse physics
- **Roughly 70 hand-placed corpses** across the campaign: vents, open areas, and a few in the cities. Each cluster tells a small story.
- **Loot:** tap **E** to search. A short search animation (~1.5 s) and a rustle of cloth. Bodies can hold:
  - ammo and air darts
  - 3–15 MGR
  - filters, batteries, flares, medkits, bandages
  - notes, keys, fuses, weapon parts, cleaning kits
  - junk to sell in the cities
- **One-time loot:** each body is searched once. The loot panel shows contents and a "take all" action.
- **Risk:** searching makes a small noise. In a quiet vent, that is enough. Some bodies are bait.
- **Pick up:** hold **E** near a body to grab it. The body is held in front of the player, swaying with movement, blocking part of the view. Movement slows; weapons are holstered.
- **Throw:** left mouse. A tap throws; holding briefly winds up for a stronger throw. The body tumbles, collides with walls and props, and lands with a heavy thud.
- **Drop:** tap E.
- **Physics:** **hybrid ragdolls.** Nearby, recently disturbed bodies use a lightweight 5-part jointed ragdoll (torso, head, two legs, one arm) with cannon-es constraints. Distant bodies and old corpses use a single rigid body with procedural limb flop. Max **4 active ragdolls** and **8 active dynamic bodies**.
- **Bodies as tools:** throw one to distract Crawlers or rats, to test a dark corridor, or to knock a can down a side passage. Bodies can block narrow gaps and snag on geometry. This is emergent, not scripted.
- **Bodies as horror:** some are curled, some are reaching for a vent, some are huddled around an unlit flare. A few are fresh. One or two are **not dead**.
- **Fake corpses (3 scripted):**
  1. **The Warren** — a body sits up when searched. It was a Crawler playing dead.
  2. **The Dead Rail** — a pile of bodies is a rat nest; one of them moves.
  3. **The Lair** — a corpse stands up. It is the Tenant.
- **Enemy reactions:** rats feed on fresh corpses and swarm if you disturb them. Crawlers investigate bodies thrown into their vents. Scavengers ignore the dead unless a body lands on them. The Tenant treats bodies as furniture.
- **No gore:** bodies are stylized, bloodless, and posed by hand. The horror is in the poses and the silence.
- **Limits:** active bodies sleep when settled; distant bodies remain static until disturbed.

### 6.10 Bullets as money
- **Currency:** military-grade rounds (MGR). One round = one unit.
- **Spend or shoot:** MGR buys guns, ammo, medkits, filters, flares, repairs, and upgrades. It can also be chambered for extra damage.
- **Earn:** side jobs (15–40 MGR), looting bodies (3–15), caches (5–15), selling junk.
- **Scarcity:** the player should always feel one purchase away from trouble.
- **Barter:** some vendors prefer goods over MGR — a filter for a cleaning kit, a working pistol for a scope. Prices vary by vendor and chapter.
- **Shops:** gunsmith, medic, general store, black market. Sell loot and spare ammo.
- **Sample prices:** medkit 10, bandage 4, filter 6, flare 4, pistol rounds ×12 = 3, shotgun shells ×6 = 5, rifle rounds ×5 = 6, air darts ×5 = 8. Repairs 5–20. Upgrades 25–80.

### 6.11 Cities & hubs
- **Kryl Station** — home. A dying market town of ~200 people. Laundry lines, generator fumes, a gunsmith called **Tokar**, a medic, and Mara on the radio. First guns, first repairs, first side jobs.
- **Zarya Station** — deeper and richer. A black market, a crowded bazaar, better guns, worse people. The gunsmith **Vera** sells upgrades Kryl cannot.
- **Sanctuary** — the last safe city, or so the radio says. Mara has a signal. Nobody has come back with a different story.
- Cities are **safe zones**: weapons holstered, no creature, no timer. The player can walk, talk, shop, repair, stash, rest, and read.
- **NPCs:** 8–10 per city with short dialogue trees, barks, and rumors. They move through simple routines — market, guard post, bar, sleep — but they are not a full schedule sim.
- **NPC reactions:** guards warn you if you draw a weapon. Civilians flinch. Children stare. Vendors remember if you shortchange them.
- **Side jobs:** three per city (six total). Examples: clear rats from a duct, find a lost caravan in the Dead Rail, retrieve a debt package, repair a radio repeater. Rewards: MGR, gear, discounts, repairs.
- **Atmosphere:** warm sodium light, cooking smoke, music, arguments, children, guards. Still dark, still cramped, still underground.
- **The dead in cities:** body bags by the clinic, a covered row near the lower platform in Zarya, a memorial wall in Kryl. No looting in safe zones; the living are watching.

### 6.12 Open areas
- **The Dead Rail** — a semi-open surface rail yard between Kryl and Zarya. Rain, rusted train cars, collapsed platforms, scavenger camps, rat nests. Multiple routes: rooftop, tunnel, open yard. Optional caches and a side job. ~20–25 minutes.
- **The Sump** — a smaller flooded yard between Zarya and the deep vents. Wading, toxic pockets, a scavenger toll bridge. ~10–15 minutes.
- Not a full open world: bounded zones with hand-placed points of interest, no vehicles, no procedural generation.
- **Weather:** rain, wind, lightning, wet surfaces, puddles that reflect light and make noise. Weather changes visibility and sound.
- **Navigation:** journal map fills in as you explore; landmarks and sightlines do the rest. No quest markers. NPCs give directions in words.
- **Enemies:** hand-placed, no respawns. Fighting costs ammo; avoiding costs time.
- **Bodies:** the Dead Rail is where the dead pile up — derailed cars full of passengers, scavenger camps, rat nests. Looting is richest here, and most dangerous.

### 6.13 Enemies overview
**Three mutant types, plus human scavengers.** Each is a different kind of scene:

| Enemy | Fear | Behavior | Can you kill it? |
|---|---|---|---|
| **The Tenant** | Psychological | Appears, induces a hallucination built from your run, disappears | No. It never attacks. |
| **Crawlers** | Ambush | Stalks vents, metal-running warning, lunges, scream, kill window | Yes — shoot or knife it in time |
| **Mutant Rats** | Swarm | Fast, sharp, aggressive, pack hunters; the Broodmother in the prologue | Yes |
| **Scavengers** | Human danger | Patrol, take cover, shoot, flee | Yes, but loud and expensive |

### 6.14 The Tenant — the tall black figure
- **Appearance:** a tall, thin, featureless black silhouette, roughly 2.5 m tall. No face. No visible breathing. It stands perfectly still at the edge of the light. When you look directly at it, it is already closer.
- **First appearance:** the prologue, standing in the far corner of the family dining room. It does not move. It triggers the first flashback. The player cannot interact with it. It is gone when the memory ends.
- **It does not attack — the one that follows you.** It cannot be killed, damaged, or driven off. It does not chase. It does not block doors. It is not a boss.
- **There are more of them.** The Tenant that follows you is a scout. The final nest is full of them. They are not a boss fight; they are the end of the line.
- **It knows you from the inside out.** The Tenant has been in your head since the first vent. It does not show you its memories; it shows you yours, rearranged.
  - **What it remembers (local memory ledger):**
    - the prologue: your family, the dinner, the first flashback, the Broodmother
    - your chosen name, if you gave one
    - how many times you have died, and how
    - how many times you have stood in the same room
    - bodies looted, left, carried, or thrown
    - weapons used, shots fired, MGR spent or hoarded
    - side jobs accepted, refused, or failed
    - dialogue choices and lies told to NPCs
    - logs found and journal notes written
    - times you hid, ran, or held your breath
    - flashlight and mask habits
    - scavengers killed or spared
    - routes taken through open areas
  - **How it uses it:** the core vision of each hallucination stays the same, but 3–5 variant details, lines, and visuals are chosen from your run. It quotes your own dialogue back at you. It knows what is in your pack. It knows which pocket the bullets are in. It knows the sound you made when you died.
  - **After a death:** if you reload a checkpoint and meet the Tenant again, it acknowledges it. "You've stood here before. I heard you die." The line only appears if it is true.
  - **Privacy:** the ledger is local save data. It never reads real personal data, never sends anything, and never scans your machine. The optional name is stored on your device only.
- **Every interaction is a hallucination.** When the Tenant appears, the world changes:
  - **Duration:** 30–60 seconds. Hand-authored per encounter, not random.
  - **Focus:** only the vision/scene is sharp. Everything else — walls, floor, the real room — is blurred, warped, and confusing.
  - **Vision:** heavy radial blur, depth-of-field distortion, desaturation, black vignette, geometry breathing, double exposure, whispers, distant screams, footsteps that aren't yours.
  - **Control:** movement slows. Weapons lower. The flashlight flickers. You can walk, but you cannot fight. One encounter is interactive; the rest are not.
  - **Content:** each hallucination shows a memory or a truth — workers fleeing, the crash, Zarya's experiments, the first Crawler, the Tenant's origin, Sanctuary as it is now. The story is delivered here, not in a cutscene.
  - **Ending:** the blur snaps away. The Tenant is suddenly in front of you, close enough to touch. Hold still for a beat. Then it is gone. No jump chord. Just silence and your breathing.
- **The prologue flashback** is a special scripted sequence, not one of the eight memory-driven encounters. It is the first time the Tenant shows you a vision; the eight below are the ones it builds from your run.
- **Eight hand-authored encounters** across the campaign. No two share a mechanic or a vision. They are the story's spine.
- **It speaks.** Short lines, delivered as layered whispers and subtitles. It sometimes mimics Mara, Tokar, or Vera — close, but wrong. It never shouts. It never explains everything.
  - *"You breathe like someone who's been buried."*
  - *"I know the weight of your pack. I know which pocket the bullets are in."*
  - *"You left her in the car. She was still warm."*
  - *"I was in the corner that night. You looked at me."*
  - *"You're late. We started without you."*
  - *"Sanctuary is safe. Say it back."*
  - *"You've stood here before. I heard you die."*
  - *"Say your name. I want to know what to call you when you stop running."*
- **Sightings:** outside hallucinations, the Tenant can appear at the end of a corridor, in a doorway, in a reflection, or standing among the dead. It never moves while watched. It is gone when you look away. In the final nest, there are dozens — and they do not disappear.
- **No damage during the game.** The Tenant that follows you cannot kill you. The horror is what it shows you, and what you realize afterward. The nest is different. The nest kills you.
- **Accessibility:** reduced-hallucination mode lowers blur, flash, and audio spikes while keeping the story. The sequence is never skipped entirely.
- **Optional name:** at the intro, the game can ask what the station should call you. Leave it blank and you are "scavenger." The Tenant uses the name sparingly, and only in moments where it hurts.

**Hallucination encounters:**

| # | Act | Vision | Unique mechanic | Duration |
|---|---|---|---|---|
| 1 | The Shaft | **The Falling** — workers drop through the vent one by one, each landing in the pose you woke up in | Walk through the memory; the last body is yours | 30 s |
| 2 | Dead Rail | **The Passenger Car** — every passenger wears your clothes and gear; one has your name tag | Passive; their pockets reflect what you have looted | 40 s |
| 3 | Zarya | **The Table** — you are on the lower platform table, awake; the Tenant leans over you | Your actual inventory is laid out beside you; it knows your weight | 45 s |
| 4 | The Warren | **The Birth** — the first Crawler is born out of a vent, and it has your voice | Follow it through the walls; no combat | 50 s |
| 5 | Flooded Duct | **The Drowned** — a row of bodies under the water, one of them you | The water clears only around whoever you look at | 45 s |
| 6 | Safe Room | **The Guest** — the Tenant sits across from you in a copy of the safe room | Interactive: sit, listen, choose to answer or stay silent | 45 s |
| 7 | The Lair | **The Mirror** — a corridor of reflections, each one a different death | Every mirror shows a real or possible death; the Tenant is behind you in all of them | 60 s |
| 8 | The Last Crawl | **The City That Was** — Sanctuary as it was, then as it is now | The Tall Figures force the vision; you can only watch | 60 s |

**Variant examples (the Tenant knows):**

- If you looted almost every body, the Passenger Car's pockets are empty. If you left the dead alone, they are full of the things you need.
- If you hoard MGR, the Table has a single bullet placed in your hand. If you spend freely, the table is covered in spent casings.
- If you killed scavengers, the Guest asks you their names. If you avoided them, it asks why.
- If you have died, the Mirror shows those deaths. If you have not, it shows the ones waiting for you.
- If you carry a body when the Tenant appears, it mentions the weight by name.
- If you gave a name, it uses it once per encounter. Never twice.
- If you found all fourteen logs, the final vision lasts longer — and tells you what you are becoming.

### 6.15 Crawlers — the vent ambushers
- **Appearance:** pale, long-limbed, roughly human-sized when standing — but when it crawls toward you in a vent, it fills the space and looks bigger than you. No lips. Too many joints. It moves in sharp, stop-start bursts.
- **Sound:** a rapid metallic scrabble, like someone running on steel. It is the warning. It comes 2–4 seconds before the lunge, from a direction that is not always clear. Then a wet click. Then the scream.
- **Behavior:**
  - Stalks through side ducts and ceilings.
  - Watches from vent grates.
  - Ambushes at corners, crawl junctions, and open grates.
  - Can be killed before it lunges if you spot it and shoot first.
  - Retreats when badly hurt, then comes back.
- **The lunge (jumpscare):** it fills the screen, screaming. Time slows to ~20%. You have **~1.8 seconds** of real time to:
  - **Left Mouse** — fire your drawn weapon, or
  - **V** — knife it.
  - A hit kills it or drives it off. A miss, an empty gun, or no input means death.
- **Fairness rules:**
  - Audio warning before every lunge.
  - Never spawns in the player's view.
  - Never ambushes during a puzzle interaction, dialogue, safe room, or another ambush.
  - The kill window is generous enough to react, short enough to panic.
  - If you die, the checkpoint reloads in under 3 seconds and the ambush resets.
- **Ambush director:** 2–4 minute cooldown. Some ambushes are hand-placed; some are random within authored ambush zones. Chapter III increases frequency and allows a second Crawler immediately after the first.
- **Kill window implementation:** time dilation, a centered creature, an input buffer, and a clear audio hit/miss cue. No QTEs during hallucinations.
- **Death:** "It was already inside the vent with you." Reload checkpoint. Try again.

### 6.16 Mutant Rats — the swarm
- **Appearance:** dog-sized rats with matted grey-brown fur, too-long legs, and sharp, twitchy movements. No glowing eyes. No cartoon. Just wrong proportions and hunger.
- **Behavior:**
  - Packs of 2–4.
  - Fast, aggressive, and unpredictable.
  - Lunge at ankles and hands.
  - Feed on fresh corpses; loot a body near a nest and they swarm.
  - Scatter when a packmate dies, then regroup.
  - Can be distracted with cans or a thrown body.
- **Combat:** pistols and knives work; shotguns are ideal; rifles are overkill and loud. They are fragile but dangerous in numbers.
- **Where:** vents, the Dead Rail, the Sump, the lower levels of Zarya, and the lair.
- **Sound:** scratching, squealing, teeth on metal, a wet chitter before they charge.
- **The Broodmother:** a rare, much larger rat in the prologue. It hunts by smell, tears up floorboards, and kills the player's family. Tokar shoots it. Scripted encounter only; not a recurring boss.
- **No gore:** they bite, you bleed, but the camera stays restrained.

### 6.17 Human scavengers
- **Not mutants.** Patrol, take cover, shoot, reload, flank, and flee when hurt.
- React to noise, muzzle flashes, flashlights, and bodies dropped nearby.
- Can be avoided, ambushed, or talked past with the right side job.
- Drop ammo, MGR, and occasionally a note.
- They are the reason guns exist in the game — and the reason firing one in a vent is a mistake.

### 6.18 Safe rooms
- One at the end of each chapter, one midpoint in Chapter II, one in each city.
- No creature can enter. A radio, a supply box, a bench, and a journal table.
- Saves progress, restocks a small amount of resources, delivers story.
- The player should feel relief the moment the door seals — then doubt it.

### 6.19 Diegetic UI & immersion
- **No HUD by default.** No health bar, no ammo counter, no crosshair, no minimap.
- **Check magazine (T):** the character tilts the weapon; a physical animation and sound reveal the round count. Time slows slightly while checking, but not to zero.
- **Wristwatch (H):** time, filter estimate, dosimeter clicks, and a compass if equipped. The watch is a physical object with a battery.
- **Health:** conveyed by breathing, heartbeat, screen edges, limp, and blood on the hands. Medkits and bandages are used from the quick slot.
- **Objectives:** journal notes, radio calls, and NPC directions. No floating markers.
- **Interaction:** a small physical dot appears only when looking directly at an interactable; it can be disabled.
- **Loot:** no glowing outlines. Bodies are searched by hand; items are picked up by looking and pressing E.
- **Weapons:** holstered in cities by default. Guards react if you draw.
- **Immersion details:** weapon inspect animations, mask wipe, gear rattle, footsteps that change with load, sitting/resting in safe rooms, radio chatter, rain on metal.
- **Accessibility HUD option:** players can enable health, ammo, and crosshair in settings without shame.

### 6.20 Scare & ambush director
- **13 scripted scares** with a **2–3 minute cooldown** between major events.
- **8 hand-authored hallucinations**, placed at story beats. No cooldown; they are not random. Each has 3–5 variant lines and details chosen from the Tenant's memory of your run.
- **Systemic Crawler ambushes** with a 2–4 minute cooldown, audio warnings, and a kill window.
- **Ambient events** between the peaks: pipe bangs, distant screams, radio crackle, a grate settling, something breathing in another duct, a fan spinning up on its own, a body settling in the next room.
- **No cheap scares:** nothing spawns silently behind the player. Every jumpscare has a cue.
- **City ambience** does the opposite — laughter, arguments, a guitar — so the vents hit harder.

**Scripted scare table:**

| # | Act | Scare | Type |
|---|---|---|---|
| 1 | The Last Dinner | The Tenant in the corner; the camera locks; the first flashback | Dread |
| 2 | The Last Dinner | The Broodmother under the floor looks you in the face | Startle |
| 3 | The Descent | A face fills the fan blades for one frame | Glimpse |
| 4 | The Shaft | First Crawler warning — metal running, then silence | Dread |
| 5 | Nest Gate | First full Crawler chase through a collapsing duct | Chase |
| 6 | Kryl | A "maintenance worker" in the crowd has no face under the mask | Dread |
| 7 | Dead Rail | A train car full of hanging respirators | Reveal |
| 8 | The Warren | A corpse sits up when you search it | Startle |
| 9 | The Warren | Radio voice comes from inside the room, not the speaker | Dread |
| 10 | Flooded Duct | Something grabs your ankle in the water | Startle |
| 11 | The Dead Fan | The fan starts while you are inside the housing | Action |
| 12 | The Lair | The nest is full of respirators — all facing you | Reveal |
| 13 | The Lair | Double Crawler ambush — one after the other | Chase |

### 6.21 Checkpoints & retry
- Checkpoint at the start of each act, each safe room, and each city.
- Death reloads in under 3 seconds.
- Checkpoints reset ambushes and scares so they can be experienced again.
- No manual saving mid-chase. No quicksave.
- **Retry philosophy:** if you die to a Crawler, you go again. The ambush is fair, the cue is clear, and the window is real. No lost loot, no lost story progress.
- Looted bodies stay looted across retries.

### 6.22 Journal, logs & map
- **Fourteen worker logs** (text + radio voice fragments) explaining the station, the Tenant, the Crawlers, and what Zarya is hiding.
- Optional. Missing logs do not block progress, but collecting all of them reveals the full truth about Sanctuary and the Tenant. The ending does not change.
- A crude hand-drawn map fills in as you explore vents, cities, and open areas. No minimap, no quest markers.
- Journal tracks fuses, valves, jobs, sealed doors, inventory weight, and weapon condition — the player's own notes.

### 6.23 Puzzles
Physical, no inventory grid:
1. **Power:** find a fuse, insert it, throw the breaker.
2. **Pressure:** find two fuses in the Warren while Crawlers stalk the vents.
3. **Ventilation:** restart the dead fan, time the blades, open the final hatch.
4. **Flood control:** open three valves in the flooded duct in the right order.
5. **Intake:** align the vent coupling, equalize pressure, and open the last hatch into Sanctuary.

### 6.24 Difficulty modes
- **Ranger (intended):** diegetic UI, scarce resources, weapon jams, deadlier enemies, filters drain faster, no crosshair.
- **Standard:** optional HUD, more resources, gentler jams, easier combat. For players who want the story without the sim friction.
- **Custom:** toggle HUD, crosshair, resource scarcity, jumpscare intensity, hallucination intensity, enemy damage.
- Difficulty can be changed from the pause menu; no content is locked behind it.

---

## 7. Campaign outline

### Prologue — THE LAST DINNER (≈10 min)

A locked-camera first-person memory. No movement, no weapons, no HUD. Only the camera moves.

- **Dinner.** A hab-unit built to look like a pre-war house: a table, four plates, a fake window showing a projected surface. Mom, Dad, your younger sister. Ten seconds of normal life. The family photo sits by the salt. Dad's lighter clicks.
- **The alarm.** The overhead light goes red. Mom grabs your sister, presses the family photo into your hand, and runs for the safe area. Dad tells you to go with them.
- **The corner.** You turn. In the far corner, the tall black figure is standing in the dark. It does not move. The camera locks. The first flashback begins.
- **The flashback.** You are your sister's age. She doesn't exist yet. Same table, same alarm, an explosion through the window, panic, your parents shouting. The edges of the room blur; only the memory is sharp.
- **Under the floor.** You are in a crawlspace beneath the floorboards. Dust. A small creak. Through the crack: the rat monster — the **Broodmother**. It takes your father in the dark; the camera catches the silhouette of his head leaving the light, not the gore. It can smell you. It looks you in the face. It tears open the floor, takes your sister and mother, and kills them. A gunshot. The rat drops. A man — **Tokar** — pulls you out.
- **Kryl.** Fade to black. Title card: **INTAKE**. Then: Kryl Station, years later.

The prologue establishes the Tenant, the Broodmother, Tokar, the family photo, and the lighter. The player cannot fight or run. Only look, and hold breath when the rat is close.

### Chapter I hub — KRYL STATION (≈20 min)

The game proper starts here, years later. Tokar pulled you out of that house and raised you. He taught you guns, repairs, and how to keep your mouth shut. Mara grew up beside you and now runs the station radio. The air scrubbers are failing, and the parts are in Zarya. Mara has also picked up a signal from **Sanctuary** — the last safe city. If you can reach it with the scrubber key, Kryl has a future. Tokar gives you your first proper gun. Mara gives you a radio and a warning. Choose a loadout, stash what you cannot carry, take side jobs, and say goodbye. Then descend into the vents.

**Side jobs (Kryl):**
- **Rat Problem** — clear a rat nest from the lower market ducts. This one is personal.
- **Lost Worker** — find a missing mechanic in the Dead Rail.
- **The Debt** — retrieve a package from a scavenger camp. No questions.

### Chapter I — DESCENT (vents, ≈35 min)
The tutorial chapter. Learn the vents, the light, the noise, the dead, and your gear. End at the service hatch to the Dead Rail.

**Act 1 — The Descent (10 min).** From Kryl's maintenance lock, you enter the vents. Learn movement, flashlight, crawl, and noise. The first body: a worker wedged in a side passage, still holding a filter. Search him. The first Crawler lunge — metal running, silence, scream — and the first kill window. The vent seals behind you.

**Act 2 — The Crawl (8 min).** Narrow ducts. Learn battery management and the weight of your pack. A fan room gives the first clean glimpse of a Crawler through spinning blades. Reach the maintenance shaft.

**Act 3 — The Shaft (9 min).** Vertical descent. Ladders, broken platforms, a fuse at the bottom. A Crawler stalks one level below — metal running, then nothing. At the bottom, the tall black figure is standing in the dark. This is the first time it shows you a vision in the vents: **The Falling**. Workers drop through the vent one by one, each landing in the pose you woke up in. Thirty seconds. It knows your breathing. If you gave a name, it uses it once. The blur snaps away. It is in front of you. Then gone. Restore power to the lower door.

**Act 4 — Nest Gate (9 min).** A Crawler chase through a collapsing duct. Break line of sight, crawl into a side passage, hold breath, listen to it search. Seal the vent behind you and reach the **Dead Rail service hatch** — your way back to the surface.

### Chapter II — THE DEAD RAIL (open area, ≈25–30 min)
Rain, rust, and a rail yard that connects the stations. Three routes: the rooftop (exposed, snipers), the tunnel (dark, rats), the open yard (fast, no cover). Weather affects visibility and sound. Scavenger camps, caches, a sealed train car full of respirators. Bodies everywhere — some in passenger cars, some in scavenger piles, some that were dragged. Loot what you can and throw the rest to see what moves. Manage filters, ammo, and weight. In a passenger car, the Tenant is waiting. Every passenger is wearing your clothes and gear. One has your name tag. Forty seconds of a crash that hasn't happened yet. Reach the Zarya gate with what you have left.

### Chapter II hub — ZARYA STATION (≈15 min)
Richer, darker, louder. The bazaar sells better guns and upgrades. **Vera** the gunsmith has a Tihar air rifle and a bolt-action rifle. Repair your gear, buy filters, stash loot. Mara's contact needs the scrubber key from the sealed lower platform — the one place in Zarya nobody talks about. The station's guards watch you a little too closely. A covered row of bodies waits by the lower platform. The Tenant is waiting too.

**Main beat:** the scrubber key is on the sealed lower platform. It is also the key to Sanctuary's intake. You have to go down. The Table is there.

**Side jobs (Zarya):**
- **Static** — repair a radio repeater on the surface.
- **The Toll** — deal with the scavenger bridge in the Sump.
- **The Blue Line** — find a missing courier in the Sump.

### Chapter II — THE DEEP (vents, ≈35 min)
Back into the dark, deeper than before. The vents are older here, hand-dug, wrong.

**Act 5 — The Warren (12 min).** A hub of branching vents, side rooms, and hand-dug passages. Find three fuses while Crawlers stalk the vents. Optional side vents hold logs, batteries, and flares. A body sits up when searched — a Crawler playing dead. The Tenant shows you the first Crawler being born, and it has your voice. Learn to throw bodies to move the pack.

**Act 6 — Flooded Duct (10 min).** Knee-deep water, steam, toxic dust. The respirator and filters enter full play. Sound is distorted; the Crawlers move differently here. Something grabs your ankle — a Crawler lunge in the water. The Tenant shows you the drowned: a row of bodies under the water, one of them you. The water clears only around whoever you look at. Open the flood valves. Rats nest in the dry pockets.

**Act 7 — The Dead Fan (10 min).** A cathedral-sized fan room. Restart the blades, crawl through the housing, time the spin. The fan starts while you are inside. A Crawler comes through the intake. Escape into the safe room.

**Act 8 — Safe Room / Radio (3 min).** Mara's story unravels. The station above is already dead. Zarya has been harvesting the vents. Mara admits the Sanctuary beacon has been repeating the same message for years — but it is still the only way out. Restock, save, read logs, clean your weapon, choose to continue. Then the safe room copies itself. The Tenant is sitting across from you. **The Guest** is the only hallucination you can answer. Sit. Listen. Decide what to say. Forty-five seconds. Then the room is normal again, and the door is still sealed.

### Chapter III — THE TENANT (vents, ≈35 min)
The horror chapter. The nest, the truth, and the last crawl. The Crawlers are faster, the rats are hungrier, and the Tenant is no longer alone.

**Act 9 — The Lair (14 min).** The nest: debris, old respirators, scratch marks, a hundred hiding places, and bodies arranged in rows. Find three valves. Crawlers check hiding spots. Filters run low. Mask cracks. Flares become essential. A corpse stands up. It is the Tenant. **The Mirror** is a corridor of reflections, each one a different death — the ones you've had, and the ones waiting. The Tenant is behind you in every reflection. Sixty seconds. Then it is in front of you. Then gone. A double Crawler ambush hunts you toward the second exit.

**Act 10 — The Last Crawl (12 min).** Mara finally pinpoints the Sanctuary beacon. The main tunnel is too dangerous — collapsed, flooded, full of rats — so you crawl the last mile through a maintenance vent. The vents are quiet. No Crawlers. No rats. Just your breath, the family photo in your pocket, and Mara counting down the junctions. You pass a stenciled sign: **SANCTUARY INTAKE 04**. You think you're safe. You open the last vent and drop into the intake chamber.

**Act 11 — The Nest (8–10 min).** The intake chamber is not a city. It is a nest: bodies, old respirators, scratched walls, and dozens of tall black figures standing in the dark. All of them are facing you. They do not move. One of them says your name — or "scavenger," if you never gave one. The last flash hits — not a memory this time. Sanctuary as it was: the best and safest city known to man. Sanctuary as it is now: broken, burning, full of monsters. You can raise the gun. There are too many. They show you the truth. Then they throw you on the ground and eat you. The family photo falls from your hand. The camera stays on it as the sound begins. Dad's lighter sparks and dies. Cut to black. Title. Credits in silence. No retry. No alternate ending.

### Opening & Ending — the bookends

The prologue is the first big set piece. The finale is the second. Both are built from small personal details. The prologue uses only camera look and a hold-breath prompt; the rest of the game uses existing systems.

**Bookend motifs:**
- **The first breath / the last breath.**
- **The family photo:** taken from the dinner table in the prologue; it falls from your hand in the nest.
- **Dad's lighter:** it clicks at dinner; it sparks and dies in the nest.
- **The Tenant:** first seen in the corner of the dining room; last seen in the nest with all the others.
- **Mara's radio voice:** the first voice in the dark; the last voice before the nest.
- **The title card:** **INTAKE** lands after the prologue, over Kryl; the credits roll in silence.

**Opening — "The Last Dinner" (Prologue + Kryl + first descent, ≈30–40 min)**
- **Big:** the dinner; the alarm; Mom and your sister running; Dad telling you to go; the Tenant in the corner; the first flashback; the Broodmother under the floor; Tokar's rescue; the reveal of Kryl.
- **Little:** the family photo; Dad's lighter; your sister's empty chair; the fake window; the first breath; your name on the radio; the first gun from Tokar.
- **No fail:** the player can only look and hold breath. The family dies. You survive. The game starts years later.
- **The prologue flashback** is the first time the Tenant shows you a vision. It is a special scripted sequence, not one of the eight memory-driven encounters.

**Ending — "The Last Crawl" (Acts 10–11, ≈20 min)**

**Big:**
- The last route to Sanctuary. The main tunnel is too dangerous; you crawl the last mile through a maintenance vent.
- The vents are quiet. No Crawlers. No rats. Just your breath and Mara counting down the junctions.
- You open the last vent and drop into the intake chamber.
- It is a nest. Dozens of Tall Figures stand in the dark, all looking at you.
- The last flash: Sanctuary as it was — the best and safest city known to man — and as it is now: broken, burning, full of monsters.
- You can raise the gun. There are too many. They throw you down and eat you. The camera stays on the family photo. Cut to black.

**Little:**
- The family photo falls from your hand.
- Dad's lighter sparks and dies.
- Mara's last radio call: "You're almost there."
- Your last breath.
- Credits in silence. No retry. No alternate ending.

**The truth:** Sanctuary was overrun before you arrived. The safe city was a nest. The Tenant was one of many. The logs can tell you how it happened, but they cannot save you. The sign said **SANCTUARY INTAKE 04**. The title was a warning.

**Main path:** ~3–3.5 hours.
**With side jobs and logs:** up to ~4 hours.

---

## 8. Art direction

### Style
**Fury Foot-style flat-shaded low-poly, at night.** The geometry, materials, and first-person presentation come from Fury Foot. The palette, lighting, and tone are ours: dark, industrial, claustrophobic.

- **Geometry:** chunky low-poly boxes, cylinders, and wedges. Thick pipes, oversized rivets, simple grates, big fan blades. Real vent proportions, built with bold shapes.
- **Materials:** flat colors, simple two-tone shading, vertex colors. No PBR maps, no photorealism. Grime is decals and color blocking, not texture detail.
- **Lighting:** near-black ambient, one strong key light or practical, the flashlight cone, crisp simple shadows. Most frames are 70–90% darkness, but flat shading keeps edges readable.
- **First-person:** visible arms and weapon. FOV ~90. Small dot crosshair. Chunky, readable reload and weapon animations. Camera punch on impacts.
- **Post:** clean image, subtle vignette and grain, no heavy bloom or chromatic aberration. The darkness does the work.
- **Detail:** graffiti, stenciled signs, pipes, cables, bottles, lockers, mattresses, market stalls. Low-poly clutter, not photoreal props.
- **No bright neon.** Keep Fury Foot's color-block clarity, but drain it into black, rust, sickly green, and sodium orange.
- **UI:** if the HUD is enabled, use chunky flat icons that match the art. Default is still diegetic/minimal.

**What we take / what we leave:**

| Take from Fury Foot | Leave behind |
|---|---|
| Flat-shaded low-poly geometry | Bright neon palette |
| Chunky, readable silhouettes | Cartoon humor |
| Visible first-person hands and weapon | Arcade room-clear structure |
| Clean image, minimal visual noise | Hearts/timer HUD (unless optional) |
| Bold color blocking | Exact assets, characters, or maps |
| Fast, readable first-person camera | Kick mechanic, boot, and door-smashing |

### Palettes
- **Vents:** near-black teal, rust, gunmetal, sickly green emergency light, sodium orange, dark red accents.
- **Cities:** sodium orange, dirty red, teal shadows, warm bulbs, wet concrete, but always shadowed.
- **Surface:** cold blue-grey, rain, rust, distant lightning.
- **Hallucinations:** desaturated, high-contrast, flat black silhouette, one sharp focal scene.

### Characters & creatures
- **Low-poly and chunky.** Flat colors, bold shapes, masks and hoods. No realistic faces — it fits the world and the style.
- **Player:** visible gloved hands and weapons. Gear moves with the body.
- **The Tenant:** a flat black silhouette with no surface detail. No face, no glowing eyes. It should read as a hole in the world.
- **Crawlers:** pale flat low-poly, long-limbed, too many joints. When they crawl into the flashlight beam, they fill the vent. Their animation is stop-start and sharp.
- **Mutant Rats:** chunky low-poly, matted flat fur colors, sharp movements. No cartoon eyes. Just hunger.
- **Bodies:** low-poly, posed by hand, bloodless. Every cluster tells a story: a worker curled around a dead flashlight, two scavengers who shot each other, a row of passengers still strapped into their seats.

### No gore
Horror is implied: sounds, silhouettes, aftermath. Combat is stylized; enemies fall, they do not explode. Blood is limited to dark stains and damage effects.

### Asset strategy
- **Low-poly modular kits:** vent segments, city stalls, rail cars, props. Reuse aggressively.
- **Flat-color materials:** shared palette, vertex colors, simple decals. No PBR texture sets.
- **Vertex AO and simple baked shading** where it helps readability.
- **glTF models** for weapons, characters, and key props, loaded at runtime.
- Keep the total repo under ~50 MB.

---

## 9. Audio direction

Audio is half the horror. In a game this dark, it is also the map and the warning system.

- **Spatial audio:** HRTF panning, distance attenuation, wall occlusion, reverb zones (vent, tunnel, chamber, city, surface).
- **Material response:** footsteps, impacts, and gunshots sound different on steel, concrete, water, gravel, and cloth.
- **Vents:** low industrial drone, dripping, metal groans, distant trains, wind through grates. Silence is a weapon.
- **Cities:** overlapping conversations, a guitar, generators, cooking, laughter, a radio playing old music. The player should relax — then notice how thin the walls are.
- **Open areas:** rain on metal, wind, distant mutant calls, train car creaks.
- **Player:** footsteps, crawling, breathing (calm / exerted / panicked), heartbeat that rises with proximity, gear rattle, weapon handling.
- **Crawler cue:** a rapid metallic scrabble, like someone running on steel. It must be audible, directional, and unmistakable. The scream is the payoff.
- **Rat cue:** scratching, chittering, teeth on metal, a wet squeal before the charge.
- **Tenant:** no footsteps. Whispers just below comprehension, a breath that isn't yours, a low tone that makes the room feel wrong. Sometimes it mimics Mara, Tokar, or Vera — close, but wrong. When it disappears, the ambience cuts to silence for one beat.
- **Sanctuary beacon:** a calm recorded voice repeating "Sanctuary is safe" under the final nest. It never stops. Nobody is listening.
- **Bodies:** cloth rustle when searched, a wet thud when dropped, a heavier slam when thrown, the small clink of a buckle.
- **Weapons:** distinct reports per gun; a shotgun should feel like a mistake. Reload sounds, empty clicks, jam clearing, suppressor thumps, projectile cracks.
- **Music:** none during exploration. A single low drone sting for set pieces. Silence before the biggest scares. In cities, diegetic music only.
- **Dynamic range:** loud moments are loud; quiet moments are quiet. Optional night mode compresses the range.
- **Assets:** synthesized in-engine where possible; otherwise CC0 samples, credited in `CREDITS.md`.

---

## 10. Technical plan

### Stack
- **Three.js** (pinned, vendored locally) — WebGL renderer, glTF loading.
- **cannon-es** (pinned, vendored locally) — rigid bodies, ragdoll constraints, prop physics.
- **Vanilla ES modules** — no bundler, no npm, no build step.
- **WebAudio API** — HRTF panning, filters, convolution reverb.
- **localStorage** — checkpoints, logs, settings, economy, chapter select.
- **HTML/CSS** — menus, subtitles, settings, journal, shop, dialogue.

### Architecture
```
index.html
  └─ src/main.js          startup, loop, state machine
      ├─ input.js         pointer lock, keybinds
      ├─ player.js        movement, collision, camera, breath, health, weight
      ├─ level.js         loads act JSON, builds meshes + colliders
      ├─ colliders.js     AABB world, swept capsule resolution
      ├─ physics.js       cannon-es world, body sync, sleeping, pooling
      ├─ ragdoll.js       hybrid ragdoll constraints and limb flop
      ├─ corpse.js        corpse props, grab / carry / throw, poses
      ├─ loot.js          loot tables, search timer, one-time flags
      ├─ ballistics.js    projectile travel, drop, spread, hit detection
      ├─ weapons.js       firing, reload, chamber, jam, condition, upgrades
      ├─ condition.js     wear, dirt, cleaning, repair
      ├─ inventory.js     weight, slots, quick items, stash
      ├─ mask.js          filters, condensation, cracks, wipe
      ├─ health.js        damage, bleeding, medkits, pain effects
      ├─ hallucination.js Tenant triggers, blur shader, audio warp, sequences
      ├─ memory.js        Tenant memory ledger, run tags, variant selection
      ├─ ambush.js        Crawler director, warning cues, kill window, time dilation
      ├─ creature.js      Tenant presence and sightings
      ├─ enemies.js       Crawler and rat AI, scavenger combat
      ├─ combat.js        damage, hit zones, death, feedback
      ├─ economy.js       MGR, prices, inventory, transactions
      ├─ shop.js          buy / sell / repair / upgrade UI
      ├─ dialogue.js      city NPCs, barks, quests
      ├─ scares.js        trigger volumes, director, cooldowns
      ├─ audio.js         WebAudio graph, HRTF, occlusion, reverb
      ├─ ui.js            menus, subtitles, prompts, journal
      ├─ settings.js      brightness, FOV, bob, grain, volume, HUD
      ├─ save.js          checkpoint + settings + log + economy persistence
      └─ journal.js       map, notes, collectible tracking, side jobs
```

### Level formats
Three level types share the same brush/collider core:
- **Vent acts** — tight box corridors, crawl triggers, Crawler ambush zones, Tenant triggers.
- **City hubs** — walkable safe zones with NPCs, shops, dialogue volumes, no combat.
- **Open areas** — larger bounded zones with multiple routes, enemy camps, caches, weather.

```json
{
  "name": "act5_warren",
  "type": "vents",
  "spawn": [0, 1.6, 0],
  "brushes": [
    { "pos": [0, 0, 0], "size": [2, 3, 12], "mat": "duct" }
  ],
  "triggers": [
    { "type": "scare", "id": "radio_voice", "pos": [0, 1.6, -8], "radius": 3 },
    { "type": "hallucination", "id": "first_crawler", "pos": [0, 1.6, -14], "radius": 2 }
  ],
  "ambushZones": [
    { "pos": [0, 0, -10], "radius": 4, "type": "crawler", "scripted": false }
  ],
  "corpses": [
    { "pos": [0, 0.2, -6], "rot": [0, 1.2, 0], "pose": "huddled", "loot": "worker_common", "fake": false }
  ],
  "props": [],
  "lights": [],
  "creature": { "patrol": [[0, 0, -4], [0, 0, -10]] }
}
```
Boxes keep collision simple, performance predictable, and level building fast.

### Rendering & performance
- **Dynamic resolution:** target 60 fps; scale render resolution between 720p and 1080p.
- **Flat-shaded materials** with vertex lighting/AO; dynamic flashlight shadow only. No PBR maps or heavy lightmaps.
- **Merged static geometry** per material to keep draw calls low.
- **Fog and occlusion** to cull the world beyond 25–30 m in vents, ~60 m in open areas.
- **LODs** for props, characters, and bodies.
- **One act/zone loaded at a time**; unload meshes, NPCs, physics bodies, and audio.
- **Target:** 60 fps on a mid-range laptop, 30 fps minimum. If a feature breaks the budget, it gets cut, not excused.
- **Hallucination post-processing** (radial blur, DOF, warp, grain) runs at half resolution and is capped at 60 seconds to protect the frame rate.

### Ballistics
- Projectiles with velocity, gravity, and drag; swept raycast per step.
- Shotgun pellets as separate projectiles; air darts slow and heavy.
- Damage falloff, hit zones (head 2×, torso 1×, limbs 0.7×), no penetration in v1.
- Muzzle flash illuminates the environment briefly; it also reveals your position.

### Weapon state
- Each weapon tracks: loaded magazine, chambered round, condition, dirt, attachments.
- Reload types: magazine swap, shell-by-shell, bolt cycle, pump, break-action.
- Jams occur at low condition; clearing takes ~1.5 s and makes noise.
- Cleaning kits restore condition; gunsmiths repair fully for MGR.

### Mask state
- Filter time, condensation, cracks, strap condition.
- Wipe animation (M), filter swap animation, mask swap at safe rooms.
- Toxic zones apply damage when mask is off or filter is spent.

### Corpse physics
- Hybrid: 4 active 5-part ragdolls near the player; all other bodies are single rigid bodies with procedural limb flop.
- Max 8 active dynamic bodies; sleep when settled; pool per level.
- Grab = kinematic hold point; throw = impulse with short wind-up.
- Impact noise scales with mass and velocity.
- Save: looted flags for every body, plus transforms for disturbed bodies.

### Crawler ambush
- **Warning:** 2–4 second metal-running cue, directional, with a short silence before the lunge.
- **Lunge:** time dilation to ~20%, camera lock, creature fills the screen, scream.
- **Window:** ~1.8 seconds real time. LMB fire or V knife. Input buffered; empty gun still allows knife.
- **Resolution:** hit = kill or retreat; miss = death; reload checkpoint in under 3 seconds.
- **Director:** 2–4 minute cooldown, no ambush during non-combat interactions, no spawn in view, no double ambush until Chapter III.
- **Accessibility:** window length can be increased in settings; reduced jumpscare mode keeps the cue and window but lowers the scream volume and camera shake.

### Hallucination system
- Trigger volumes and story beats call hand-authored sequences from `hallucination.js`.
- Visual: half-res radial blur/DOF, desaturation, vignette, geometry warp, double exposure, film grain spike.
- Audio: whispers, reversed breaths, distant screams, low drone, the real world low-passed.
- Control: movement slowed, weapons lowered, flashlight flicker, no damage. One sequence (`The Guest`) is interactive.
- Ending: blur snaps off; Tenant appears in front of the camera; one beat; disappears; ambience returns.
- **Eight sequences**, each with unique assets, timing, and a distinct mechanic. No procedural hallucinations.
- **Memory variants:** `memory.js` tracks the run and selects 3–5 variant lines, props, and visual details per sequence. The Tenant quotes your choices, knows your loadout, and references deaths only when they happened.
- **Optional name:** the intro can store a player-chosen name in local storage. Used sparingly by the Tenant and a few NPCs. Blank means "scavenger." Never sent anywhere.

### Save system
- Save at act checkpoints, safe rooms, and cities.
- Persist: act, checkpoint, logs, side jobs, MGR, inventory, weapon condition and magazine state, mask condition, settings, chapter select, corpse loot flags and disturbed transforms, hallucinations seen, hallucination variants, Tenant memory ledger, chosen name, ambush state reset.
- Version the save key (`intake.save.v1`) and fail gracefully if corrupted.
- Expose all tuning values in `balance.js`.

### Browser support
- Chrome, Edge, Firefox (desktop).
- Pointer Lock required; show a "click to play" overlay.
- No mobile in v1.

---

## 11. UX & accessibility

- Content warning splash before the menu:
  *"Contains sudden loud sounds, flashing lights, claustrophobic spaces, psychological horror, hallucinations, family tragedy, child peril, character death, stylized violence, and corpses."*
- **Settings:** brightness/gamma, FOV, mouse sensitivity, master/ambient/SFX volume, head-bob toggle, film-grain toggle, motion blur off by default, subtitles, reduced jumpscare mode, reduced hallucination mode, HUD toggle, crosshair toggle, high-contrast prompts, optional name change, invert Y.
- **Subtitles:** `[distant metal groan]`, `[metal scrabbling above you]`, `[breathing behind you]`, `[the vent shifts]`, `[mask filter wheezing]`.
- **HUD (off by default):** optional health, ammo, current weapon, MGR. Ranger mode hides it.
- **Search prompt:** a small dot and "Hold E to search"; a short progress ring; a compact loot panel with "Take all."
- **Carry state:** screen edges darken, movement slows, a one-time "LMB throw / E drop" hint fades.
- **Shop UI:** Buy / Sell / Repair / Upgrade tabs, item condition and weight, clear price in MGR, confirmation before spending.
- **Dialogue:** text with speaker names, simple choices, no timed responses. Directions are spoken, not marked.
- **Pause:** resume, settings, controls, journal, restart act, quit to menu.
- **Death screen:** "The vent is quiet again." + reload checkpoint / quit.
- **Journal:** logs, map, objectives, side jobs, inventory, weapon condition.
- **First 30 seconds:** teach look, move, crouch with diegetic prompts, no text walls.
- **Optional name entry:** the intro asks what the station should call you. Blank is allowed and stored locally.
- **Chapter select** after completing the game.
- **Combat onboarding:** a safe shooting range in Kryl; weapon condition, jams, and reloads taught by Tokar.
- **Crawler onboarding:** the first lunge is scripted with a longer window and a clear prompt.
- **Corpse interaction onboarding:** the first body in Act 1 teaches search, grab, and throw.
- **Accessibility is not a difficulty toggle.** Realism settings can be adjusted without locking content.
- **Motion sickness:** no forced camera shake during hallucinations; blur and warp can be reduced; FOV slider; head-bob toggle.

---

## 12. Scope guardrails

### In v1
- Three chapters, eleven acts + the prologue, ~3–3.5 hour main path.
- Two city hubs (Kryl, Zarya) and two open areas (Dead Rail, Sump).
- **Big playable opening:** the family dinner, the Tenant in the corner, the first flashback, the Broodmother under the floor, Tokar's rescue, and the reveal of Kryl.
- **Big playable finale:** the last crawl, the Sanctuary intake, the nest, the dozens of Tall Figures, and the last flash. No escape, no alternate ending.
- **Bookend details:** the first/last breath, Dad's lighter, the family photo, Mara's radio voice, credits in silence.
- Five realistic weapons, three slots, condition/jams, ballistics, two upgrades each.
- **Three mutant types:** The Tenant (hallucinations), Crawlers (ambush), Mutant Rats (swarm, including the prologue Broodmother) — plus human scavengers.
- **Eight hand-authored hallucinations** with blur, audio warp, unique mechanics, and 3–5 memory-driven variants each.
- **Tenant memory ledger** that tracks deaths, loot, choices, weapons, routes, and carried items; drives hallucination variants and lines. Local only.
- **Optional player name** stored locally; used sparingly by the Tenant.
- **Crawler ambush system** with metal-running cues, lunge, kill window, and retry.
- Bullets-as-money economy with four vendors and six side jobs.
- ~70 lootable corpses with hybrid ragdolls, grab / carry / throw, three fake-outs.
- Gas mask with filters, condensation, cracks, and wipes.
- No-regeneration health, bleeding, medkits, bandages.
- Weight-limited inventory, three weapon slots, city stashes.
- Diegetic UI (watch, magazine check, journal) with optional HUD.
- Thirteen set-piece scares + ambient events.
- Five simple puzzles.
- Fourteen collectible logs and a single definitive ending.
- Safe rooms, checkpoints, journal/map, chapter select.
- Full spatial audio, reverb zones, occlusion.
- Fury Foot-style flat-shaded low-poly, dark palette, dynamic flashlight, weather, near-black darkness.
- Ranger and Standard difficulty.
- GitHub Pages deployment.

### Not in v1
- Photorealistic graphics or performance capture.
- Fury Foot's bright neon palette, kick/boot mechanics, door-smashing, arcade room-clear structure, exact assets, or cheerful tone.
- Full hunger, thirst, sleep, or temperature sim.
- Limb-by-limb medical simulation.
- Permadeath.
- Alternate endings, a secret ending, or a survival escape.
- More than three mutant types.
- Full open world, vehicles, or seamless streaming.
- Faction reputation system.
- Crafting trees or base building.
- Weapon zeroing, bullet penetration, or wind drift.
- Multiplayer or co-op.
- Mobile or gamepad.
- Voice acting (filtered radio fragments and text for now).
- Real-world personal data, fourth-wall scanning, or telemetry.
- More than eight Tenant hallucinations.
- Save-anywhere.
- Romance, companions, or a dialogue-heavy RPG.

**Rule:** if a feature does not make the vents scarier or the cities more convincing, it waits.

---

## 13. Milestones

| Milestone | Deliverable | Goal |
|---|---|---|
| **M0 — Plan** | This document + repo skeleton + README | Agree on scope and name |
| **M1 — Look & core** | Walkable vent test room in the Fury Foot flat-shaded style: movement, lean, mantle, flashlight, crawl, weight, near-black lighting, visible hands and weapon | "Does it look like Fury Foot died in a vent — and feel claustrophobic?" |
| **M2 — Gear & consequences** | Five weapons, ballistics, chamber/mag state, jams, condition, mask/filters, health/bleeding, loot, corpse grab/throw, MGR shop | "Does every object have state and cost?" |
| **M3 — Fear systems** | Tenant hallucination prototype with memory variants, Crawler ambush + kill window, rat pack AI, first scripted scares | "Do the three kinds of fear work?" |
| **M4 — Prologue + Kryl + Descent** | Prologue (~10 min) + Kryl hub (~20 min) + Acts 1–4 (~35 min): family dinner, Broodmother, rescue, city, first descent | Vertical slice: family → loss → city → descent |
| **M5 — Dead Rail + Zarya** | Open area, weather, second hub, side jobs, upgrades, body piles, rats | Prove the city/open-area rhythm |
| **M6 — The Deep** | Acts 5–8 (~40 min), filters, flooded duct, dead fan, The Birth / The Drowned / The Guest | Prove the middle chapter holds up |
| **M7 — Chapter III** | Acts 9–11 (~35 min), lair, double ambush, The Mirror / The City That Was, last crawl, nest ending | Complete the campaign |
| **M8 — Darkness & polish** | Audio pass, lighting pass, animation pass, accessibility, performance, playtests, bug pass | Make it look and sound right, and run well |
| **M9 — Ship** | GitHub Pages, README with GIF, launch post | Playable link for anyone |

Build chapter by chapter so there is always a complete, playable slice. Realism is built into the foundation, not added at the end.

---

## 14. Repo plan

**Repo:** `intake` (public)
**Pages:** `https://simonovicj240712-crypto.github.io/intake/`

```
intake/
  index.html
  README.md            play link, controls, content warning, credits
  DESIGN.md            this document
  CREDITS.md           asset licenses
  LICENSE              MIT for code; assets credited separately
  vendor/
    three.module.js
    GLTFLoader.js
    cannon-es.js
  src/
    main.js
    game.js
    input.js
    player.js
    level.js
    colliders.js
    physics.js
    ragdoll.js
    corpse.js
    loot.js
    ballistics.js
    weapons.js
    condition.js
    inventory.js
    mask.js
    health.js
    hallucination.js
    memory.js
    ambush.js
    creature.js
    enemies.js
    combat.js
    economy.js
    shop.js
    dialogue.js
    scares.js
    audio.js
    ui.js
    settings.js
    save.js
    journal.js
    balance.js
  assets/
    levels/act1.json … act11.json
    hubs/kryl.json, zarya.json
    open/dead_rail.json, sump.json
    models/
    animations/
    materials/
    decals/
    audio/
    textures/
  docs/
    playtest-notes.md
```

- No build step. GitHub Pages serves the repo root.
- Keep total repo size under ~50 MB; compress audio and textures.
- Pin and vendor Three.js, GLTFLoader, and cannon-es.
- Commit early, commit often; tag milestones (`v0.1-grounded`, `v0.2-gear`, …).

---

## 15. Risks & mitigations

| Risk | Mitigation |
|---|---|
| "Fury Foot look" creates gameplay expectations | Market it as INTAKE. The look is the reference; the loop remains slow-burn horror. |
| Scope creep into a full Metro clone | Three chapters, five guns, two hubs, three mutants. Guardrail list above. |
| Jumpscares feel cheap or unfair | Metal cue, no spawns in view, 1.8 s window, fast retry, accessibility window scaling. |
| Death loop becomes frustrating | Checkpoints under 3 s, no lost loot, ambush resets fairly. |
| Hallucinations cause motion sickness | Optional reduced-blur mode, no forced camera shake, FOV slider. |
| Meta-horror feels gimmicky | Keep it in-fiction; no fourth-wall real-world data; variants are subtle, never jokey. |
| Memory ledger feels invasive | Local-only save data, optional name, no telemetry, no scanning. The player can clear it. |
| Hallucinations become repetitive | Eight unique mechanics, 3–5 variants each, no repeat trigger in one run. |
| Darkness hides the path | Audio cues, weak practicals, silhouettes, brightness calibration, "readability rule." |
| Realism becomes tedious | No hunger/thirst/permadeath; generous weight; fast reloads; Standard mode. |
| Guns kill the horror | The Tenant is immune; gunshots are loud; ammo is money; Crawlers ambush from angles guns cannot cover. |
| Weapon/mask/inventory state overwhelms players | Teach one system at a time; diegetic onboarding; optional HUD. |
| Corpse physics tanks performance | Hybrid ragdolls, max 4 ragdolls / 8 dynamic bodies, sleeping, pooling. |
| Hallucination post-processing tanks performance | Half-res effects, 60-second cap, dynamic resolution. |
| Animation workload (Crawler lunge, reloads, grabs, mask) | Procedural + keyframed transforms; reuse skeletons; masks hide faces. |
| Flat-shaded look can undercut horror | Keep the palette near-black, the silhouettes wrong, and the audio grounded. No cartoon humor. |
| Flat-shaded style can look too simple | Use strong color blocking, readable silhouettes, and detailed level composition — Fury Foot's clarity, not its simplicity. |
| Economy becomes frustrating | Tune from playtests; generous side jobs; no soft-locks. |
| 3.5 hours is a lot of handcrafted content | Modular vent/city kits; reuse assets; build chapter by chapter. |
| Open areas run poorly in a browser | Bounded zones, fog, per-zone loading, merged geometry, dynamic resolution. |
| Getting lost in a longer game | Journal map, landmarks, one-way drops, spoken directions. |
| Asset licensing | CC0 only; synthesized audio; `CREDITS.md`. |
| Playtests spoil scares | Test with fresh players each milestone; watch, don't explain. |
| Longer game means more bugs | Save/checkpoint tests per act; finish each chapter before moving on. |

---

## 16. Open decisions

1. **Name:** INTAKE as working title — keep or change?
2. **Visual target:** Fury Foot-style flat-shaded low-poly with a dark industrial palette — confirm the palette and level of detail.
3. **Default difficulty:** Ranger (intended, harsh) or Standard (friendlier)?
4. **Crawler kill window:** ~1.8 seconds — good, or shorter/longer?
5. **Hallucinations:** eight unique encounters with 3–5 memory-driven variants each — enough, or want more?
6. **Tenant memory:** should it reference your deaths and choices (recommended), or stay purely in-fiction with no meta-awareness?
7. **Optional name:** should the intro ask what the station calls you? It is stored locally and used sparingly.
8. **Tenant:** confirm it never damages the player, only shows visions.
9. **Weapons:** the five-gun roster good, or do you want a specific gun added?
10. **Opening:** family dinner prologue with the Tenant and the Broodmother (planned) — confirm the camera-only control and the implied violence.
11. **Bookend object:** the family photo from the dinner table (planned), or something else?
12. **Ending:** a single definitive nest ending — confirm no alternate or secret ending.
13. **Repo creation:** create now with plan + README only, or after name is locked?

---

## 17. Next step

Say **go**, and I will:
1. Create the public GitHub repo `intake`.
2. Add `README.md`, `DESIGN.md`, `CREDITS.md`, and `.gitignore`.
3. Stop there — no game code until you explicitly ask for M1.
