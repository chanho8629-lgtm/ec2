from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/portfolio/erd/bideo-erd-ggshop-style.png"
W, H = 1800, 1180

FONT_PATH = Path(r"C:\Windows\Fonts\malgun.ttf")
BOLD_PATH = Path(r"C:\Windows\Fonts\malgunbd.ttf")


def font(size: int, bold: bool = False):
    path = BOLD_PATH if bold else FONT_PATH
    return ImageFont.truetype(str(path), size)


img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

BLACK = "#191919"
BLUE = "#245B8F"
RED = "#D63B2C"
MUTED = "#657080"
HEADER = "#F3F5F7"


def box(x, y, w, title, rows, color=BLUE):
    header_h, row_h = 44, 29
    h = header_h + row_h * len(rows) + 16
    draw.rectangle((x, y, x + w, y + h), fill="white", outline=BLACK, width=2)
    draw.rectangle((x, y, x + w, y + header_h), fill=HEADER, outline=BLACK, width=2)
    draw.text((x + 14, y + 8), title, fill=BLACK, font=font(24, True))
    for i, row in enumerate(rows):
        yy = y + header_h + 10 + i * row_h
        draw.text((x + 18, yy), f"▷ {row}", fill=color, font=font(18))
    return {"x": x, "y": y, "w": w, "h": h}


def anchor(node, side):
    if side == "left":
        return node["x"], node["y"] + node["h"] // 2
    if side == "right":
        return node["x"] + node["w"], node["y"] + node["h"] // 2
    if side == "top":
        return node["x"] + node["w"] // 2, node["y"]
    return node["x"] + node["w"] // 2, node["y"] + node["h"]


def relation(start, end, label, via=None, label_pos=None):
    points = [start, *(via or []), end]
    draw.line(points, fill=BLACK, width=2, joint="curve")
    for point in (start, end):
        x, y = point
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=BLACK)
    if label:
        if label_pos is not None:
            tx, ty = label_pos
        else:
            longest = max(
                zip(points, points[1:]),
                key=lambda pair: abs(pair[1][0] - pair[0][0]) + abs(pair[1][1] - pair[0][1]),
            )
            (x1, y1), (x2, y2) = longest
            tx, ty = (x1 + x2) // 2, (y1 + y2) // 2
        label_font = font(14)
        left, top, right, bottom = draw.textbbox((tx, ty), label, font=label_font, anchor="mm")
        draw.rectangle((left - 5, top - 3, right + 5, bottom + 3), fill="white")
        draw.text((tx, ty), label, fill=MUTED, font=label_font, anchor="mm")


draw.rectangle((35, 35, W - 35, H - 35), outline=BLACK, width=3)
draw.text((70, 66), "BIDEO ERD / Data Model", fill=BLACK, font=font(38, True))
draw.text(
    (70, 115),
    "Domain tables and core relations · orthogonal connectors only",
    fill=MUTED,
    font=font(18),
)

member = box(80, 180, 300, "MEMBER", ["tbl_member", "tbl_oauth", "tbl_follow", "tbl_block", "tbl_badge"])
work = box(470, 180, 300, "WORK", ["tbl_work", "tbl_work_file", "tbl_work_tag", "tbl_work_view", "tbl_work_like"])
gallery = box(860, 180, 300, "GALLERY", ["tbl_gallery", "tbl_gallery_work", "tbl_gallery_tag", "tbl_gallery_like"])
contest = box(1250, 180, 300, "CONTEST", ["tbl_contest", "tbl_contest_tag", "tbl_contest_entry"])

message = box(80, 535, 300, "MESSAGE / NOTICE", ["tbl_message_room", "tbl_message", "tbl_notification", "tbl_notification_setting"])
auction = box(470, 535, 300, "AUCTION", ["tbl_auction", "tbl_bid", "tbl_auction_wishlist"])
order = box(860, 535, 300, "ORDER / PAYMENT", ["tbl_order", "tbl_payment", "tbl_settlement", "tbl_withdrawal_request"])
admin = box(1250, 535, 300, "ADMIN / OPS", ["tbl_report", "tbl_member_restriction", "tbl_inquiry", "tbl_faq"])

ai = box(470, 870, 690, "AI FEATURES", ["predicted_views", "popular_probability", "quality_score", "recommendation / auction RAG"], RED)
s3 = box(1250, 870, 300, "AWS S3", ["work media key", "gallery cover key", "profile / banner key"], RED)

# Horizontal relations
relation(anchor(member, "right"), anchor(work, "left"), "1:N")
relation(anchor(work, "right"), anchor(gallery, "left"), "N:M")
relation(anchor(gallery, "right"), anchor(contest, "left"), "entry")
relation(anchor(auction, "right"), anchor(order, "left"), "close/order")
relation(anchor(order, "right"), anchor(admin, "left"), "settle")

# Vertical relations
relation(anchor(member, "bottom"), anchor(message, "top"), "chat")
relation(anchor(work, "bottom"), anchor(auction, "top"), "listed")
relation(anchor(gallery, "bottom"), anchor(order, "top"), "payment")
relation(
    anchor(auction, "bottom"),
    (700, ai["y"]),
    "AI feature",
    [(620, 805), (700, 805)],
    (660, 805),
)
relation(
    anchor(gallery, "left"),
    (930, ai["y"]),
    "recommend",
    [(810, 268), (810, 830), (930, 830)],
    (870, 830),
)
relation(
    anchor(gallery, "right"),
    (1400, s3["y"]),
    "media / cover",
    [(1205, 268), (1205, 830), (1400, 830)],
    (1300, 830),
)

draw.text(
    (70, 1120),
    "Core relation: Member → Work → Gallery → Contest / Work → Auction → Order → Admin",
    fill=MUTED,
    font=font(17),
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUTPUT, quality=95)
print(OUTPUT)
