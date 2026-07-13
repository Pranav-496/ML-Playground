import math
import random

SVG_WIDTH = 900
SVG_HEIGHT = 300
CELL_SIZE = 12
CELL_GAP = 4
COLS = 52
ROWS = 7
CELL_STEP = CELL_SIZE + CELL_GAP

GRID_WIDTH = COLS * CELL_STEP - CELL_GAP
GRID_HEIGHT = ROWS * CELL_STEP - CELL_GAP
OFFSET_X = (SVG_WIDTH - GRID_WIDTH) / 2
OFFSET_Y = (SVG_HEIGHT - GRID_HEIGHT) / 2

path_coords = [
    (-3, 3), (2, 3), (2, 1), (6, 1), (6, 5), (10, 5), (10, 2), 
    (15, 2), (15, 6), (19, 6), (19, 3), (24, 3), (24, 0), 
    (29, 0), (29, 4), (34, 4), (34, 2), (39, 2), (39, 5), 
    (44, 5), (44, 1), (48, 1), (48, 4), (54, 4)
]

def get_pixel_coord(col, row):
    x = OFFSET_X + col * CELL_STEP + CELL_SIZE / 2
    y = OFFSET_Y + row * CELL_STEP + CELL_SIZE / 2
    return x, y

segments = []
total_length = 0
for i in range(len(path_coords) - 1):
    c1, r1 = path_coords[i]
    c2, r2 = path_coords[i+1]
    px1, py1 = get_pixel_coord(c1, r1)
    px2, py2 = get_pixel_coord(c2, r2)
    dist = math.hypot(px2 - px1, py2 - py1)
    segments.append({
        "start": (c1, r1),
        "end": (c2, r2),
        "dist": dist,
        "acc_len": total_length
    })
    total_length += dist

visited_cells = {}
for seg in segments:
    c1, r1 = seg["start"]
    c2, r2 = seg["end"]
    dc = 1 if c2 > c1 else (-1 if c2 < c1 else 0)
    dr = 1 if r2 > r1 else (-1 if r2 < r1 else 0)
    
    c, r = c1, r1
    while (c, r) != (c2, r2):
        if 0 <= c < COLS and 0 <= r < ROWS:
            px, py = get_pixel_coord(c, r)
            start_px, start_py = get_pixel_coord(c1, r1)
            cell_dist = math.hypot(px - start_px, py - start_py)
            hit_dist = seg["acc_len"] + cell_dist
            if (c, r) not in visited_cells:
                visited_cells[(c, r)] = hit_dist
        c += dc
        r += dr

    if 0 <= c2 < COLS and 0 <= r2 < ROWS:
        px, py = get_pixel_coord(c2, r2)
        start_px, start_py = get_pixel_coord(c1, r1)
        cell_dist = math.hypot(px - start_px, py - start_py)
        hit_dist = seg["acc_len"] + cell_dist
        if (c2, r2) not in visited_cells:
            visited_cells[(c2, r2)] = hit_dist

SNAKE_LENGTH = 150
ANIM_DUR = 12

def get_hit_pct(hit_dist):
    return ((hit_dist + SNAKE_LENGTH) / (total_length + SNAKE_LENGTH)) * 100

def interpolate_color(c1, c2, factor):
    r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
    r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
    r = int(r1 + (r2 - r1) * factor)
    g = int(g1 + (g2 - g1) * factor)
    b = int(b1 + (b2 - b1) * factor)
    return f"#{r:02X}{g:02X}{b:02X}"

def get_state(t, hit_pct):
    elapsed = (t - hit_pct) % 100
    if elapsed > 25 and elapsed < 98:
        return "#1E1E2E", "none"
    if elapsed <= 3:
        return interpolate_color("#A855F7", "#8B5CF6", elapsed / 3), "url(#glow)"
    elif elapsed <= 10:
        return interpolate_color("#8B5CF6", "#4C1D95", (elapsed - 3) / 7), "none"
    elif elapsed <= 25:
        return interpolate_color("#4C1D95", "#1E1E2E", (elapsed - 10) / 15), "none"
    else:
        return interpolate_color("#1E1E2E", "#A855F7", (elapsed - 98) / 2), "url(#glow)"

css = ""
for (c, r), hit_dist in visited_cells.items():
    hit_pct = get_hit_pct(hit_dist)
    name = f"a_{c}_{r}"
    css += f".c-{c}-{r} {{ animation: {name} {ANIM_DUR}s linear infinite; }}\n"
    
    points = set(range(0, 101, 2))
    points.add(round(hit_pct))
    points.add(100)
    
    lines = []
    for t in sorted(list(points)):
        color, filter_val = get_state(t, hit_pct)
        lines.append(f"{t}% {{ fill: {color}; filter: {filter_val}; }}")
    css += f"@keyframes {name} {{\n    " + "\n    ".join(lines) + "\n}\n"

random.seed(42)

for i in range(15):
    css += f"@keyframes f_{i} {{\n"
    css += f"    0% {{ transform: translate(0px, 0px) scale(1); opacity: 0; }}\n"
    css += f"    50% {{ transform: translate({random.randint(-15, 15)}px, {random.randint(-15, 15)}px) scale({random.uniform(1.2, 1.8)}); opacity: {random.uniform(0.4, 0.8)}; }}\n"
    css += f"    100% {{ transform: translate(0px, 0px) scale(1); opacity: 0; }}\n"
    css += f"}}\n"
    css += f".p-{i} {{ animation: f_{i} {random.uniform(6, 12):.1f}s ease-in-out infinite; }}\n"

css += f"""
.snake-mask-path {{
    animation: snake-move {ANIM_DUR}s linear infinite;
}}
@keyframes snake-move {{
    0% {{ stroke-dashoffset: {SNAKE_LENGTH}; }}
    100% {{ stroke-dashoffset: -{total_length}; }}
}}
"""

svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}" width="100%" height="100%">')
svg.append('<defs>')
svg.append('''
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0D1117"/>
        <stop offset="100%" stop-color="#12121E"/>
    </linearGradient>
    <linearGradient id="snake-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A855F7"/>
        <stop offset="100%" stop-color="#6366F1"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur1" />
        <feGaussianBlur stdDeviation="8" result="blur2" />
        <feMerge>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
''')
path_d = "M " + " L ".join([f"{get_pixel_coord(c, r)[0]} {get_pixel_coord(c, r)[1]}" for c, r in path_coords])
svg.append(f'''
    <mask id="snake-mask">
        <path d="{path_d}" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"
              stroke-dasharray="{SNAKE_LENGTH} 10000" class="snake-mask-path" />
    </mask>
</defs>
''')

svg.append(f'<style>\n{css}\n</style>')

svg.append('<rect width="100%" height="100%" fill="url(#bg-grad)" />')

for i in range(15):
    px = random.randint(20, SVG_WIDTH-20)
    py = random.randint(20, SVG_HEIGHT-20)
    r = random.uniform(1.5, 3.5)
    svg.append(f'<circle cx="{px}" cy="{py}" r="{r}" fill="#A855F7" class="p-{i}" filter="url(#glow)"/>')

svg.append(f'<rect x="25" y="25" width="{SVG_WIDTH-50}" height="{SVG_HEIGHT-50}" rx="16" fill="rgba(30, 30, 46, 0.4)" stroke="rgba(139, 92, 246, 0.15)" stroke-width="1" />')

svg.append(f'<circle cx="{SVG_WIDTH*0.2}" cy="{SVG_HEIGHT*0.5}" r="120" fill="#6366F1" opacity="0.1" filter="url(#glow)"/>')
svg.append(f'<circle cx="{SVG_WIDTH*0.8}" cy="{SVG_HEIGHT*0.5}" r="120" fill="#A855F7" opacity="0.1" filter="url(#glow)"/>')

svg.append('<g id="grid">')
for c in range(COLS):
    for r in range(ROWS):
        x = OFFSET_X + c * CELL_STEP
        y = OFFSET_Y + r * CELL_STEP
        cls = f"grid-cell c-{c}-{r}" if (c, r) in visited_cells else "grid-cell"
        fill = "#1E1E2E" if (c, r) not in visited_cells else ""
        svg.append(f'<rect x="{x}" y="{y}" width="{CELL_SIZE}" height="{CELL_SIZE}" rx="3" ry="3" class="{cls}" fill="{fill}"/>')
svg.append('</g>')

svg.append(f'''
<path d="{path_d}" fill="none" stroke="url(#snake-grad)" stroke-width="6" stroke-dasharray="2 8" stroke-linecap="round" stroke-linejoin="round" mask="url(#snake-mask)" filter="url(#glow)">
    <animate attributeName="stroke-dashoffset" from="120" to="0" dur="1s" repeatCount="indefinite" />
</path>
<path d="{path_d}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" mask="url(#snake-mask)" filter="url(#glow)" opacity="0.8"/>
''')

svg.append('</svg>')

with open("contribution-snake.svg", "w") as f:
    f.write("\n".join(svg))
print("Successfully generated contribution-snake.svg")
