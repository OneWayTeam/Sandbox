import os
from PIL import Image, ImageDraw, ImageFilter
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

def create_canvas_frame(im, base_foot_x, base_foot_y, scale_x=1.0, scale_y=1.0, offset_x=0, offset_y=0):
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

# 1. Base idle canvas
idle_base = create_canvas_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y)

# 2. Build PURE BLINK (closed eyes composited ONLY onto eye region of idle_src)
# First align blink_src to idle_src coordinates
# In raw images: idle mid=284.3, max_y=1137; blink mid=283.6, max_y=1136
blink_aligned = Image.new('RGBA', idle_src.size, (0, 0, 0, 0))
blink_aligned.paste(blink_src, (int(round(284.3 - 283.6)), int(round(1137 - 1136))), blink_src)

# Eye mask on raw idle_src
eye_mask_raw = Image.new('L', idle_src.size, 0)
d_eye = ImageDraw.Draw(eye_mask_raw)
d_eye.ellipse([135, 410, 245, 540], fill=255) # left eye
d_eye.ellipse([305, 410, 415, 540], fill=255) # right eye
eye_mask_raw = eye_mask_raw.filter(ImageFilter.GaussianBlur(14))

pure_blink_src = Image.composite(blink_aligned, idle_src, eye_mask_raw)
blink_base = create_canvas_frame(pure_blink_src, IDLE_FOOT_X, IDLE_FOOT_Y)

# 3. Build PURE HAPPY (happy open mouth & smile composited ONLY onto mouth region of idle_src)
# In raw images: waving mid=375.5, max_y=1136
waving_aligned = Image.new('RGBA', idle_src.size, (0, 0, 0, 0))
waving_aligned.paste(waving_src, (int(round(284.3 - 375.5)), int(round(1137 - 1136))), waving_src)

mouth_mask_raw = Image.new('L', idle_src.size, 0)
d_mouth = ImageDraw.Draw(mouth_mask_raw)
d_mouth.ellipse([205, 470, 365, 625], fill=255)
mouth_mask_raw = mouth_mask_raw.filter(ImageFilter.GaussianBlur(10))

pure_happy_src = Image.composite(waving_aligned, idle_src, mouth_mask_raw)
happy_base = create_canvas_frame(pure_happy_src, IDLE_FOOT_X, IDLE_FOOT_Y)

# Also create happy wink (happy mouth + cute closed eyes)
pure_happy_wink_src = Image.composite(pure_blink_src, pure_happy_src, eye_mask_raw)
happy_wink_base = create_canvas_frame(pure_happy_wink_src, IDLE_FOOT_X, IDLE_FOOT_Y)

print('Base composited images created successfully!')

# ----------------- GENERATE SEQUENCES -----------------

# 1. IDLE (14 frames: smooth natural breathing anchored to paws)
for i in range(14):
    t = (i / 14.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 1.0 + breath * 0.015
    scale_x = 1.0 - breath * 0.007
    f = create_canvas_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=scale_x, scale_y=scale_y)
    f.save(os.path.join(base_dir, 'idle', f'{i+1:02d}.png'))
print('Saved 14 idle frames')

# 2. BLINK (6 frames: 100% locked body, ONLY eyelids move)
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

# 3. HAPPY (16 frames: joyful smile & wink on tap, ZERO body/ear shift)
for idx in range(16):
    f_num = idx + 1
    if f_num == 1:
        f = idle_base.copy()
    elif f_num == 2:
        # Anticipation squash
        f = create_canvas_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=1.015, scale_y=0.985)
    elif f_num in range(3, 6):
        # Smile appears & perks up
        prog = (f_num - 2) / 3.0
        f = Image.blend(idle_base, happy_base, prog)
    elif f_num in range(6, 10):
        # Joyful wink/blink with happy smile at peak!
        if f_num in (7, 8):
            f = happy_wink_base.copy()
        else:
            f = happy_base.copy()
    elif f_num in range(10, 14):
        # Joyful smile returns to neutral
        prog = 1.0 - (f_num - 9) / 4.0
        f = Image.blend(idle_base, happy_base, max(0.0, prog))
    else:
        # Soft neutral landing
        f = idle_base.copy()
    f.save(os.path.join(base_dir, 'happy', f'{f_num:02d}.png'))
print('Saved 16 happy frames')

# 4. SLEEP (12 frames: closed eyes, slow deep restful breathing)
for idx in range(12):
    t = (idx / 12.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.985 + breath * 0.020
    scale_x = 1.010 - breath * 0.008
    f = create_canvas_frame(pure_blink_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=scale_x, scale_y=scale_y)
    f.save(os.path.join(base_dir, 'sleep', f'{idx+1:02d}.png'))
print('Saved 12 sleep frames')

# 5. SAD (10 frames: slight droop, slow sorrowful breath)
for idx in range(10):
    t = (idx / 10.0) * 2 * np.pi
    breath = (np.sin(t) + 1.0) / 2.0
    scale_y = 0.975 + breath * 0.012
    scale_x = 1.012 - breath * 0.006
    f = create_canvas_frame(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, scale_x=scale_x, scale_y=scale_y, offset_y=3)
    f.save(os.path.join(base_dir, 'sad', f'{idx+1:02d}.png'))
print('Saved 10 sad frames')
