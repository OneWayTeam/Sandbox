import os
from PIL import Image, ImageDraw, ImageFilter

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

def place_canvas(im, base_foot_x, base_foot_y, scale_x=1.0, scale_y=1.0, offset_x=0, offset_y=0):
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

# 1. Base idle canvas (master reference for all animations)
master_idle = place_canvas(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y)

# 2. Build aligned blink (closed eyes composited ONLY onto eye region of idle_src)
blink_aligned = Image.new('RGBA', idle_src.size, (0, 0, 0, 0))
blink_aligned.paste(blink_src, (int(round(284.3 - 283.6)), int(round(1137 - 1136))), blink_src)

# Precise eye mask on raw idle_src
eye_mask_raw = Image.new('L', idle_src.size, 0)
d_eye = ImageDraw.Draw(eye_mask_raw)
d_eye.ellipse([140, 420, 240, 530], fill=255) # left eye
d_eye.ellipse([310, 420, 410, 530], fill=255) # right eye
eye_mask_raw = eye_mask_raw.filter(ImageFilter.GaussianBlur(12))

pure_blink_raw = Image.composite(blink_aligned, idle_src, eye_mask_raw)
master_blink = place_canvas(pure_blink_raw, IDLE_FOOT_X, IDLE_FOOT_Y)

# 3. Build happy open-mouth smiling face composited onto idle_src
waving_aligned = Image.new('RGBA', idle_src.size, (0, 0, 0, 0))
waving_aligned.paste(waving_src, (int(round(284.3 - 375.5)), int(round(1137 - 1136))), waving_src)

mouth_mask_raw = Image.new('L', idle_src.size, 0)
d_mouth = ImageDraw.Draw(mouth_mask_raw)
d_mouth.ellipse([215, 475, 355, 620], fill=255)
mouth_mask_raw = mouth_mask_raw.filter(ImageFilter.GaussianBlur(8))

pure_happy_raw = Image.composite(waving_aligned, idle_src, mouth_mask_raw)
master_happy = place_canvas(pure_happy_raw, IDLE_FOOT_X, IDLE_FOOT_Y)

# Happy wink (happy smile + cute closed eyes)
pure_wink_raw = Image.composite(pure_blink_raw, pure_happy_raw, eye_mask_raw)
master_wink = place_canvas(pure_wink_raw, IDLE_FOOT_X, IDLE_FOOT_Y)

# ----------------- 1. IDLE (Single master frame, breathing handled via Reanimated container) -----------------
# We save 1 frame (or 4 identical frames for backwards compat)
for i in range(1, 15):
    master_idle.save(os.path.join(base_dir, 'idle', f'{i:02d}.png'))
print('Saved 14 idle frames (100% rock-solid anchor)')

# ----------------- 2. BLINK (6 frames: smooth eyelid closing & opening) -----------------
blink_weights = [0.0, 0.35, 0.80, 1.0, 0.50, 0.15]
for idx, w in enumerate(blink_weights):
    if w == 0.0:
        f = master_idle.copy()
    elif w == 1.0:
        f = master_blink.copy()
    else:
        f = Image.blend(master_idle, master_blink, w)
    f.save(os.path.join(base_dir, 'blink', f'{idx+1:02d}.png'))
print('Saved 6 blink frames (ZERO ear/body shift)')

# ----------------- 3. HAPPY (16 frames: joyful smile & wink on tap) -----------------
for idx in range(16):
    f_num = idx + 1
    if f_num == 1:
        f = master_idle.copy()
    elif f_num == 2:
        f = Image.blend(master_idle, master_happy, 0.4)
    elif f_num in (3, 4):
        f = master_happy.copy()
    elif f_num in (5, 6, 7):
        f = master_wink.copy() # joyful wink at the peak of the jump!
    elif f_num in (8, 9, 10):
        f = master_happy.copy()
    elif f_num in (11, 12):
        f = Image.blend(master_idle, master_happy, 0.6)
    elif f_num in (13, 14):
        f = Image.blend(master_idle, master_happy, 0.25)
    else:
        f = master_idle.copy()
    f.save(os.path.join(base_dir, 'happy', f'{f_num:02d}.png'))
print('Saved 16 happy frames (ZERO ghosting, joyful wink & smile)')

# ----------------- 4. SLEEP (12 frames: peaceful closed eyes) -----------------
for idx in range(1, 13):
    master_blink.save(os.path.join(base_dir, 'sleep', f'{idx:02d}.png'))
print('Saved 12 sleep frames')

# ----------------- 5. SAD (10 frames) -----------------
sad_canvas = place_canvas(idle_src, IDLE_FOOT_X, IDLE_FOOT_Y, offset_y=3)
for idx in range(1, 11):
    sad_canvas.save(os.path.join(base_dir, 'sad', f'{idx:02d}.png'))
print('Saved 10 sad frames')
