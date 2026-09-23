# CampusRide Design System

## 1. Core Concept
**The Transit Line**: Movement is the central visual identity of the product. Every route behaves visually like a transit line: `●────●────●`.

## 2. Personality
- Premium, Intelligent, Calm, Precise, Human, Operational.
- Strictly NOT generic, AI-generated, or futuristic.

## 3. Typography
- **Primary UI**: Instrument Sans (or Inter as fallback).
- **Scale**:
  - Page title: 36px / 700
  - Section title: 20px / 650
  - Subheading: 16px / 600
  - Body: 14px / 400
  - Small: 12px / 500
  - Micro: 11px / 500
  - Large number: 32px / 700
  - Hero number: 48px / 700
- **Numbers**: `font-variant-numeric: tabular-nums` for all data.

## 4. Color Palette
- **Background**: `#F4F5F7`
- **Surface**: `#FFFFFF`
- **Primary text**: `#101828`
- **Secondary text**: `#667085`
- **Border**: `#E4E7EC`
- **Primary action**: `#2457E6`
- **Dark navy (Sidebar)**: `#0D1B2A`
- **Operational green**: `#19A974`
- **Warning**: `#F59E0B`
- **Danger**: `#E25555`

**Semantic Route Colors:**
- Blue Line: `#3867FF`
- Green Line: `#19A974`
- Orange Line: `#F27A38`
- Violet Line: `#8067E8`
- Teal Line: `#19A7A8`
- Pink Line: `#D65A91`

## 5. Shape & Elevation
- **Border Radius**: Buttons/Inputs 7px, Panels 10px, Cards 10-12px. No pill shapes except small status indicators.
- **Shadows**: Almost none. Rely entirely on 1px solid borders (`#E4E7EC`). Only use elevation for drawers, dropdowns, and floating command palettes.

## 6. Components
- **JourneyPath**: `● Main Gate ───────────── ● Library`
- **Status Indicator**: Small dot + text (`● Accepted`). No huge pills.
- **Table**: 52-60px row heights. Dense, subtle horizontal rules.
- **Drawer**: 420-460px width, sharp or 8px radius, no heavy modal mask.
- **Activity Timeline**: Vertical track mapping chronological events.
