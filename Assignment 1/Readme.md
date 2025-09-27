# Crowd Simulation Renderer – README

## Overview
This assignment is a **2D Crowd Simulation Renderer** developed as part of *CS606: Computer Graphics (Term 1, 2025–26)*.  
The renderer demonstrates the use of **WebGL** for:

- Generating a random triangulated layout inside a rectangle.  
- Adding square/rectangular **obstacles** whose corners are part of the triangulation.  
- Representing **crowd members** as black dots distributed across triangles.  
- Supporting **mouse-driven interactions** for rotating, translating, and scaling obstacles.  
- Assigning **population densities** to each triangle, with color coding for:  
  - Green → balanced density  
  - Red → overpopulated  
  - Blue → underpopulated  
- Updating triangulation and densities dynamically when people move between triangles.  

---

## User Interactions

The app is **mouse-based only**:

- **Click + Drag on Obstacle:** Rotate or translate the obstacle.  
- **Click + Drag on Obstacle Edges:** Scale obstacle about its center.  
- **Click on People Dots:** Select and move them to another triangle.  

As interactions happen:

- Triangulation updates dynamically.  
- Triangle density visualization updates automatically (green/red/blue).  

---

## Demonstrated Functionalities

The demo video + report show:

1. Initial triangulation layout with random points.  
2. Placement of an obstacle within the mesh.  
3. Rotation, translation, and scaling of the obstacle.  
4. Density-based coloring of triangles.  
5. Movement of a person between triangles, with updated densities.  

---

## Video Link
https://drive.google.com/drive/folders/152GZPRLxgJYE5eJMFNNHx4D9plKlTg_B?usp=drive_link

---

## 🛠️ Compilation & Usage Instructions

1. Clone the repository from GitHub:
   ```
   git clone https://github.com/aashishvaswani/Computer-Graphics-.git
   cd Computer-Graphics-
   ```
   
2. Open the src/index.html file in a modern browser:
  - Double-click it, or
  - Run open src/index.html (Mac) or start src/index.html (Windows).

3. The application will launch and display:
  - A rectangular boundary with triangulated layout.
  - At least one obstacle within the triangulation.
  - Black dots representing people.

4. Use the mouse interactions to:
  - Rotate or translate obstacles (click + drag).
  - Scale obstacles about their center (drag edges).
  - Move people between triangles (click on dots).

5. The population density visualization updates automatically as interactions occur.
