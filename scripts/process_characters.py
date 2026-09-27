import os, glob
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

brain_dir = r"C:\Users\gamed\.gemini\antigravity-ide\brain\1938e846-d01e-4e9a-b701-62e1d5769b2b"
out_base = r"d:\finny3\assets\pets"
os.makedirs(out_base, exist_ok=True)
os.makedirs(os.path.join(out_base, "accessories"), exist_ok=True)

def cutout_image(img_path, thresh=28, blur_radius=0.75):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    arr = np.array(img, dtype=np.float32)

    diff = 255.0 - arr
    dist = np.max(diff, axis=2)

    bg_mask = np.zeros((h, w), dtype=bool)
    q = deque()

    for x in range(w):
        if dist[0, x] < thresh:
            bg_mask[0, x] = True
            q.append((0, x))
        if dist[h - 1, x] < thresh:
            bg_mask[h - 1, x] = True
            q.append((h - 1, x))

    for y in range(h):
        if dist[y, 0] < thresh and not bg_mask[y, 0]:
            bg_mask[y, 0] = True
            q.append((y, 0))
        if dist[y, w - 1] < thresh and not bg_mask[y, w - 1]:
            bg_mask[y, w - 1] = True
            q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not bg_mask[ny, nx] and dist[ny, nx] < thresh:
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))

    fg_alpha = np.where(bg_mask, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(fg_alpha)

    smooth_alpha = alpha_img.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    alpha_arr = np.array(smooth_alpha, dtype=np.float32) / 255.0

    clean_rgb = np.zeros_like(arr)
    for c in range(3):
        channel = arr[:, :, c]
        cleaned = (channel - (1.0 - alpha_arr) * 255.0) / np.maximum(alpha_arr, 0.001)
        clean_rgb[:, :, c] = np.clip(cleaned, 0, 255)

    rgba = np.dstack([clean_rgb.astype(np.uint8), (alpha_arr * 255).astype(np.uint8)])
    res = Image.fromarray(rgba)
    bbox = res.getbbox()
    return res.crop(bbox)

# Target unified canvas: 400 width x 480 height
# Baseline: feet touch at Y = 465
CANVAS_W = 400
CANVAS_H = 480
BASELINE_Y = 465

mapping = {
    'raccoon': 'pet_raccoon_art',
    'fox': 'pet_fox_art',
    'cat': 'pet_cat_art',
    'panda': 'pet_panda_art',
    'capybara': 'pet_capybara_art',
    'rabbit': 'pet_rabbit_art',
    'bear': 'pet_bear_art',
    'dog': 'pet_dog_art',
    'otter': 'pet_otter_art',
}

files = glob.glob(os.path.join(brain_dir, "*.*"))

metadata = {}

for species, prefix in mapping.items():
    match = [f for f in files if prefix in f and f.endswith(".jpg")]
    if not match:
        print("Missing file for", species)
        continue
    img_path = match[0]
    cropped = cutout_image(img_path)
    cw, ch = cropped.size

    # Standardize height: character body height ~ 440px (allowing ears to reach near top)
    target_h = 440
    scale = target_h / ch
    target_w = int(cw * scale)
    scaled = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Place on standardized canvas
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    pos_x = (CANVAS_W - target_w) // 2
    pos_y = BASELINE_Y - target_h
    canvas.paste(scaled, (pos_x, pos_y), scaled)

    # Create species directory
    species_dir = os.path.join(out_base, species)
    os.makedirs(species_dir, exist_ok=True)

    # Save full body
    body_path = os.path.join(species_dir, "body.png")
    canvas.save(body_path, "PNG")

    # Create 140x140 Avatar Thumbnail focused on the head/face
    # Head is typically in top 45% of scaled character
    head_box = (
        max(0, pos_x + target_w // 2 - 80),
        max(0, pos_y + 10),
        min(CANVAS_W, pos_x + target_w // 2 + 80),
        min(CANVAS_H, pos_y + 170)
    )
    head_crop = canvas.crop(head_box)
    thumb = head_crop.resize((120, 120), Image.Resampling.LANCZOS)
    thumb_path = os.path.join(species_dir, "thumb.png")
    thumb.save(thumb_path, "PNG")

    metadata[species] = {
        'canvasWidth': CANVAS_W,
        'canvasHeight': CANVAS_H,
        'baselineY': BASELINE_Y,
        'bodyWidth': target_w,
        'bodyHeight': target_h,
        'anchorX': CANVAS_W // 2,
        'anchorY': BASELINE_Y,
    }
    print(f"Processed {species:10s} -> {body_path} ({target_w}x{target_h})")

# Process Accessories
acc_map = {
    'beret': 'art_hat_beret',
    'glasses': 'art_hat_glasses',
    'clover': 'art_badge_clover',
}

for acc, prefix in acc_map.items():
    match = [f for f in files if prefix in f and f.endswith(".jpg")]
    if match:
        cut = cutout_image(match[0], thresh=24)
        acc_path = os.path.join(out_base, "accessories", f"{acc}.png")
        cut.save(acc_path, "PNG")
        print(f"Processed accessory {acc:8s} -> {acc_path} ({cut.size})")

# Write metadata json
import json
meta_path = os.path.join(out_base, "metadata.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print("Metadata written to", meta_path)
