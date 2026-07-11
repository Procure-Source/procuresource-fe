from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math
import random


OUT_DIR = Path("public/assets/product")
SIZE = (1000, 780)


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient(size, top, bottom):
    width, height = size
    image = Image.new("RGB", size, top)
    pixels = image.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        for x in range(width):
            pixels[x, y] = color
    return image.convert("RGBA")


def add_noise(image, opacity=18):
    random.seed(2605)
    width, height = image.size
    noise = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(noise)
    for _ in range(width * height // 180):
        x = random.randrange(width)
        y = random.randrange(height)
        value = random.randrange(180, 255)
        draw.point((x, y), fill=(value, value, value, opacity))
    return Image.alpha_composite(image, noise)


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def save_card(name, image):
    image = add_noise(image, 12).convert("RGB")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUT_DIR / name, quality=92, optimize=True)


def card_parse():
    image = gradient(SIZE, (232, 238, 235), (30, 74, 94))
    draw = ImageDraw.Draw(image, "RGBA")

    for i in range(18):
      y = 76 + i * 34
      draw.line((90, y, 900, y - 46), fill=(255, 255, 255, 22), width=2)

    paper = Image.new("RGBA", (520, 560), (249, 248, 240, 238))
    pdraw = ImageDraw.Draw(paper, "RGBA")
    pdraw.rounded_rectangle((0, 0, 520, 560), radius=28, fill=(249, 248, 240, 238))
    for i in range(11):
        y = 92 + i * 35
        pdraw.rounded_rectangle((62, y, 430 - i * 7, y + 12), radius=6, fill=(42, 54, 61, 115))
    pdraw.rounded_rectangle((62, 44, 310, 68), radius=10, fill=(0, 102, 204, 190))
    paper = paper.rotate(-8, resample=Image.Resampling.BICUBIC, expand=True)
    image.alpha_composite(paper, (64, 110))

    for i in range(4):
        x = 560
        y = 172 + i * 86
        draw.rounded_rectangle((x, y, 902, y + 52), radius=16, fill=(4, 13, 26, 170), outline=(149, 211, 255, 96), width=2)
        draw.ellipse((x + 22, y + 16, x + 42, y + 36), fill=(75, 190, 255, 220))
        draw.rounded_rectangle((x + 58, y + 15, x + 282 - i * 18, y + 29), radius=7, fill=(237, 248, 255, 185))
        draw.rounded_rectangle((x + 58, y + 34, x + 205, y + 42), radius=4, fill=(237, 248, 255, 82))

    draw.line((446, 340, 565, 265), fill=(80, 196, 255, 180), width=7)
    draw.line((440, 384, 565, 352), fill=(80, 196, 255, 120), width=5)
    draw.line((436, 430, 565, 438), fill=(80, 196, 255, 95), width=4)
    save_card("method-01-boq-parse.png", image)


def card_link():
    image = gradient(SIZE, (10, 26, 43), (29, 110, 141))
    draw = ImageDraw.Draw(image, "RGBA")

    for radius, alpha in [(320, 28), (236, 42), (150, 64)]:
        draw.ellipse((500 - radius, 390 - radius, 500 + radius, 390 + radius), outline=(150, 226, 255, alpha), width=3)

    nodes = [(500, 390), (256, 210), (738, 214), (255, 570), (744, 560), (500, 150)]
    for a in nodes[1:]:
        draw.line((500, 390, a[0], a[1]), fill=(201, 236, 246, 75), width=5)

    for idx, (x, y) in enumerate(nodes):
        r = 62 if idx == 0 else 42
        fill = (242, 248, 247, 235) if idx == 0 else (6, 19, 32, 210)
        outline = (255, 255, 255, 90)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill, outline=outline, width=2)
        if idx == 0:
            draw.rounded_rectangle((x - 30, y - 6, x + 30, y + 10), radius=7, fill=(0, 102, 204, 210))
            draw.arc((x - 24, y - 34, x + 24, y + 14), 205, 335, fill=(0, 102, 204, 210), width=8)
        else:
            draw.rounded_rectangle((x - 21, y - 10, x + 21, y + 8), radius=5, fill=(143, 218, 255, 170))
            draw.ellipse((x - 8, y - 30, x + 8, y - 14), fill=(143, 218, 255, 170))

    draw.rounded_rectangle((290, 642, 710, 698), radius=18, fill=(246, 248, 242, 218))
    draw.text((330, 660), "RFQ LINK / SUPPLIER ENTRY", fill=(5, 17, 28, 210))
    save_card("method-02-rfq-link.png", image)


def card_compare():
    image = gradient(SIZE, (237, 239, 229), (118, 132, 120))
    draw = ImageDraw.Draw(image, "RGBA")

    draw.rounded_rectangle((112, 95, 888, 642), radius=28, fill=(250, 249, 242, 222), outline=(34, 44, 48, 42), width=2)
    for i, label_width in enumerate([250, 210, 285, 180]):
        y = 158 + i * 105
        draw.rounded_rectangle((160, y, 842, y + 68), radius=16, fill=(255, 255, 255, 195))
        draw.rounded_rectangle((188, y + 22, 188 + label_width, y + 38), radius=8, fill=(22, 32, 38, 128))
        bar_x = 542
        colors = [(0, 102, 204, 210), (35, 197, 94, 185), (235, 178, 73, 180)]
        for j, width in enumerate([160 - i * 8, 110 + i * 13, 72 + i * 18]):
            draw.rounded_rectangle((bar_x, y + 14 + j * 15, bar_x + width, y + 24 + j * 15), radius=5, fill=colors[j])
        draw.ellipse((792, y + 22, 816, y + 46), fill=(0, 102, 204, 185) if i == 1 else (24, 35, 42, 80))

    for x in [226, 416, 606, 794]:
        draw.line((x, 118, x, 616), fill=(14, 29, 35, 22), width=2)

    draw.rounded_rectangle((180, 680, 820, 720), radius=16, fill=(4, 18, 30, 160))
    draw.text((250, 693), "NORMALIZED PRICE / LEAD TIME / COMPLIANCE", fill=(246, 248, 242, 220))
    save_card("method-03-compare.png", image)


def card_award():
    image = gradient(SIZE, (9, 22, 31), (12, 79, 82))
    draw = ImageDraw.Draw(image, "RGBA")

    for i in range(13):
        angle = i / 13 * math.tau
        x = 500 + math.cos(angle) * 270
        y = 372 + math.sin(angle) * 220
        draw.line((500, 372, x, y), fill=(154, 218, 221, 28), width=2)

    draw.ellipse((348, 214, 652, 518), fill=(246, 248, 242, 235), outline=(154, 218, 221, 120), width=4)
    draw.ellipse((394, 260, 606, 472), fill=(7, 28, 42, 230))
    draw.line((438, 370, 486, 418), fill=(112, 232, 164, 240), width=18)
    draw.line((486, 418, 574, 310), fill=(112, 232, 164, 240), width=18)

    for i, (x, y) in enumerate([(118, 150), (704, 142), (136, 568), (694, 572)]):
        draw.rounded_rectangle((x, y, x + 210, y + 92), radius=18, fill=(255, 255, 255, 38), outline=(255, 255, 255, 58), width=2)
        draw.rounded_rectangle((x + 24, y + 22, x + 152 - i * 18, y + 34), radius=6, fill=(246, 248, 242, 145))
        draw.rounded_rectangle((x + 24, y + 52, x + 174, y + 62), radius=5, fill=(246, 248, 242, 70))

    draw.rounded_rectangle((280, 650, 720, 704), radius=20, fill=(246, 248, 242, 220))
    draw.text((362, 667), "AWARD / EXPORT / RECORD", fill=(5, 17, 28, 220))
    save_card("method-04-award-export.png", image)


def feature_cube():
    image = gradient(SIZE, (246, 247, 244), (213, 218, 219))
    draw = ImageDraw.Draw(image, "RGBA")
    for offset in range(0, 18):
        alpha = 38 - offset
        draw.rounded_rectangle((248 + offset, 186 + offset, 752 - offset, 596 - offset), radius=30, outline=(255, 255, 255, alpha), width=2)
    draw.rounded_rectangle((244, 196, 756, 590), radius=36, fill=(255, 255, 255, 88), outline=(20, 34, 45, 28), width=2)
    for row in range(4):
        for col in range(4):
            x = 308 + col * 96
            y = 260 + row * 64
            draw.rounded_rectangle((x, y, x + 72, y + 44), radius=12, fill=(255, 255, 255, 105), outline=(20, 34, 45, 24), width=1)
            draw.rounded_rectangle((x + 15, y + 16, x + 57, y + 24), radius=4, fill=(0, 102, 204, 120))
    draw.rounded_rectangle((398, 414, 602, 482), radius=22, fill=(4, 17, 28, 192))
    draw.text((434, 438), "AI BOQ", fill=(246, 248, 242, 235))
    save_card("feature-ai-boq-agent.png", image)


def feature_feed():
    image = gradient(SIZE, (240, 243, 244), (204, 212, 219))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((150, 128, 850, 650), radius=36, fill=(255, 255, 255, 150), outline=(17, 30, 44, 28), width=2)
    cards = [
        (208, 190, "RFQ RAISED", (0, 102, 204, 210)),
        (208, 318, "QUOTE DUE", (245, 158, 11, 210)),
        (208, 446, "AWARD UPDATE", (35, 197, 94, 210)),
    ]
    for x, y, label, color in cards:
        draw.rounded_rectangle((x, y, 792, y + 90), radius=24, fill=(250, 251, 252, 210), outline=(17, 30, 44, 28), width=1)
        draw.ellipse((x + 28, y + 25, x + 68, y + 65), fill=color)
        draw.rounded_rectangle((x + 92, y + 22, x + 260, y + 38), radius=8, fill=(20, 34, 45, 136))
        draw.rounded_rectangle((x + 92, y + 52, x + 474, y + 64), radius=6, fill=(20, 34, 45, 48))
        draw.text((x + 530, y + 35), label, fill=(17, 30, 44, 150))
    save_card("feature-supplier-feed.png", image)


def feature_monitor():
    image = gradient(SIZE, (238, 240, 236), (211, 215, 210))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((174, 122, 826, 662), radius=30, fill=(255, 255, 255, 172), outline=(32, 40, 44, 34), width=2)
    draw.text((224, 178), "Verification Monitor", fill=(17, 30, 44, 180))
    rows = [
        ("AHRI 550/590", "Confirmed", (35, 197, 94, 210)),
        ("Trade license", "Received", (0, 102, 204, 210)),
        ("Agent letter", "Pending", (245, 158, 11, 210)),
        ("VAT certificate", "Confirmed", (35, 197, 94, 210)),
        ("Lead-time history", "Learning", (0, 102, 204, 160)),
    ]
    for i, (name, status, color) in enumerate(rows):
        y = 242 + i * 72
        draw.rounded_rectangle((218, y, 782, y + 48), radius=14, fill=(247, 248, 246, 225), outline=(17, 30, 44, 25), width=1)
        draw.ellipse((240, y + 15, 258, y + 33), fill=color)
        draw.text((280, y + 15), name, fill=(17, 30, 44, 170))
        draw.text((612, y + 15), status, fill=(17, 30, 44, 150))
    save_card("feature-verification-monitor.png", image)


def feature_award_list():
    image = gradient(SIZE, (246, 247, 244), (220, 223, 224))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle((128, 118, 872, 660), radius=34, fill=(255, 255, 255, 160), outline=(17, 30, 44, 26), width=2)
    draw.rounded_rectangle((188, 176, 812, 228), radius=18, fill=(4, 17, 28, 190))
    draw.text((228, 194), "Award Justification Draft", fill=(246, 248, 242, 230))
    for i in range(6):
        y = 284 + i * 54
        draw.rounded_rectangle((194, y, 806, y + 34), radius=12, fill=(249, 250, 248, 218))
        color = (35, 197, 94, 200) if i in [0, 2, 4] else (0, 102, 204, 170)
        draw.ellipse((214, y + 9, 230, y + 25), fill=color)
        draw.rounded_rectangle((252, y + 10, 580 + i * 24, y + 21), radius=5, fill=(20, 34, 45, 68))
    draw.rounded_rectangle((286, 590, 714, 628), radius=16, fill=(0, 102, 204, 190))
    draw.text((380, 602), "EXPORT RECORD", fill=(255, 255, 255, 225))
    save_card("feature-award-justification.png", image)


def vision_ops():
    image = gradient((1400, 720), (226, 229, 224), (196, 204, 204))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle((0, 470, 1400, 720), fill=(206, 199, 190, 125))
    for x in range(130, 1300, 210):
        draw.rounded_rectangle((x, 210, x + 150, 540), radius=18, fill=(250, 248, 241, 190), outline=(20, 34, 45, 35), width=1)
        draw.rectangle((x + 14, 430, x + 136, 448), fill=(4, 17, 28, 95))
    draw.rounded_rectangle((120, 465, 1280, 555), radius=28, fill=(36, 43, 48, 150))
    for x in range(190, 1210, 170):
        draw.rounded_rectangle((x, 492, x + 120, 520), radius=10, fill=(252, 250, 244, 130))
    for x in [270, 575, 880, 1185]:
        draw.line((x, 0, x, 210), fill=(36, 43, 48, 80), width=4)
        draw.ellipse((x - 22, 200, x + 22, 244), fill=(246, 248, 242, 170))
    save_card("vision-procurement-ops.png", image)


if __name__ == "__main__":
    card_parse()
    card_link()
    card_compare()
    card_award()
    feature_cube()
    feature_feed()
    feature_monitor()
    feature_award_list()
    vision_ops()
