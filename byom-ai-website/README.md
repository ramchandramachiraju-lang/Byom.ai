# BYOM.AI — Built World Intelligence

An immersive, responsive product-story website for Byom.ai / SiteLens AI. The experience combines a scroll-driven 3D architectural scene with an interactive project-view concept and a direct contact path.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Experience structure

- **The site:** scroll-linked architectural story with drone, façade, floor cutaway and 360° camera moments.
- **The workflow:** interactive concept preview switching between project overview, drawing context and a 360° interior view.
- **The contact close:** clear demo/contact call to action.

## Technology

React, Vite, Three.js, React Three Fiber, Drei, GSAP ScrollTrigger, Lenis and Framer Motion. The architectural model is a custom procedural GLB visualization in `public/models/`; it is not a photogrammetry scan or a live customer project. The product console is explicitly labelled as an illustrative concept preview, not a live application.

## Before publishing

1. Replace the illustrative project preview with genuine, approved product screenshots or a working demo.
2. Replace the procedural building model with a professionally authored architectural asset if photorealistic fidelity is required.
3. Confirm the contact address and add the actual company privacy/legal links.
4. Run `npm install` and `npm run build` in the deployment environment, then test desktop, mobile, touch scrolling, keyboard navigation and reduced-motion behavior.

No live customer metrics, deployment claims or AI accuracy claims are fabricated in this website.

### V10.1 visual refinement
- Enlarged and detailed the quadcopter drone, with visible rotor animation and signal-orange details.
- Adjusted the drone's flight path to keep it above the roofline and more visible from the hero camera.
- Added a final scroll-linked camera move through the façade toward a furnished living-room view.
- The drone fades out as the camera transitions indoors, keeping the room close-up unobstructed.


## Deploy to Vercel

This project includes `vercel.json` configured for Vite (`npm run build`, output `dist`) with an SPA rewrite.

1. Push this project folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the detected Vite settings: Install `npm install`, Build `npm run build`, Output `dist`.
4. Deploy. Future pushes to the connected production branch will trigger deployments.

You can also deploy from a terminal after installing the Vercel CLI and logging in:

```bash
npm install
npm run build
npx vercel
npx vercel --prod
```

Vercel account authorization and project creation must be completed by the account owner.

### V11 brand palette
- Charcoal-black base: `#141414`
- Velvet-red primary accent: `#A3263A` / `#B83246`
- Soft red highlight: `#D15B6B`
