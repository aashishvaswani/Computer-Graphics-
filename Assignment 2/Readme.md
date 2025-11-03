# Star System Generator – README

## Overview
This assignment is a **3D Star System Generator** built with **WebGL** for *CS606: Computer Graphics (Term 1, 2025–26)*.

It demonstrates:
- A hierarchical **scene graph** (Star → Planets → Moons).
- **Procedural generation** of planets (count, sizes, orbits, colors) and optional moons.
- **Dual cameras**: 3D orbital camera and orthographic **Top View**.
- **Orbit paths**, **axes**, and simple **Phong lighting**.
- Optional **OBJ mesh** loading for non-spherical bodies (e.g., asteroid).

---

## User Interactions

**Keyboard**
- **V**: Toggle View (3D ↔ Top)
- **Space**: Pause / Play simulation
- **↑ / ↓**: Increase / Decrease simulation speed
- **A**: Toggle axes
- **O**: Toggle orbit paths
- **R**: Reset camera

**HUD (on screen)**
- **Planets** slider (1–10)
- **Orbit speed** slider
- **Randomize System** (new seed)
- **Reset Camera** button

As you interact:
- Orbits and transforms update in real time.
- Top View shows clear orbit geometry for analysis.
- Randomization creates new, reproducible systems.

---

## Demonstrated Functionalities

The demo video + report show:
1. Default system with star, multiple planets, and moons.
2. **Randomize System** to reseed sizes, colors, and orbits.
3. **Top View** with orbit paths for clear spatial layout.
4. **Axes/Orbits** toggles and **Pause/Play** for presentations.
5. Basic **Phong shading** responding to camera movement.
6. (Optional) Loading an **OBJ** asset (e.g., asteroid) into the scene.

---

## Video Link
https://drive.google.com/drive/u/1/folders/152GZPRLxgJYE5eJMFNNHx4D9plKlTg_B

---

## 🛠️ Compilation & Usage Instructions

1. Start a local server in the project root (OBJ loading needs HTTP):
   - **Python**  
     ```bash
     python -m http.server 8000
     ```
   - **Node**  
     ```bash
     npx http-server .
     ```

2. Open the app:
   - Visit `http://localhost:8000/code/index.html` in a modern browser.

3. Use the **HUD** and **keyboard** controls to explore:
   - Toggle 3D/Top view, adjust speed, show/hide axes and orbits, randomize the system.

> If you open the file directly via `file://`, OBJ assets won’t load due to browser security. Use a local server.
