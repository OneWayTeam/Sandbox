import os
from PIL import Image, ImageChops
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

CANVAS_W, CANVAS_H = 600, 1250
BOTTOM_Y = CANVAS_H - 30

def place_canvas(im, offset_x=0, offset_y=0, scale_x=1.0, scale_y=1.0):
    w, h = im.size
    nw = int(round(w * scale_x))
    nh = int(round(h * scale_y))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    pos_x = (CANVAS_W - nw) // 2 + offset_x
    pos_y = BOTTOM_Y - nh + offset_y
    canvas.paste(resized, (pos_x, pos_y), resized)
    return canvas

# 1. GENERATE IDLE (14 frames of smooth breathing anchored to feet)
# The feet remain strictly on the floor, while torso and ears expand and contract gently.
idle_base = place_canvas(idle_src)
for i in range(14):
    # Sinusoidal breathing curve
    t = (i / 14.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0 # 0.0 to 1.0
    scale_y = 1.0 + breath * 0.018   # up to +1.8% height
    scale_x = 1.0 - breath * 0.008   # subtle compression
    frame = place_canvas(idle_src, scale_x=scale_x, scale_y=scale_y)
    frame.save(os.path.join(base_dir, 'idle', f'{i+1:02d}.png'))

print('Generated 14 idle frames')

# 2. GENERATE BLINK (6 frames: open -> 30% -> 70% -> 100% closed -> 50% -> open)
idle_c = place_canvas(idle_src)
blink_c = place_canvas(blink_src)

# Eyelid weights for each frame
blink_weights = [0.0, 0.35, 0.85, 1.0, 0.45, 0.0]
for idx, w in enumerate(blink_weights):
    if w == 0.0:
        f = idle_c.copy()
    elif w == 1.0:
        f = blink_c.copy()
    else:
        # Crossfade between eye states
        f = Image.blend(idle_c, blink_c, w)
    f.save(os.path.join(base_dir, 'blink', f'{idx+1:02d}.png'))

print('Generated 6 blink frames')

# 3. GENERATE HAPPY / WAVING (16 frames)
# Phase 1: Preparation / squash (frames 1-3)
# Phase 2: Paw raising & smile appearing (frames 4-8)
# Phase 3: Paw waving at peak (frames 9-12)
# Phase 4: Paw lowering back to idle (frames 13-16)
waving_c = place_canvas(waving_src, offset_x=12) # account for raised arm width

for idx in range(16):
    f_num = idx + 1
    if f_num == 1:
        # Neutral idle
        f = idle_c.copy()
    elif f_num == 2:
        # Anticipation squash
        f = place_canvas(idle_src, scale_x=1.02, scale_y=0.98)
    elif f_num == 3:
        # Pop up
        f = place_canvas(idle_src, scale_x=0.99, scale_y=1.02)
    elif f_num in range(4, 9):
        # Progressively morph to waving
        progress = (f_num - 3) / 5.0
        f = Image.blend(idle_c, waving_c, progress)
    elif f_num in range(9, 13):
        # Active wave oscillation at peak
        wave_offset = 4 if f_num % 2 == 0 else -4
        f = place_canvas(waving_src, offset_x=12 + wave_offset)
    elif f_num in range(13, 17):
        # Return to idle
        progress = 1.0 - (f_num - 12) / 4.0
        f = Image.blend(idle_c, waving_c, max(0.0, progress))
    
    f.save(os.path.join(base_dir, 'happy', f'{f_num:02d}.png'))

print('Generated 16 happy/waving frames')

# 4. GENERATE SLEEP (8 frames: closed eyes, slow deep breathing)
for idx in range(8):
    t = (idx / 8.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.99 + breath * 0.022
    scale_x = 1.01 - breath * 0.010
    f = place_canvas(blink_src, scale_x=scale_x, scale_y=scale_y)
    f.save(os.path.join(base_dir, 'sleep', f'{idx+1:02d}.png'))

print('Generated 8 sleep frames')

# 5. GENERATE SAD (8 frames: drooping slightly)
for idx in range(8):
    t = (idx / 8.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.97 + breath * 0.012
    scale_x = 1.02 - breath * 0.006
    f = place_canvas(idle_src, scale_x=scale_x, scale_y=scale_y, offset_y=4)
    f.save(os.path.join(base_dir, 'sad', f'{idx+1:02d}.png'))

print('Generated 8 sad frames')
