**1. Game Overview (01_game_overview.md)**
A quick reference snapshot of the game's core properties — genre, platform, camera perspective, player mechanics, visual style, and key influences. Use this as the north star when making any design or asset decision.

**2. Visual Mood & Tone (02_visual_mood_tone.md)**
Defines the emotional feel and aesthetic direction of the game. Establishes the retro arcade identity, the level of polish expected, and clear boundaries for what to avoid to maintain visual consistency.

**3. Pixel Art Specifications (03_pixel_art_specifications.md)**
A complete size reference table for every asset type in the game, from the player ship to UI icons and background tiles. Use this before creating any new asset to determine the correct canvas size.

**4. Color Palette (04_color_palette.csv, 04_color_palette.md)**
The definitive list of approved colors with hex codes, organized by role. Every sprite, UI element, light, and effect must draw exclusively from this palette to ensure visual unity across the entire game. The CSV file structure includes four columns: Role (the color's purpose, e.g., "Player primary"), Color Name (descriptive name, e.g., "Cyan"), Hex (hexadecimal code, e.g., "#00e5ff"), and Usage (specific application notes).

**5. Sprite Style Rules (05_sprite_style_rules.md)**
The technical rules governing how every sprite is drawn — outlines, shading, anti-aliasing, dithering, symmetry, and silhouette readability. Following these rules ensures all assets look like they belong to the same game.

**6. Lighting (06_lighting_unity_2d_urp.md)**
Guidelines for Unity 2D URP lighting setup, including light types, colors, intensities, and behavior rules for each game element. Defines how light contributes to atmosphere without overwhelming the retro aesthetic.

**7. Animation Guidelines (07_animation_guidelines.md)**
Frame counts, speeds, and behavioral rules for every animation in the game. Ensures all movement feels consistent — snappy, mechanical, and satisfying — whether it's the player ship tilting or an enemy exploding.

**8. Asset Design Language (08_asset_design_language.md)**
Describes the visual DNA of each major asset category — player ship, enemy tiers, projectiles, and pickups. Use this as a brief before designing any new character or object to keep designs coherent and readable.

**9. UI Style (09_ui_style.md)**
Typography, color, layout rules, and visual treatment for all interface elements including health bars, score displays, and upgrade screens. Ensures the UI feels native to the retro arcade world rather than generic.

**10. Asset Naming Convention (10_asset_naming_convention.md)**
The standardized file naming format for all game assets. Consistent naming keeps the repository organized and makes assets easy to find, reference, and replace as the project grows.

**11. AI Art Generation Prompt Template (11_ai_art_generation_prompt_template.md)**
A reusable base prompt for generating concept art and sprites using FLUX or Stable Diffusion, with style keywords locked to the game's visual identity. Use this as the starting point for every AI generation session.

**12. Asset Checklist (12_asset_checklist.md)**
A pre-commit verification list to run through before adding any asset to the repository. Catches common mistakes early and enforces style guide compliance across every contribution.