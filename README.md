# RobCoffee — Autonomous Kiosk Financial Model

Interactive financial model for the RobCoffee autonomous coffee kiosk brand extension. Models unit economics, fleet P&L, cash flow, and steady-state profitability across a 3-year deployment horizon.

## Quick Start

```bash
npm install
npm start
```

Opens at `http://localhost:3000`.

## Deploy to GitHub Pages

1. Update `homepage` in `package.json` with your GitHub username
2. Run:

```bash
npm run deploy
```

Live at `https://yourusername.github.io/robcoffee-model`

## What's Modeled

- **Unit Economics** — Per-kiosk revenue, COGS, contribution margin, payback period
- **Fleet P&L** — 3-year build from 100 → 500 → 1,000 kiosks with phased quarterly deployment
- **Cash Flow** — Cumulative CapEx vs. contribution build, breakeven timing
- **Steady State** — Year 3+ economics with replacement CapEx only
- **Risk Matrix** — Location acquisition, hardware reliability, regulatory, capital intensity

Every input is adjustable via sliders. The model recalculates in real time.

## Tech Stack

React 18, vanilla CSS-in-JS. Zero external dependencies beyond React itself.
