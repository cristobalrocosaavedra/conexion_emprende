"""Limpieza reproducible del logo generado en GPT (16-11-2026).

- Quita el halo claro de los bordes transparentes (umbral + erosión de 1 px + suavizado).
- Borra la barra morada sobrante sobre la «i» del texto.
- Rellena la mancha entre dedos con el color de la mano.
- Genera el ícono cuadrado sobre fondo marfil y sobre berenjena.
Uso: python limpiar.py  (lee originales-gpt/, escribe limpio/)
"""
from pathlib import Path
from PIL import Image, ImageFilter

BASE = Path(__file__).parent
SRC, OUT = BASE / "originales-gpt", BASE / "limpio"
OUT.mkdir(exist_ok=True)
MARFIL, BERENJENA = (250, 246, 238), (34, 22, 46)


def defringe(im):
    r, g, b, a = im.split()
    hard = a.point(lambda v: 255 if v >= 140 else 0).filter(ImageFilter.MinFilter(3))
    soft = hard.filter(ImageFilter.GaussianBlur(0.8))
    # Colores de borde: se toma el color del interior más cercano para evitar el fleco blanco.
    rgb = Image.merge("RGB", (r, g, b))
    grown = rgb.copy()
    for _ in range(3):
        grown = Image.composite(grown, grown.filter(ImageFilter.MaxFilter(3)), hard)
    out = grown.convert("RGBA")
    out.putalpha(soft)
    return out


def borrar_barra(im, semilla):
    """Borra el componente conectado (la barra sobrante) que contiene la semilla."""
    from PIL import ImageDraw
    mascara = im.getchannel("A").point(lambda v: 255 if v >= 40 else 0)
    ImageDraw.floodfill(mascara, semilla, 128)
    comp = mascara.point(lambda v: 255 if v == 128 else 0)
    caja = comp.getbbox()
    if not caja or caja[3] - caja[1] > 60:  # protección: nunca borrar una letra
        raise SystemExit(f"semilla {semilla} no corresponde a la barra: {caja}")
    comp = comp.filter(ImageFilter.MaxFilter(5))
    limpio = im.copy()
    limpio.paste((0, 0, 0, 0), (0, 0) + im.size, comp)
    return limpio, caja


sym = defringe(Image.open(SRC / "simbolo-transparente.webp").convert("RGBA"))
bb = sym.getchannel("A").getbbox()
sym = sym.crop(bb)
# Mancha clara en la separación entre dedos: se vuelve transparente.
w, h = sym.size
x0, y0 = int(w * 0.68) + 150, int(h * 0.66) + 160
for x in range(x0, x0 + 90):
    for y in range(y0, y0 + 110):
        r, g, b_, al = sym.getpixel((x, y))
        if al and r > 200 and g > 190 and b_ > 170:
            sym.putpixel((x, y), (0, 0, 0, 0))
sym.save(OUT / "simbolo.png", optimize=True)
for fondo, nombre in ((MARFIL, "icono-marfil"), (BERENJENA, "icono-berenjena")):
    lienzo = Image.new("RGBA", (1254, 1254), fondo + (255,))
    escala = 940 / max(sym.size)
    s = sym.resize((round(sym.width * escala), round(sym.height * escala)), Image.LANCZOS)
    lienzo.alpha_composite(s, ((1254 - s.width) // 2, (1254 - s.height) // 2))
    lienzo.convert("RGB").save(OUT / f"{nombre}.png", optimize=True)

# Semillas medidas sobre los originales (punto dentro de la barra sobrante).
SEMILLAS = {"texto": (1040, 75), "horizontal": (1320, 237), "vertical": (1000, 1420)}
for nombre in ("texto", "horizontal", "vertical"):
    im = Image.open(SRC / f"{nombre}-transparente.webp").convert("RGBA")
    im, barra = borrar_barra(im, SEMILLAS[nombre])
    # Interior blanco opaco de las letras (o, a, e): pasa a transparente solo en la zona del texto.
    zona = {"texto": (0, 0), "horizontal": (int(im.width * 0.37), 0), "vertical": (0, 1416)}[nombre]
    px = im.load()
    for x in range(zona[0], im.width):
        for y in range(zona[1], im.height):
            r, g, b_, al = px[x, y]
            if al and r > 235 and g > 235 and b_ > 235:
                px[x, y] = (r, g, b_, 0)
    print(nombre, "barra", barra)
    im = defringe(im)
    im = im.crop(im.getchannel("A").getbbox())
    im.save(OUT / f"{nombre}.png", optimize=True)

# Versiones para fondo oscuro: el texto morado pasa a marfil (la mano se mantiene).
def texto_claro(im, desde_x=0, desde_y=0):
    out = im.copy()
    px = out.load()
    for x in range(desde_x, out.width):
        for y in range(desde_y, out.height):
            r, g, b_, al = px[x, y]
            if al and r < 120 and g < 60 and b_ < 110 and b_ > g:
                px[x, y] = (247, 238, 220, al)
    return out


texto_claro(Image.open(OUT / "texto.png")).save(OUT / "texto-oscuro.png", optimize=True)
hz = Image.open(OUT / "horizontal.png")
corte = int(hz.width * 0.37)  # el texto empieza después del símbolo
texto_claro(hz, desde_x=corte).save(OUT / "horizontal-oscuro.png", optimize=True)
