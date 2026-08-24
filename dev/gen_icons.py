# -*- coding: utf-8 -*-
"""生成 PWA 应用图标（192 / 512 / 苹果 180），输出到 assets/icons/。"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')
os.makedirs(OUT, exist_ok=True)


def make_icon(size):
    ss = 4
    S = size * ss
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 浅绿 → 浅蓝 渐变圆角底
    top = (93, 155, 130)
    bottom = (111, 159, 192)
    for y in range(S):
        t = y / max(1, S - 1)
        col = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,)
        d.line([(0, y), (S, y)], fill=col)
    mask = Image.new('L', (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=255)
    img.putalpha(mask)

    # 白色翻开的书本
    w = int(S * 0.56)
    h = int(S * 0.42)
    x0 = (S - w) // 2
    y0 = int(S * 0.28)
    d.rounded_rectangle([x0, y0, x0 + w // 2 - 1, y0 + h], radius=int(S * 0.035), fill=(255, 255, 255, 255))
    d.rounded_rectangle([x0 + w // 2 + 1, y0, x0 + w, y0 + h], radius=int(S * 0.035), fill=(255, 255, 255, 255))
    d.rectangle([x0 + w // 2 - 1, y0, x0 + w // 2 + 1, y0 + h], fill=(255, 255, 255, 255))
    line = (93, 155, 130, 95)
    for i in range(3):
        ly = y0 + int(h * 0.28) + i * int(h * 0.18)
        d.rectangle([x0 + int(w * 0.13), ly, x0 + w // 2 - int(w * 0.13), ly + max(1, int(S * 0.012))], fill=line)
        d.rectangle([x0 + w // 2 + int(w * 0.13), ly, x0 + w - int(w * 0.13), ly + max(1, int(S * 0.012))], fill=line)

    return img.resize((size, size), Image.LANCZOS)


for s in (192, 512):
    make_icon(s).save(os.path.join(OUT, f'icon-{s}.png'))
make_icon(180).save(os.path.join(OUT, 'apple-touch-icon.png'))
print('icons:', sorted(os.listdir(OUT)))
