from __future__ import annotations

import csv
import os
import shutil
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "brand-kit"
ASSET_ROOT = OUT / "TipHub-Brand-Assets"
TMP = ROOT / "tmp" / "brand-kit"
PYDEPS = ROOT / "tmp" / "pydeps"
sys.path.insert(0, str(PYDEPS))

from fontTools.ttLib import TTFont as FontToolsTTFont
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

TMP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

W, H = landscape(A4)

CHALK = HexColor("#F2EBDD")
CARBON = HexColor("#121715")
TEAL = HexColor("#124A46")
DEEP_TEAL = HexColor("#0D3734")
ORANGE = HexColor("#F05A32")
ORANGE_DARK = HexColor("#D94725")
PAPER = HexColor("#DED6C6")
MIST = HexColor("#B9CCC4")
SOFT_INK = HexColor("#2E3B37")
WARM_WHITE = HexColor("#FFFDF9")
RULE = Color(18 / 255, 23 / 255, 21 / 255, alpha=0.20)
RULE_LIGHT = Color(242 / 255, 235 / 255, 221 / 255, alpha=0.25)

FONT_SOURCE = {
    "Instrument": ROOT / "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
    "InstrumentItalic": ROOT / "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
    "DMSans": ROOT / "node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
    "DMSansMedium": ROOT / "node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2",
    "DMSansSemi": ROOT / "node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
    "IBMPlexMono": ROOT / "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
}


def convert_font(name: str, src: Path) -> Path:
    dest = TMP / f"{name}.ttf"
    if not dest.exists():
        font = FontToolsTTFont(str(src))
        font.flavor = None
        font.save(str(dest))
    return dest


FONT_FILES = {name: convert_font(name, src) for name, src in FONT_SOURCE.items()}
for name, path in FONT_FILES.items():
    pdfmetrics.registerFont(TTFont(name, str(path)))


def pil_font(name: str, size: int):
    return ImageFont.truetype(str(FONT_FILES[name]), size=size)


def hex_rgb(value: str):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def wrap_lines(text: str, width: int):
    return textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False)


def draw_text_block(
    c,
    text,
    x,
    y,
    width_chars=48,
    font="DMSans",
    size=12,
    color=CARBON,
    leading=None,
    max_lines=None,
):
    leading = leading or size * 1.35
    lines = wrap_lines(text, width_chars)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_bullets(c, items, x, y, width_chars=48, size=10.5, color=CARBON, leading=15):
    for item in items:
        c.setFillColor(ORANGE)
        c.circle(x + 2, y + 3, 2, fill=1, stroke=0)
        y = draw_text_block(
            c,
            item,
            x + 13,
            y,
            width_chars=width_chars,
            size=size,
            color=color,
            leading=leading,
        )
        y -= 5
    return y


def draw_image_cover(c, path: Path, x, y, w, h, opacity=1.0):
    im = Image.open(path)
    iw, ih = im.size
    scale = max(w / iw, h / ih)
    crop_w = int(w / scale)
    crop_h = int(h / scale)
    left = max(0, (iw - crop_w) // 2)
    top = max(0, (ih - crop_h) // 2)
    cropped = im.crop((left, top, left + crop_w, top + crop_h)).resize(
        (max(1, int(w * 2)), max(1, int(h * 2))),
        Image.Resampling.LANCZOS,
    )
    temp = TMP / f"crop-{abs(hash((str(path), x, y, w, h))) % 10**9}.png"
    cropped.save(temp)
    c.saveState()
    c.setFillAlpha(opacity)
    c.drawImage(str(temp), x, y, width=w, height=h, mask="auto")
    c.restoreState()


def draw_logo(c, variant="primary", x=58, y=500, width=160):
    if variant == "symbol":
        path = ASSET_ROOT / "01-Logos/TipHub-Symbol-Full-Color-512px.png"
        h = width
    elif variant == "reversed":
        path = ASSET_ROOT / "01-Logos/TipHub-Logo-Primary-Reversed-Chalk-600px.png"
        h = width * 190 / 495
    elif variant == "mono":
        path = ASSET_ROOT / "01-Logos/TipHub-Logo-Primary-Monochrome-Carbon-600px.png"
        h = width * 190 / 495
    else:
        path = ASSET_ROOT / "01-Logos/TipHub-Logo-Primary-Full-Color-600px.png"
        h = width * 190 / 495
    c.drawImage(str(path), x, y, width=width, height=h, mask="auto")
    return h


def page_header(c, section, number, dark=False):
    color = CHALK if dark else TEAL
    c.setFillColor(color)
    c.setFont("IBMPlexMono", 8.5)
    c.drawString(40, H - 30, f"{number:02d} / {section.upper()}")
    c.setStrokeColor(ORANGE)
    c.setLineWidth(1.3)
    c.line(40, H - 39, 86, H - 39)


def page_footer(c, page_no, dark=False):
    color = CHALK if dark else CARBON
    c.setStrokeColor(RULE_LIGHT if dark else RULE)
    c.setLineWidth(0.6)
    c.line(40, 28, W - 40, 28)
    c.setFont("IBMPlexMono", 6.8)
    c.setFillColor(color)
    c.drawString(40, 15, "TIPHUB BRAND IDENTITY AND DIGITAL GUIDELINES / V1.0 / 31 JUL 2026")
    c.drawRightString(W - 40, 15, f"{page_no:02d}")


def new_page(c, section, number, bg=CHALK, dark=False):
    c.setFillColor(bg)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    page_header(c, section, number, dark=dark)
    page_footer(c, number, dark=dark)


def title(c, text, x, y, size=45, color=CARBON, width_chars=28, italic=False):
    font = "InstrumentItalic" if italic else "Instrument"
    c.setFillColor(color)
    c.setFont(font, size)
    leading = size * 0.92
    for line in wrap_lines(text, width_chars):
        c.drawString(x, y, line)
        y -= leading
    return y


def mono_label(c, text, x, y, color=TEAL, size=7.5):
    c.setFillColor(color)
    c.setFont("IBMPlexMono", size)
    c.drawString(x, y, text.upper())


def stat(c, label, value, x, y, dark=False):
    mono_label(c, label, x, y, CHALK if dark else TEAL)
    c.setFont("DMSansMedium", 14)
    c.setFillColor(CHALK if dark else CARBON)
    c.drawString(x, y - 22, value)


def create_supporting_assets():
    fav_dir = ASSET_ROOT / "02-Favicon-App-Icons"
    icon = Image.open(fav_dir / "TipHub-Favicon-512x512.png").convert("RGBA")
    icon.save(
        fav_dir / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )

    color_dir = ASSET_ROOT / "03-Color"
    type_dir = ASSET_ROOT / "04-Typography"
    iconography_dir = ASSET_ROOT / "05-Iconography"
    graphic_dir = ASSET_ROOT / "07-Graphic-Devices"
    ui_dir = ASSET_ROOT / "08-UI-Patterns"
    social_dir = ASSET_ROOT / "09-Social-Presentation"
    governance_dir = ASSET_ROOT / "10-Governance-Licenses"
    for directory in [
        color_dir,
        type_dir,
        iconography_dir,
        graphic_dir,
        ui_dir,
        social_dir,
        governance_dir,
    ]:
        directory.mkdir(parents=True, exist_ok=True)

    palette = [
        ("Chalk", "#F2EBDD", "Primary canvas"),
        ("Carbon", "#121715", "Primary ink"),
        ("Mineral Teal", "#124A46", "Core brand"),
        ("Deep Teal", "#0D3734", "Depth"),
        ("Signal Orange", "#F05A32", "Action"),
        ("Dark Orange", "#D94725", "Fold shadow"),
        ("Paper", "#DED6C6", "Neutral panel"),
        ("Mist", "#B9CCC4", "Cool field"),
        ("Soft Ink", "#2E3B37", "Secondary copy"),
    ]
    sw = Image.new("RGB", (1800, 1000), hex_rgb("#F2EBDD"))
    d = ImageDraw.Draw(sw)
    for i, (name, value, role) in enumerate(palette):
        col = i % 3
        row = i // 3
        x, y = 90 + col * 570, 90 + row * 300
        d.rounded_rectangle((x, y, x + 500, y + 210), radius=12, fill=hex_rgb(value))
        text_color = "#F2EBDD" if name in {"Carbon", "Mineral Teal", "Deep Teal", "Soft Ink"} else "#121715"
        d.text((x + 30, y + 28), name, font=pil_font("DMSansSemi", 30), fill=hex_rgb(text_color))
        d.text((x + 30, y + 78), value, font=pil_font("IBMPlexMono", 25), fill=hex_rgb(text_color))
        d.text((x + 30, y + 140), role, font=pil_font("DMSans", 24), fill=hex_rgb(text_color))
    sw.save(color_dir / "TipHub-Color-Swatch-Sheet.png")

    with open(color_dir / "TipHub-Color-Specifications.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Token", "HEX", "RGB", "Primary role"])
        for name, value, role in palette:
            writer.writerow([name, value, ", ".join(map(str, hex_rgb(value))), role])

    type_img = Image.new("RGB", (1800, 1100), hex_rgb("#F2EBDD"))
    d = ImageDraw.Draw(type_img)
    d.text((100, 100), "Opportunity has a geography.", font=pil_font("Instrument", 105), fill=hex_rgb("#121715"))
    d.text((100, 230), "Ambition does not.", font=pil_font("InstrumentItalic", 105), fill=hex_rgb("#F05A32"))
    d.text((100, 430), "DM Sans builds clarity across interfaces and operational copy.", font=pil_font("DMSans", 46), fill=hex_rgb("#121715"))
    d.text((100, 545), "DM Sans Medium / NAVIGATION  BUTTONS  LABELS", font=pil_font("DMSansMedium", 36), fill=hex_rgb("#124A46"))
    d.text((100, 700), "01 / FIELD NOTE / 25 N 07 E / GLOBAL", font=pil_font("IBMPlexMono", 35), fill=hex_rgb("#124A46"))
    d.line((100, 790, 1700, 790), fill=hex_rgb("#F05A32"), width=4)
    d.text((100, 850), "Instrument Serif + DM Sans + IBM Plex Mono", font=pil_font("DMSansSemi", 35), fill=hex_rgb("#121715"))
    type_img.save(type_dir / "TipHub-Typography-Specimen.png")

    with open(type_dir / "TipHub-Typography-Specifications.txt", "w") as f:
        f.write(
            "TipHub typography system\n\n"
            "Instrument Serif 400 / 400 Italic - editorial display and rhetorical emphasis.\n"
            "DM Sans 400 / 500 / 600 - body copy, navigation, buttons, and operational content.\n"
            "IBM Plex Mono 400 - metadata, coordinates, numbering, and system labels.\n\n"
            "Web scale:\n"
            "H1 66-92 px, line-height 0.92, tracking -0.035em.\n"
            "H2 48-72 px, line-height 0.95, tracking -0.028em.\n"
            "H3 30 px, line-height 1.0.\n"
            "Body 14-17 px, line-height 1.46.\n"
            "Metadata 7-11 px, uppercase, tracking 0.105em.\n"
        )

    for package, dest_name in [
        ("instrument-serif", "OFL-Instrument-Serif.txt"),
        ("dm-sans", "OFL-DM-Sans.txt"),
        ("ibm-plex-mono", "OFL-IBM-Plex-Mono.txt"),
    ]:
        shutil.copyfile(
            ROOT / f"node_modules/@fontsource/{package}/LICENSE",
            governance_dir / dest_name,
        )

    shutil.copyfile(
        ROOT / "outputs/TipHub-Interaction-Motion-Spec-v1.md",
        ui_dir / "TipHub-Interaction-Motion-Spec.md",
    )
    shutil.copyfile(
        ROOT / "outputs/TipHub-Content-Checklist.md",
        governance_dir / "TipHub-Content-Approval-Checklist.md",
    )

    (iconography_dir / "TipHub-Iconography-Guide.txt").write_text(
        "Use Phosphor outline icons only. Keep one icon family per interface.\n"
        "Core actions: ArrowRight, ArrowUpRight, Plus, Minus, X, List, Grid, Search, LinkedIn.\n"
        "Use 1.5-2 px optical stroke at 20-24 px. Icons inherit text color.\n"
        "Hover motion: 2-6 px directional translation over 160-220 ms.\n"
        "Never use emoji, filled system glyphs, mixed corner styles, or icons without accessible labels.\n"
    )
    (graphic_dir / "TipHub-Graphic-Language.txt").write_text(
        "Living Atlas system: tactile paper relief, contour lines, routes, markers, coordinates, thin rules, and controlled asymmetry.\n"
        "Use Signal Orange for active markers, Mineral Teal for institutional surfaces, and Chalk for field space.\n"
        "Keep at least 40 percent quiet space. Avoid literal stock maps, dense decoration, gradients, and generic SaaS blobs.\n"
    )

    logo_png = Image.open(ASSET_ROOT / "01-Logos/TipHub-Logo-Primary-Full-Color-600px.png").convert("RGBA")
    hero = Image.open(ROOT / "public/assets/tiphub-hero-background.png").convert("RGB")

    def make_template(size, filename, title_text, subtitle):
        tw, th = size
        canvas_img = Image.new("RGB", size, hex_rgb("#F2EBDD"))
        crop_ratio = tw / th
        hr = hero.width / hero.height
        if hr > crop_ratio:
            crop_w = int(hero.height * crop_ratio)
            left = (hero.width - crop_w) // 2
            crop = hero.crop((left, 0, left + crop_w, hero.height))
        else:
            crop_h = int(hero.width / crop_ratio)
            top = (hero.height - crop_h) // 2
            crop = hero.crop((0, top, hero.width, top + crop_h))
        crop = crop.resize(size, Image.Resampling.LANCZOS)
        canvas_img.paste(crop)
        overlay = Image.new("RGBA", size, (242, 235, 221, 175))
        canvas_img = Image.alpha_composite(canvas_img.convert("RGBA"), overlay)
        d = ImageDraw.Draw(canvas_img)
        logo_w = int(tw * 0.23)
        logo_h = int(logo_w * logo_png.height / logo_png.width)
        logo_resized = logo_png.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        canvas_img.alpha_composite(logo_resized, (int(tw * 0.06), int(th * 0.08)))
        d.text(
            (int(tw * 0.06), int(th * 0.39)),
            title_text,
            font=pil_font("Instrument", int(th * 0.105)),
            fill=hex_rgb("#121715"),
        )
        d.text(
            (int(tw * 0.06), int(th * 0.56)),
            subtitle,
            font=pil_font("InstrumentItalic", int(th * 0.075)),
            fill=hex_rgb("#F05A32"),
        )
        d.rectangle((0, th - int(th * 0.045), tw, th), fill=hex_rgb("#F05A32"))
        canvas_img.convert("RGB").save(social_dir / filename, quality=95)

    make_template((1200, 630), "TipHub-Social-OG-1200x630.png", "Opportunity has a geography.", "Ambition does not.")
    make_template((1920, 1080), "TipHub-Presentation-Cover-1920x1080.png", "Opportunity has a geography.", "Ambition does not.")

    readme = f"""# TipHub Complete Brand Kit v1.0

Prepared 31 July 2026.

## Package contents

- 01-Logos: approved full-color masters, monochrome and reversed derivations, PNG exports.
- 02-Favicon-App-Icons: favicon SVG, PNG sizes, Apple/Android icons, ICO.
- 03-Color: swatch sheet and machine-readable specifications.
- 04-Typography: specimen and web typography specification.
- 05-Iconography: approved icon family and use rules.
- 06-Photography-Imagery: approved website visual assets.
- 07-Graphic-Devices: Living Atlas construction guidance.
- 08-UI-Patterns: interaction and motion specification.
- 09-Social-Presentation: social share and deck-cover templates.
- 10-Governance-Licenses: font licenses and approval checklist.

## Source of truth

Public website: https://tiphub-prototype-review.vercel.app/
Website content: src/data.js and src/content/fallbackContent.js

## Important status notes

- The logo, color, type, motion, and graphic system are confirmed from the production source.
- Team portraits and biographies remain provisional placeholders until owner approval.
- The office model is Global - meetings by appointment; no street address is claimed.
- Portfolio display, fund claims, legal entity data, and image rights require owner/legal approval before final public launch.
"""
    (OUT / "README.md").write_text(readme)


def build_pdf():
    pdf_path = OUT / "TipHub-Brand-Guidelines-v1.0.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=(W, H))
    c.setTitle("TipHub Brand Identity and Digital Guidelines v1.0")
    c.setAuthor("TipHub")

    # 01 Cover
    c.setFillColor(CHALK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_image_cover(c, ROOT / "public/assets/tiphub-hero-background.png", W * 0.52, 0, W * 0.48, H)
    c.setFillColor(Color(242 / 255, 235 / 255, 221 / 255, alpha=0.84))
    c.rect(W * 0.52, 0, W * 0.48, H, fill=1, stroke=0)
    draw_logo(c, x=55, y=H - 110, width=180)
    title(c, "Brand identity and digital guidelines", 55, H - 200, size=49, width_chars=21)
    c.setFillColor(ORANGE)
    c.setFont("InstrumentItalic", 30)
    c.drawString(55, 173, "Opportunity has a geography.")
    c.drawString(55, 138, "Ambition does not.")
    mono_label(c, "VERSION 1.0 / 31 JULY 2026", 55, 64, TEAL, 8.5)
    c.setFillColor(ORANGE)
    c.rect(0, 0, W, 16, fill=1, stroke=0)
    c.showPage()

    # 02 Contents
    new_page(c, "Contents", 2)
    title(c, "A living atlas for a global investment platform.", 45, H - 95, 42, width_chars=31)
    items = [
        ("01", "Brand foundation", "Essence, positioning, audience, messaging, voice"),
        ("02", "Identity system", "Logo, clear space, color, typography"),
        ("03", "Expression", "Graphic language, imagery, iconography, layout"),
        ("04", "Digital behavior", "Components, states, motion, accessibility"),
        ("05", "Applications", "Website, editorial, social, presentation"),
        ("06", "Governance", "Approval status, asset index, maintenance"),
    ]
    y = 350
    for idx, heading, desc in items:
        c.setStrokeColor(RULE)
        c.line(45, y + 34, W - 45, y + 34)
        c.setFont("Instrument", 30)
        c.setFillColor(ORANGE)
        c.drawString(45, y, idx)
        c.setFillColor(CARBON)
        c.drawString(110, y, heading)
        c.setFont("DMSans", 10.5)
        c.drawString(430, y + 3, desc)
        y -= 60
    c.showPage()

    # 03 Essence
    new_page(c, "Brand foundation", 3, bg=TEAL, dark=True)
    title(c, "Opportunity has a geography.", 48, H - 102, 52, CHALK, width_chars=26)
    title(c, "Ambition does not.", 48, H - 210, 52, ORANGE, width_chars=26, italic=True)
    draw_text_block(
        c,
        "TipHub is a global early-stage venture and company-building platform for founders creating essential companies from overlooked insight, connected markets, and lived expertise.",
        440,
        H - 125,
        48,
        size=13,
        color=CHALK,
        leading=18,
    )
    c.setStrokeColor(RULE_LIGHT)
    c.line(440, H - 250, W - 48, H - 250)
    stat(c, "BRAND PROMISE", "Back the uncommon before it becomes obvious.", 440, H - 285, True)
    stat(c, "STAGE", "Pre-seed + Seed", 440, H - 360, True)
    stat(c, "SCOPE", "Worldwide", 620, H - 360, True)
    stat(c, "FUND", "$500K", 440, H - 430, True)
    stat(c, "OFFICE MODEL", "Global / by appointment", 620, H - 430, True)
    c.showPage()

    # 04 Positioning
    new_page(c, "Positioning and audience", 4)
    title(c, "For founders building where others scroll past.", 45, H - 95, 44, width_chars=30)
    audiences = [
        ("PRIMARY", "Pre-seed and seed founders", "Globally ambitious builders working in overlooked, fragmented, or emerging categories."),
        ("SECONDARY", "Operators and ecosystem partners", "Co-investors, market experts, talent, corporate partners, and future collaborators."),
        ("INSTITUTIONAL", "Future LP and stakeholder audience", "Readers who need clarity, credible process, careful governance, and evidence."),
    ]
    x_positions = [45, 310, 575]
    for x, (label, heading, desc) in zip(x_positions, audiences):
        c.setFillColor([WARM_WHITE, MIST, PAPER][x_positions.index(x)])
        c.roundRect(x, 120, 220, 270, 8, fill=1, stroke=0)
        mono_label(c, label, x + 22, 355)
        c.setFont("Instrument", 25)
        c.setFillColor(CARBON)
        c.drawString(x + 22, 310, heading.split(" and ")[0])
        if " and " in heading:
            c.drawString(x + 22, 282, "and " + heading.split(" and ")[1])
        draw_text_block(c, desc, x + 22, 235, 30, size=10.5, leading=15)
    c.showPage()

    # 05 Messaging
    new_page(c, "Messaging architecture", 5, bg=ORANGE)
    title(c, "One message. Four layers of proof.", 45, H - 95, 46, width_chars=26)
    levels = [
        ("01 / MASTER", "Opportunity has a geography. Ambition does not."),
        ("02 / THESIS", "We back the uncommon before it becomes obvious."),
        ("03 / FOUNDER VALUE", "Capital, craft, and connections for the company you are building now."),
        ("04 / ACTION", "Pitch TipHub. Explore companies. Read field notes."),
    ]
    y = 355
    for label, message in levels:
        mono_label(c, label, 50, y + 9, CARBON)
        c.setFont("Instrument", 26 if "MASTER" not in label else 31)
        c.setFillColor(CARBON)
        c.drawString(210, y, message)
        c.setStrokeColor(Color(18 / 255, 23 / 255, 21 / 255, alpha=0.25))
        c.line(50, y - 27, W - 50, y - 27)
        y -= 78
    c.showPage()

    # 06 Voice
    new_page(c, "Voice and tone", 6)
    title(c, "Direct. Human. Globally aware.", 45, H - 92, 45, width_chars=28)
    voice = [
        ("DIRECT", "Say what TipHub believes and does without inflated language."),
        ("HUMAN", "Write to founders as capable peers, not as applicants in a funnel."),
        ("PRACTICAL", "Prefer concrete support, process, and evidence over broad promises."),
        ("GLOBALLY AWARE", "Respect context without stereotyping regions or markets."),
        ("OPTIMISTIC", "Frame overlooked problems as investable opportunities."),
        ("DEPENDABLE", "Separate approved facts from aspiration and provisional content."),
    ]
    y = 340
    for i, (head, desc) in enumerate(voice):
        col = i % 2
        row = i // 2
        x = 45 + col * 390
        yy = y - row * 92
        mono_label(c, f"{i+1:02d}", x, yy + 10, ORANGE)
        c.setFont("DMSansSemi", 15)
        c.setFillColor(CARBON)
        c.drawString(x + 38, yy + 5, head)
        draw_text_block(c, desc, x + 38, yy - 18, 48, size=9.5, leading=13)
    c.setFillColor(TEAL)
    c.rect(45, 65, W - 90, 66, fill=1, stroke=0)
    c.setFillColor(CHALK)
    c.setFont("DMSansMedium", 10.5)
    c.drawString(65, 101, "AVOID: savior framing / regional stereotypes / startup slang / unsupported impact or access claims")
    c.showPage()

    # 07 Logo
    new_page(c, "Logo system", 7)
    title(c, "The folded T.", 45, H - 95, 47, width_chars=20)
    draw_logo(c, "primary", 45, 290, 310)
    draw_logo(c, "symbol", 520, 245, 155)
    draw_text_block(c, "Primary horizontal lockup", 45, 250, 30, "DMSansMedium", 11)
    draw_text_block(c, "Standalone symbol", 520, 220, 24, "DMSansMedium", 11)
    draw_text_block(
        c,
        "The folded form combines signal, direction, and dimensional depth. The wordmark is outlined vector artwork - never reset it as live type.",
        45,
        175,
        54,
        size=11,
        leading=16,
    )
    c.setFillColor(TEAL)
    c.rect(520, 70, 245, 100, fill=1, stroke=0)
    draw_logo(c, "reversed", 555, 95, 175)
    c.showPage()

    # 08 Clear space
    new_page(c, "Clear space and sizing", 8, bg=MIST)
    title(c, "Give the mark room to signal.", 45, H - 95, 43, width_chars=26)
    c.setStrokeColor(ORANGE)
    c.setDash(4, 4)
    c.rect(70, 205, 420, 175, fill=0, stroke=1)
    draw_logo(c, "primary", 110, 255, 340)
    c.setDash()
    c.setFont("InstrumentItalic", 18)
    c.setFillColor(ORANGE)
    c.drawString(77, 389, "x")
    c.drawString(500, 285, "x")
    draw_text_block(
        c,
        "Clear space equals one half of the symbol cap height on every side. Keep contours, text, images, and crop edges outside this boundary.",
        535,
        350,
        35,
        size=11,
        leading=16,
    )
    stat(c, "PRIMARY DIGITAL MINIMUM", "140 px wide", 535, 245)
    stat(c, "PRIMARY PRINT MINIMUM", "38 mm wide", 535, 180)
    stat(c, "SYMBOL DIGITAL MINIMUM", "24 px", 535, 115)
    c.showPage()

    # 09 Logo use
    new_page(c, "Logo use", 9)
    title(c, "Use the logo as an anchor, not decoration.", 45, H - 95, 41, width_chars=34)
    tiles = [
        ("CHALK", CHALK, "Primary full-color lockup"),
        ("WARM WHITE", WARM_WHITE, "Primary full-color lockup"),
        ("MINERAL TEAL", TEAL, "Reversed Chalk lockup"),
        ("CARBON", CARBON, "Reversed Chalk lockup"),
    ]
    for i, (name, bg, desc) in enumerate(tiles):
        x = 45 + (i % 2) * 390
        y = 275 - (i // 2) * 165
        c.setFillColor(bg)
        c.roundRect(x, y, 345, 130, 8, fill=1, stroke=0)
        draw_logo(c, "reversed" if name in {"MINERAL TEAL", "CARBON"} else "primary", x + 30, y + 46, 190)
        mono_label(c, name, x + 30, y + 20, CHALK if name in {"MINERAL TEAL", "CARBON"} else TEAL)
        c.setFont("DMSans", 8.5)
        c.setFillColor(CHALK if name in {"MINERAL TEAL", "CARBON"} else CARBON)
        c.drawRightString(x + 320, y + 20, desc)
    c.setFillColor(ORANGE)
    c.rect(45, 50, W - 90, 42, fill=1, stroke=0)
    c.setFont("DMSansMedium", 9)
    c.setFillColor(CARBON)
    c.drawString(60, 67, "DO NOT recolor / stretch / rotate / outline / shadow / crop / separate the wordmark from its approved lockup")
    c.showPage()

    # 10 Color
    new_page(c, "Color system", 10)
    title(c, "Warm field. Mineral depth. One signal.", 45, H - 95, 43, width_chars=29)
    swatches = [
        ("CHALK", "#F2EBDD"),
        ("CARBON", "#121715"),
        ("MINERAL TEAL", "#124A46"),
        ("DEEP TEAL", "#0D3734"),
        ("SIGNAL ORANGE", "#F05A32"),
        ("DARK ORANGE", "#D94725"),
        ("PAPER", "#DED6C6"),
        ("MIST", "#B9CCC4"),
        ("SOFT INK", "#2E3B37"),
    ]
    for i, (name, value) in enumerate(swatches):
        col = i % 3
        row = i // 3
        x = 45 + col * 260
        y = 315 - row * 95
        c.setFillColor(HexColor(value))
        c.roundRect(x, y, 225, 70, 6, fill=1, stroke=0)
        tc = CHALK if name in {"CARBON", "MINERAL TEAL", "DEEP TEAL", "SOFT INK"} else CARBON
        mono_label(c, name, x + 14, y + 43, tc)
        mono_label(c, value, x + 14, y + 20, tc)
    c.showPage()

    # 11 Accessibility
    new_page(c, "Accessible color", 11, bg=CARBON, dark=True)
    title(c, "Contrast is part of the identity.", 45, H - 95, 44, CHALK, width_chars=28)
    pairs = [
        ("CARBON / CHALK", "15.27:1", True),
        ("MINERAL TEAL / CHALK", "8.46:1", True),
        ("DEEP TEAL / CHALK", "10.97:1", True),
        ("CARBON / ORANGE", "5.36:1", True),
        ("ORANGE / CHALK", "2.85:1", False),
        ("ORANGE / WHITE", "3.33:1", False),
    ]
    y = 350
    for i, (name, ratio, safe) in enumerate(pairs):
        x = 45 + (i % 2) * 390
        yy = y - (i // 2) * 82
        c.setFillColor(TEAL if safe else ORANGE)
        c.roundRect(x, yy, 350, 58, 6, fill=1, stroke=0)
        c.setFont("DMSansSemi", 12)
        c.setFillColor(CHALK if safe else CARBON)
        c.drawString(x + 18, yy + 33, name)
        c.setFont("IBMPlexMono", 10)
        c.drawRightString(x + 330, yy + 33, ratio)
        c.drawString(x + 18, yy + 14, "NORMAL TEXT SAFE" if safe else "LARGE DISPLAY / DECORATION ONLY")
    draw_text_block(
        c,
        "Always pair hover color with shape, movement, underline, or icon state. Keyboard focus uses a 2 px Signal Orange outline. Minimum interactive target: 44 px.",
        45,
        82,
        92,
        size=10.5,
        color=CHALK,
        leading=15,
    )
    c.showPage()

    # 12 Typography
    new_page(c, "Typography", 12)
    c.setFont("Instrument", 55)
    c.setFillColor(CARBON)
    c.drawString(45, H - 115, "Instrument Serif")
    c.setFont("InstrumentItalic", 48)
    c.setFillColor(ORANGE)
    c.drawString(45, H - 175, "Ambition does not.")
    c.setFont("DMSans", 20)
    c.setFillColor(CARBON)
    c.drawString(45, 315, "DM Sans makes the operational system clear.")
    c.setFont("DMSansMedium", 16)
    c.setFillColor(TEAL)
    c.drawString(45, 275, "Navigation, buttons, body copy, forms, and explanations.")
    c.setFont("IBMPlexMono", 15)
    c.drawString(45, 185, "01 / FIELD NOTE / 25 N 07 E / GLOBAL MANDATE")
    draw_text_block(
        c,
        "Instrument Serif expresses judgment and conviction. DM Sans carries practical information. IBM Plex Mono supplies index, evidence, and coordinate character.",
        500,
        250,
        39,
        size=10.5,
        leading=16,
    )
    c.showPage()

    # 13 Type scale
    new_page(c, "Type scale", 13, bg=PAPER)
    samples = [
        ("H1", "Instrument Serif", "66-92 px / 0.92 / -0.035em", 42),
        ("H2", "Instrument Serif", "48-72 px / 0.95 / -0.028em", 33),
        ("H3", "Instrument Serif", "30 px / 1.0", 24),
        ("BODY", "DM Sans", "14-17 px / 1.46", 15),
        ("META", "IBM Plex Mono", "7-11 px / uppercase / 0.105em", 10),
    ]
    y = 425
    for label, family, spec, size in samples:
        mono_label(c, label, 45, y + 10, TEAL)
        c.setFont("Instrument" if "Instrument" in family else ("IBMPlexMono" if "Mono" in family else "DMSans"), size)
        c.setFillColor(CARBON)
        c.drawString(130, y, "The uncommon becomes obvious.")
        c.setFont("IBMPlexMono", 7)
        c.drawRightString(W - 45, y + 7, spec)
        c.setStrokeColor(RULE)
        c.line(45, y - 22, W - 45, y - 22)
        y -= 76
    c.showPage()

    # 14 Graphic language
    new_page(c, "Graphic language", 14, bg=ORANGE)
    title(c, "The Living Atlas.", 45, H - 95, 48, width_chars=22)
    draw_image_cover(c, ROOT / "public/assets/what-we-back-atlas.png", 430, 85, 320, 365)
    principles = [
        "Tactile paper relief creates place and depth.",
        "Contour lines reveal systems without literal maps.",
        "Routes and markers show movement, evidence, and connection.",
        "Coordinates and field labels add editorial precision.",
        "Keep at least 40 percent quiet space.",
    ]
    draw_bullets(c, principles, 48, 325, 42, 10.5, CARBON, 15)
    c.showPage()

    # 15 Imagery
    new_page(c, "Imagery direction", 15)
    title(c, "People in context. Systems made tangible.", 45, H - 95, 42, width_chars=32)
    draw_image_cover(c, ROOT / "public/assets/tiphub-hero.png", 45, 95, 345, 320)
    draw_image_cover(c, ROOT / "public/assets/essential-systems.png", 415, 245, 350, 170)
    draw_image_cover(c, ROOT / "public/assets/founder-operating-atlas.jpg", 415, 95, 350, 125)
    mono_label(c, "FOUNDER EDITORIAL", 60, 112, CHALK)
    mono_label(c, "SYSTEM LANDSCAPE", 430, 262, CHALK)
    draw_text_block(
        c,
        "Use natural expressions, directional gaze, real working environments, textured light, and controlled crops. Topographic images may be AI-assisted only when disclosed and rights-cleared. Never publish provisional team portraits as real people.",
        45,
        65,
        108,
        size=9.5,
        leading=13,
    )
    c.showPage()

    # 16 Iconography
    new_page(c, "Iconography", 16, bg=MIST)
    title(c, "One outline language. Clear direction.", 45, H - 95, 43, width_chars=29)
    icon_root = ASSET_ROOT / "05-Iconography"
    icons = [
        ("ARROW RIGHT", "Primary next action", ["Phosphor-Arrow-Right-128px.png"]),
        ("ARROW UP RIGHT", "External destination", ["Phosphor-Arrow-Up-Right-128px.png"]),
        ("PLUS / MINUS", "Disclosure state", ["Phosphor-Plus-128px.png", "Phosphor-Minus-128px.png"]),
        ("SEARCH", "Index and discovery", ["Phosphor-Search-128px.png"]),
        ("MENU / CLOSE", "Navigation layer", ["Phosphor-Menu-List-128px.png", "Phosphor-Close-128px.png"]),
        ("LINKEDIN", "Approved social channel", ["Phosphor-LinkedIn-128px.png"]),
    ]
    for i, (name, role, icon_files) in enumerate(icons):
        x = 45 + (i % 3) * 255
        y = 295 - (i // 3) * 145
        c.setFillColor(WARM_WHITE)
        c.roundRect(x, y, 220, 115, 8, fill=1, stroke=0)
        for icon_index, icon_file in enumerate(icon_files):
            c.drawImage(
                str(icon_root / icon_file),
                x + 16 + icon_index * 30,
                y + 53,
                width=25,
                height=25,
                preserveAspectRatio=True,
                mask="auto",
            )
        mono_label(c, name, x + 75, y + 75)
        c.setFont("DMSans", 8.5)
        c.setFillColor(CARBON)
        c.drawString(x + 75, y + 48, role)
        c.setFont("IBMPlexMono", 6.5)
        c.drawString(x + 75, y + 25, "PHOSPHOR OUTLINE / 20-24 PX")
    c.showPage()

    # 17 Layout
    new_page(c, "Layout system", 17)
    title(c, "Different compositions. One measured rhythm.", 45, H - 95, 42, width_chars=34)
    c.setStrokeColor(ORANGE)
    c.setLineWidth(0.8)
    x0, y0, gw, gh = 45, 105, 720, 300
    c.rect(x0, y0, gw, gh, fill=0, stroke=1)
    for x in [x0 + 110, x0 + 350, x0 + 570]:
        c.line(x, y0, x, y0 + gh)
    for y in [y0 + 70, y0 + 190]:
        c.line(x0, y, x0 + gw, y)
    mono_label(c, "110 PX LABEL", x0 + 12, y0 + gh - 25)
    mono_label(c, "EDITORIAL STATEMENT", x0 + 130, y0 + gh - 25)
    mono_label(c, "OPERATIONAL EXPLANATION", x0 + 370, y0 + gh - 25)
    mono_label(c, "ACTION / DATA", x0 + 590, y0 + gh - 25)
    draw_text_block(
        c,
        "Desktop shell: 96 px header, 58 px horizontal margin, 70-92 px section padding. Use thin rules, controlled asymmetry, and square geometry. Avoid repetitive card stacks, pills, glass effects, and generic dashboard density.",
        155,
        255,
        55,
        size=11,
        leading=17,
    )
    c.showPage()

    # 18 UI patterns
    new_page(c, "UI component language", 18, bg=TEAL, dark=True)
    title(c, "Editorial statements meet operational controls.", 45, H - 95, 42, CHALK, width_chars=34)
    components = [
        ("NAVIGATION", "Sticky header, fixed home variant, underlined active state."),
        ("CTA", "Square, mono label, Carbon or Orange reversal, directional arrow."),
        ("ACCORDION", "Indexed rows, plus/minus disclosure, detail by height and opacity."),
        ("PORTFOLIO", "Quiet list at rest, Mist shift and directional action on hover."),
        ("FIELD NOTES", "Editorial cards with variable width and image-led hierarchy."),
        ("MODAL", "Blurred dark backdrop, focused panel, explicit close state."),
    ]
    for i, (name, desc) in enumerate(components):
        x = 45 + (i % 2) * 390
        y = 340 - (i // 2) * 105
        c.setStrokeColor(RULE_LIGHT)
        c.roundRect(x, y, 350, 78, 4, fill=0, stroke=1)
        mono_label(c, f"{i+1:02d} / {name}", x + 15, y + 51, ORANGE)
        draw_text_block(c, desc, x + 15, y + 27, 51, size=8.7, color=CHALK, leading=12)
    c.showPage()

    # 19 States
    new_page(c, "Interaction states", 19)
    title(c, "Every state must explain itself.", 45, H - 95, 44, width_chars=28)
    states = [
        ("REST", CHALK, CARBON, "Clear hierarchy"),
        ("HOVER", TEAL, CHALK, "Color + directional movement"),
        ("FOCUS", CHALK, CARBON, "2 px Orange outline"),
        ("ACTIVE", ORANGE, CARBON, "Visible selection"),
        ("DISABLED", PAPER, SOFT_INK, "Reduced emphasis"),
        ("ERROR", CARBON, CHALK, "Plain-language recovery"),
    ]
    for i, (name, bg, fg, desc) in enumerate(states):
        x = 45 + (i % 3) * 255
        y = 280 - (i // 3) * 140
        c.setFillColor(bg)
        c.roundRect(x, y, 220, 105, 6, fill=1, stroke=1 if name == "FOCUS" else 0)
        if name == "FOCUS":
            c.setStrokeColor(ORANGE)
            c.setLineWidth(2)
            c.roundRect(x, y, 220, 105, 6, fill=0, stroke=1)
        mono_label(c, name, x + 16, y + 73, fg)
        c.setFont("DMSansMedium", 10)
        c.setFillColor(fg)
        c.drawString(x + 16, y + 44, desc)
        c.setFont("DMSansSemi", 18)
        c.drawRightString(x + 200, y + 36, "+" if name in {"REST", "FOCUS"} else "-")
    c.showPage()

    # 20 Motion
    new_page(c, "Motion system", 20, bg=CARBON, dark=True)
    title(c, "Quiet, confident, deliberate.", 45, H - 95, 46, CHALK, width_chars=27)
    tokens = [
        ("MICRO", "160-220 ms", "Icons, focus, small affordances"),
        ("HOVER", "240-320 ms", "Cards, images, directional links"),
        ("PANEL", "450-650 ms", "Menu, filters, overlays"),
        ("REVEAL", "600-900 ms", "Section entry, headline masks"),
    ]
    y = 330
    for i, (name, duration, use) in enumerate(tokens):
        c.setFillColor(TEAL if i % 2 == 0 else DEEP_TEAL)
        c.rect(45, y, W - 90, 58, fill=1, stroke=0)
        mono_label(c, f"{i+1:02d} / {name}", 62, y + 34, ORANGE)
        c.setFont("DMSansSemi", 13)
        c.setFillColor(CHALK)
        c.drawString(260, y + 28, duration)
        c.setFont("DMSans", 10)
        c.drawString(430, y + 28, use)
        y -= 72
    c.setFont("IBMPlexMono", 9)
    c.setFillColor(CHALK)
    c.drawString(45, 55, "DEFAULT EASING / CUBIC-BEZIER(.22, 1, .36, 1) / REDUCED-MOTION REQUIRED")
    c.showPage()

    # 21 Website application
    new_page(c, "Website application", 21)
    title(c, "The identity in its primary environment.", 45, H - 95, 42, width_chars=32)
    shot = ROOT / "tmp/tiphub-live-home.png"
    draw_image_cover(c, shot, 45, 82, 720, 360)
    c.setFillColor(ORANGE)
    c.rect(45, 64, 720, 18, fill=1, stroke=0)
    c.showPage()

    # 22 Editorial applications
    new_page(c, "Editorial and portfolio", 22, bg=MIST)
    title(c, "Different pages, consistent grammar.", 45, H - 95, 42, width_chars=30)
    draw_image_cover(c, ROOT / "public/assets/field-notes-atlas.png", 45, 98, 345, 310)
    draw_image_cover(c, ROOT / "public/assets/founder-operating-atlas.jpg", 420, 228, 345, 180)
    c.setFillColor(TEAL)
    c.rect(420, 98, 345, 110, fill=1, stroke=0)
    c.setFont("Instrument", 26)
    c.setFillColor(CHALK)
    c.drawString(445, 155, "Field note / portfolio story")
    mono_label(c, "EDITORIAL SERIF + OPERATIONAL SANS + MONO EVIDENCE", 445, 125, ORANGE)
    c.showPage()

    # 23 Social
    new_page(c, "Social and presentation", 23)
    title(c, "A recognizable field beyond the website.", 45, H - 95, 42, width_chars=31)
    draw_image_cover(
        c,
        ASSET_ROOT / "09-Social-Presentation/TipHub-Social-OG-1200x630.png",
        45,
        195,
        350,
        184,
    )
    draw_image_cover(
        c,
        ASSET_ROOT / "09-Social-Presentation/TipHub-Presentation-Cover-1920x1080.png",
        420,
        195,
        345,
        194,
    )
    mono_label(c, "OPEN GRAPH / 1200 X 630", 45, 170)
    mono_label(c, "PRESENTATION COVER / 1920 X 1080", 420, 170)
    draw_text_block(
        c,
        "Keep the primary logo in the upper field, use one editorial statement, preserve quiet space, and anchor applications with the Signal Orange baseline.",
        45,
        112,
        98,
        size=10.5,
        leading=15,
    )
    c.showPage()

    # 24 Governance
    new_page(c, "Governance", 24, bg=PAPER)
    title(c, "Approved, provisional, and aspirational are not the same.", 45, H - 95, 41, width_chars=38)
    statuses = [
        ("APPROVED SYSTEM", TEAL, CHALK, "Logo, palette, typography, motion, graphic language, website UI."),
        ("OWNER CONFIRMATION", ORANGE, CARBON, "$500K fund claim, portfolio display, legal entity, contact workflow."),
        ("PROVISIONAL", CARBON, CHALK, "Team names, portraits, biographies, generic LinkedIn destination."),
    ]
    y = 330
    for label, bg, fg, desc in statuses:
        c.setFillColor(bg)
        c.roundRect(45, y, 720, 72, 6, fill=1, stroke=0)
        mono_label(c, label, 62, y + 45, fg)
        c.setFont("DMSans", 10)
        c.setFillColor(fg)
        c.drawString(250, y + 40, desc)
        y -= 92
    draw_text_block(
        c,
        "Office model: Global - meetings by appointment. This is not a street or legal address. Replace only when an approved legal address is available.",
        45,
        72,
        100,
        size=10,
        leading=14,
    )
    c.showPage()

    # 25 Asset index
    new_page(c, "Asset index", 25)
    title(c, "A kit organized for real use.", 45, H - 95, 45, width_chars=25)
    folders = [
        "01-Logos / SVG masters, color, mono, reversed, PNG exports",
        "02-Favicon-App-Icons / SVG, PNG sizes, Apple, Android, ICO",
        "03-Color / swatch sheet and CSV specifications",
        "04-Typography / specimen and type rules",
        "05-Iconography / approved icon family and usage",
        "06-Photography-Imagery / approved site visuals",
        "07-Graphic-Devices / Living Atlas guidance",
        "08-UI-Patterns / interaction and motion",
        "09-Social-Presentation / OG and deck-cover templates",
        "10-Governance-Licenses / licenses and approvals",
    ]
    y = 355
    for i, line in enumerate(folders):
        mono_label(c, f"{i+1:02d}", 45, y + 3, ORANGE)
        c.setFont("DMSansMedium", 10.5)
        c.setFillColor(CARBON)
        c.drawString(85, y, line)
        c.setStrokeColor(RULE)
        c.line(45, y - 13, W - 45, y - 13)
        y -= 34
    c.showPage()

    # 26 Close
    c.setFillColor(TEAL)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    draw_logo(c, "reversed", 55, H - 125, 190)
    title(c, "Build where the signal is strongest.", 55, H - 225, 50, CHALK, width_chars=24)
    c.setFillColor(ORANGE)
    c.setFont("InstrumentItalic", 34)
    c.drawString(55, 190, "Opportunity has a geography.")
    c.drawString(55, 150, "Ambition does not.")
    mono_label(c, "TIPHUB.VC / HELLO@TIPHUB.VC / PITCH@TIPHUB.VC", 55, 72, CHALK, 8.5)
    mono_label(c, "GLOBAL - MEETINGS BY APPOINTMENT", 55, 52, MIST, 8)
    c.setFillColor(ORANGE)
    c.rect(0, 0, W, 16, fill=1, stroke=0)
    c.showPage()

    c.save()
    return pdf_path


def create_manifest():
    manifest_path = OUT / "Brand-Asset-Manifest.csv"
    rows = []
    for path in sorted(ASSET_ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ASSET_ROOT)
        dims = ""
        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".ico"}:
            try:
                im = Image.open(path)
                dims = f"{im.width}x{im.height}"
            except Exception:
                pass
        status = "approved"
        if "team-" in path.name.lower():
            status = "provisional"
        if "License" in str(rel) or "OFL-" in path.name:
            status = "reference"
        rows.append(
            [
                str(rel),
                path.suffix.lower().lstrip("."),
                dims,
                status,
                "TipHub source repository",
                "31 Jul 2026",
            ]
        )
    with open(manifest_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["File", "Format", "Dimensions", "Status", "Source", "Updated"])
        writer.writerows(rows)
    return manifest_path


if __name__ == "__main__":
    create_supporting_assets()
    manifest = create_manifest()
    pdf = build_pdf()
    print(pdf)
    print(manifest)
