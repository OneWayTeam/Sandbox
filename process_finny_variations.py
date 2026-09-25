import os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

CANONICAL_IDLE_PATH = r'd:\finny3\assets\finny_idle.png'
canon_idle = Image.open(CANONICAL_IDLE_PATH).convert('RGBA')
TARGET_W, TARGET_H = canon_idle.size # 568, 1142

def find_feet_and_head(alpha_arr):
    rows = np.any(alpha_arr > 30, axis=1)
    cols = np.any(alpha_arr > 30, axis=0)
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    return ymin, ymax, xmin, xmax

canon_ymin, canon_ymax, canon_xmin, canon_xmax = find_feet_and_head(np.array(canon_idle)[:, :, 3])
canon_height = canon_ymax - canon_ymin

def process_image(src_jpg_path, out_png_path, extra_scale=1.0, offset_y=0):
    img = Image.open(src_jpg_path).convert('RGB')
    arr = np.array(img).astype(np.float32)
    h, w, _ = arr.shape

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # Floor shadow identification:
    # Near the bottom (y > 0.90 * h), faint neutral shadows (abs(r-g)<15, abs(r-b)<15, r>160) are background
    is_floor_shadow = (np.arange(h)[:, None] > int(0.91 * h)) & \
                      (r > 160) & (g > 160) & (b > 160) & \
                      (np.abs(r - g) < 14) & (np.abs(r - b) < 14)
    
    # White background (bunny is grey/green/red with r,g,b < 200, so > 218 is strictly background):
    is_white = ((r > 218) & (g > 218) & (b > 218)) | is_floor_shadow

    # BFS floodfill from image borders
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if is_white[0, x]: q.append((0, x))
        if is_white[h-1, x]: q.append((h-1, x))
    for y in range(h):
        if is_white[y, 0]: q.append((y, 0))
        if is_white[y, w-1]: q.append((y, w-1))

    while q:
        y, x = q.popleft()
        if visited[y, x]:
            continue
        visited[y, x] = True
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_white[ny, nx]:
                q.append((ny, nx))

    # Mask construction
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    alpha[visited] = 0.0

    # Smooth boundary anti-aliasing
    alpha_img = Image.fromarray(alpha.astype(np.uint8))
    alpha_smooth = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.7))
    alpha_arr = np.array(alpha_smooth).astype(np.float32)

    # Defringe against white
    a_norm = np.clip(alpha_arr / 255.0, 0.001, 1.0)[:, :, np.newaxis]
    rgb_clean = (arr - (1.0 - a_norm) * 255.0) / a_norm
    rgb_clean = np.clip(rgb_clean, 0, 255).astype(np.uint8)

    rgba = Image.fromarray(np.dstack([rgb_clean, alpha_arr.astype(np.uint8)]), 'RGBA')

    # Crop to bounding box
    ymin, ymax, xmin, xmax = find_feet_and_head(alpha_arr)
    crop_h = ymax - ymin
    crop_w = xmax - xmin
    cropped = rgba.crop((xmin, ymin, xmax, ymax))

    # Scale so character height matches canonical height
    scale = (canon_height / float(crop_h)) * extra_scale
    new_w = int(round(crop_w * scale))
    new_h = int(round(crop_h * scale))
    scaled = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Place on canonical canvas
    canvas = Image.new('RGBA', (TARGET_W, TARGET_H), (0, 0, 0, 0))
    pos_x = (TARGET_W - new_w) // 2
    pos_y = canon_ymax - new_h + offset_y

    canvas.paste(scaled, (pos_x, pos_y), scaled)

    os.makedirs(os.path.dirname(out_png_path), exist_ok=True)
    canvas.save(out_png_path)
    print(f"Processed cleanly -> {out_png_path}")

BRAIN_DIR = r'C:\Users\gamed\.gemini\antigravity-ide\brain\e873e330-dcaf-45f4-94e9-3ae6b9982a3d'
CUSTOM_DIR = r'd:\finny3\assets\pet_custom'
ACTIONS_DIR = r'd:\finny3\assets\pet_actions'

os.makedirs(CUSTOM_DIR, exist_ok=True)
os.makedirs(ACTIONS_DIR, exist_ok=True)

canon_idle.save(os.path.join(CUSTOM_DIR, 'sweater_green.png'))
canon_idle.save(os.path.join(ACTIONS_DIR, 'idle.png'))

jobs = [
    ('finny_blue_sweater_1790357804377.jpg', os.path.join(CUSTOM_DIR, 'sweater_blue.png'), 1.0, 0),
    ('finny_red_sweater_1790357856548.jpg', os.path.join(CUSTOM_DIR, 'sweater_red.png'), 1.0, 0),
    ('finny_with_beret_1790357901862.jpg', os.path.join(CUSTOM_DIR, 'hat_beret.png'), 1.0, 0),
    ('finny_with_glasses_1790357957252.jpg', os.path.join(CUSTOM_DIR, 'hat_glasses.png'), 1.0, 0),
    ('finny_master_artist_1790358015436.jpg', os.path.join(CUSTOM_DIR, 'stage_master.png'), 1.0, 0),
    ('finny_eating_carrot_1790358068616.jpg', os.path.join(ACTIONS_DIR, 'eating.png'), 1.0, 0),
    ('finny_celebrating_1790358130442.jpg', os.path.join(ACTIONS_DIR, 'celebrating.png'), 1.0, 0),
    ('finny_sleeping_1790358197763.jpg', os.path.join(ACTIONS_DIR, 'sleeping.png'), 1.0, 0),
]

for src_name, dst_path, sc, off_y in jobs:
    src_full = os.path.join(BRAIN_DIR, src_name)
    if os.path.exists(src_full):
        process_image(src_full, dst_path, sc, off_y)

print("All Finny variations re-processed!")
