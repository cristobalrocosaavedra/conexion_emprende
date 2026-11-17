"""Variante A «Chile en la palma» de Latitud viva para Turismo en tu Mano.

Reutiliza sin redibujar las cinco piezas del ícono aprobado (latitud-viva-icono.png)
y agrega una mano abierta vectorial en marfil. Uso:
    python generar.py <icono_aprobado.png> <carpeta_salida>
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
SIZE, SS = 1254, 4  # lienzo final y sobremuestreo para bordes suaves
BG = (34, 22, 46)
MARFIL = (247, 238, 220)

src = Image.open(SRC).convert("RGB")
bg = Image.new("RGB", src.size, src.getpixel((8, 8)))
diff = ImageChops.difference(src, bg).convert("L")
box = diff.point(lambda v: 255 if v > 40 else 0).getbbox()
pieces = src.crop(box)
alpha = ImageChops.difference(pieces, Image.new("RGB", pieces.size, src.getpixel((8, 8)))).convert("L")
alpha = alpha.point(lambda v: max(0, min(255, (v - 8) * 255 // 30)))


def chaikin(points, rounds=5):
    for _ in range(rounds):
        nxt = []
        for i, p in enumerate(points):
            q = points[(i + 1) % len(points)]
            nxt += [(0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]),
                    (0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1])]
        points = nxt
    return points


def quad(a, b, c, n=160):
    return [((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
             (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1])
            for t in (i / n for i in range(n + 1))]


def stroke(d, pts, width, color):
    # Círculos densos en vez de line(): evita rayas entre segmentos gruesos.
    r = width / 2
    for x, y in pts:
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)


def render(dy=0, cx=690):
    big = Image.new("RGB", (SIZE * SS, SIZE * SS), BG)
    d = ImageDraw.Draw(big)
    S = lambda pts: [(x * SS, (y + dy) * SS) for x, y in pts]
    # Dedos (anular, medio, índice): cada uno con un borde fino del fondo para separarlos.
    for a, b, c, w in [((770, 992), (900, 985), (962, 952), 46),
                       ((770, 950), (925, 940), (992, 900), 50),
                       ((770, 906), (925, 894), (1004, 846), 52)]:
        line = S(quad(a, b, c))
        stroke(d, line, (w + 16) * SS, BG)
        stroke(d, line, w * SS, MARFIL)
    # Pulgar, que se funde con la palma.
    stroke(d, S(quad((488, 915), (440, 850), (430, 795))), 72 * SS, MARFIL)
    palm = [(410, 1120), (412, 1040), (440, 965), (480, 905), (580, 884), (760, 880),
            (850, 882), (872, 940), (860, 1000), (760, 1022), (620, 1040), (560, 1068), (530, 1120)]
    d.polygon(chaikin(S(palm), 4), fill=MARFIL)
    final = big.resize((SIZE, SIZE), Image.LANCZOS)
    h = 735
    w = round(pieces.width * h / pieces.height)
    final.paste(pieces.resize((w, h), Image.LANCZOS), (cx - w // 2, 890 + dy - h),
                alpha.resize((w, h), Image.LANCZOS))
    return final


OUT.mkdir(parents=True, exist_ok=True)
icon = render(dy=-10)
icon.save(OUT / "turismo-en-tu-mano-icono.png", optimize=True)
icon.save(OUT / "turismo-en-tu-mano-icono.webp", quality=90, method=6)
# Lámina de revisión: tamaños de ícono y texto provisional en claro/oscuro.
from PIL import ImageFont  # noqa: E402

font = ImageFont.truetype("C:/Windows/Fonts/seguibl.ttf", 64)
sheet = Image.new("RGB", (1400, 760), (250, 246, 238))
d = ImageDraw.Draw(sheet)
x = 60
for px in (192, 96, 48):
    sheet.paste(icon.resize((px, px), Image.LANCZOS), (x, 60))
    x += px + 50
for i, (back, ink) in enumerate([((250, 246, 238), (34, 22, 46)), (BG, MARFIL)]):
    y = 300 + i * 220
    d.rectangle((0, y - 20, 1400, y + 200), fill=back)
    mark = icon.resize((160, 160), Image.LANCZOS)
    m = Image.new("L", (160, 160), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, 159, 159), 36, fill=255)
    sheet.paste(mark, (60, y), m)
    d.text((250, y + 42), "Turismo en tu Mano", font=font, fill=ink)
sheet.save(OUT / "revision-lamina.png", optimize=True)
print("piezas", box, "->", OUT)

# Lámina de zonas sin el rótulo anterior «territorio vivo» (se rellena con el fondo de cada columna).
zonas_src = SRC.with_name("latitud-viva-zonas.webp")
if zonas_src.exists():
    z = Image.open(zonas_src).convert("RGB")
    for x in range(480, 781):
        color = z.getpixel((x, 1216))
        for y in range(1160, 1212):
            z.putpixel((x, y), color)
    z.save(OUT / "turismo-en-tu-mano-zonas.webp", quality=80, method=6)
