import os
from PIL import Image
import numpy as np

base_dir = r'd:\finny3\assets\pet'
os.makedirs(os.path.join(base_dir, 'idle'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'blink'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'happy'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'sleep'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'sad'), exist_ok=True)

idle_src = Image.open(r'd:\finny3\assets\finny_idle.png').convert('RGBA')
blink_src = Image.open(r'd:\finny3\assets\finny_blink.png').convert('RGBA')
waving_src = Image.open(r'd:\finny3\assets\finny_waving.png').convert('RGBA')

CANVAS_W, CANVAS_H = 500, 780
ANCHOR_X, ANCHOR_Y = 250, 755
SCALE = 0.625

IDLE_FOOT_X = 284.3
IDLE_FOOT_Y = 1137.0
BLINK_FOOT_X = 283.6
BLINK_FOOT_Y = 1136.0
WAVING_FOOT_X = 375.5
WAVING_FOOT_Y = 1136.0

def create_frame(im, base_foot_x, base_foot_y, scale_x=1.0, scale_y=1.0, offset_x=0, offset_y=0):
    effective_scale_x = SCALE * scale_x
    effective_scale_y = SCALE * scale_y
    w, h = im.size
    nw = max(1, int(round(w * effective_scale_x)))
    nh = max(1, int(round(h * effective_scale_y)))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    px = int(round(ANCHOR_X - base_foot_x * effective_scale_x + offset_x))
    py = int(round(ANCHOR_Y - base_foot_y * effective_scale_y + offset_y))
    canvas.paste(resized, (px, py), resized)
    return canvas

# 1. GENERATE IDLE (14 frames of smooth breathing anchored to feet)
idle_base = create_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y)
for i in range(14):
    t = (i / 14.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0  # 0.0 to 1.0
    scale_y = 1.0 + breath * 0.016    # up to +1.6% height
    scale_x = 1.0 - breath * 0.007    # subtle volume conservation
    f = create_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=scale_x, scale_y=scale_y)
    f.save(os.path.join(base_dir, 'idle', f'{i+1:02d}.png'))
print('Saved 14 idle frames')

# 2. GENERATE BLINK (6 frames: open -> 30% -> 75% -> 100% closed -> 50% -> 15%)
blink_base = create_frame(blink_src, BLINK_FOOT_X, BLINK_FOOT_Y)
blink_weights = [0.0, 0.30, 0.75, 1.0, 0.50, 0.15]
for idx, w in enumerate(blink_weights):
    if w == 0.0:
        f = idle_base.copy()
    elif w == 1.0:
        f = blink_base.copy()
    else:
        f = Image.blend(idle_base, blink_base, w)
    f.save(os.path.join(base_dir, 'blink', f'{idx+1:02d}.png'))
print('Saved 6 blink frames')

# 3. GENERATE HAPPY / WAVING (16 frames)
waving_base = create_frame(waving_src, WAVING_FOOT_X, WAVING_FOOT_Y)
for idx in range(16):
    f_num = idx + 1
    if f_num == 1:
        f = idle_base.copy()
    elif f_num == 2:
        # Anticipation squash
        f = create_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=1.015, scale_y=0.985)
    elif f_num == 3:
        # Pop up
        f = create_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=0.99, scale_y=1.015)
    elif f_num in range(4, 9):
        # Arm rises, mouth opens into smile
        progress = (f_num - 3) / 5.0
        f = Image.blend(idle_base, waving_base, progress)
    elif f_num in range(9, 13):
        # Wave oscillation at peak
        wave_dx = 3 if f_num % 2 == 0 else -3
        f = create_frame(waving_src, WAVING_FOOT_X, WAVING_FOOT_Y, offset_x=wave_dx)
    elif f_num in range(13, 17):
        # Arm lowers smoothly back to idle
        progress = 1.0 - (f_num - 12) / 4.0
        f = Image.blend(idle_base, waving_base, max(0.0, progress))
    f.save(os.path.join(base_dir, 'happy', f'{f_num:02d}.png'))
print('Saved 16 happy frames')

# 4. GENERATE SLEEP (12 frames: closed eyes, slow deep rhythmic breathing)
for idx in range(12):
    t = (idx / 12.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.985 + breath * 0.022
    scale_x = 1.010 - breath * 0.009
    f = create_frame(blink_src, BLINK_FOOT_X, BLINK_FOOT_Y, scale_x=scale_x, scale_y=scale_y)
    f.save(os.path.join(base_dir, 'sleep', f'{idx+1:02d}.png'))
print('Saved 12 sleep frames')

# 5. GENERATE SAD (10 frames: drooping slightly, sorrowful slow breath)
for idx in range(10):
    t = (idx / 10.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.975 + breath * 0.012
    scale_x = 1.015 - breath * 0.006
    f = create_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=scale_x, scale_y=scale_y, offset_y=3)
    f.save(os.path.join(base_dir, 'sad', f'{idx+1:02d}.png'))
print('Saved 10 sad frames')
