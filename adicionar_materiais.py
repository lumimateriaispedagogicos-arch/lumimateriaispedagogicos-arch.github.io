# -*- coding: utf-8 -*-
"""
Adiciona ao site os PDFs novos da pasta 'MATERIAL PARA SITE'.

Uso:  py -3.14 adicionar_materiais.py

O que faz para cada PDF que ainda nao esta no site:
  1. Copia para materiais/ com nome amigavel para web (sem espacos/acentos)
  2. Gera a capa (primeira pagina) em img/capas/
  3. Acrescenta uma entrada no materiais.js (categoria inferida pelo nome
     do arquivo; revise titulo/descricao depois se quiser)
"""
import os, re, unicodedata, glob
import fitz  # pymupdf

ORIGEM = r"C:\Users\refer\OneDrive\Desktop\LUMI\MATERIAL PARA SITE"
SITE = os.path.dirname(os.path.abspath(__file__))
MATERIAIS = os.path.join(SITE, "materiais")
CAPAS = os.path.join(SITE, "img", "capas")
CATALOGO = os.path.join(SITE, "materiais.js")

CORES = ["#4A6FA5", "#F2B33D", "#7C9A6D", "#D96A5A", "#7D62B8", "#086B8E", "#E5A33F", "#C0564B"]

# palavra-chave no nome do arquivo -> (categoria, idade sugerida)
CATEGORIAS = [
    ("CONCIENCIA FONOLOGICA", ("Consciência Fonológica", "4 a 6 anos")),
    ("CONSCIENCIA FONOLOGICA", ("Consciência Fonológica", "4 a 6 anos")),
    ("ALFABETO", ("Alfabetização", "3 a 6 anos")),
    ("MATEMATICA", ("Matemática", "4 a 6 anos")),
    ("RACIOCINIO", ("Raciocínio Lógico", "4 a 6 anos")),
    ("INTERPRETACAO", ("Interpretação de Texto", "5 a 7 anos")),
    ("EMOCIONAL", ("Inteligência Emocional", "3 a 6 anos")),
    ("COORDENACAO", ("Coordenação Motora", "3 a 6 anos")),
]

def slug(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    t = re.sub(r"[^A-Za-z0-9]+", "-", t).strip("-").lower()
    t = re.sub(r"^lumi-", "", t)
    return t.replace("conciencia", "consciencia")  # corrige grafia p/ casar com o catalogo

def sem_acento(t):
    return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().upper()

def categoria_de(nome):
    chave = sem_acento(nome)
    for k, v in CATEGORIAS:
        if k in chave:
            return v
    return ("Atividades", "3 a 6 anos")

def titulo_de(nome):
    base = re.sub(r"^LUMI\s+", "", nome, flags=re.I)
    base = re.sub(r"\bCONCIENCIA\b", "CONSCIÊNCIA", base, flags=re.I)
    palavras = base.title().replace("Fonologica", "Fonológica").replace("Matematica", "Matemática")
    palavras = re.sub(r"\bLetra ([a-z])\b", lambda m: "— Letra " + m.group(1).upper(), palavras)
    return palavras

os.makedirs(CAPAS, exist_ok=True)
with open(CATALOGO, encoding="utf-8") as f:
    catalogo = f.read()

novos = []
for pdf in sorted(glob.glob(os.path.join(ORIGEM, "*.pdf"))):
    nome = os.path.splitext(os.path.basename(pdf))[0]
    arquivo_web = slug(nome) + ".pdf"
    destino = os.path.join(MATERIAIS, arquivo_web)
    if "materiais/" + arquivo_web in catalogo:
        continue  # ja esta no site

    # 1) copia
    with open(pdf, "rb") as a, open(destino, "wb") as b:
        b.write(a.read())

    # 2) capa + paginas
    doc = fitz.open(destino)
    paginas = len(doc)
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(480 / page.rect.width, 480 / page.rect.width), alpha=False)
    pix.save(os.path.join(CAPAS, slug(nome) + ".jpg"), jpg_quality=82)
    doc.close()

    # 3) entrada no catalogo
    cat, idade = categoria_de(nome)
    cor = CORES[(catalogo.count("titulo:") + len(novos)) % len(CORES)]
    entrada = (
        "  {\n"
        '    titulo: "' + titulo_de(nome) + '",\n'
        '    descricao: "' + str(paginas) + ' páginas de atividades para baixar e imprimir.",\n'
        '    categoria: "' + cat + '",\n'
        '    idade: "' + idade + '",\n'
        "    paginas: " + str(paginas) + ",\n"
        '    arquivo: "materiais/' + arquivo_web + '",\n'
        '    cor: "' + cor + '"\n'
        "  },\n"
    )
    novos.append((nome, entrada))
    print("adicionado:", nome, "->", arquivo_web, "(", cat, ",", paginas, "pág )")

if novos:
    marcador = "];"
    blocos = "".join(e for _, e in novos)
    catalogo = catalogo.replace(marcador, blocos + marcador)
    with open(CATALOGO, "w", encoding="utf-8") as f:
        f.write(catalogo)
    print()
    print(len(novos), "material(is) adicionados ao site. Revise as descricoes em materiais.js se quiser personalizar.")
else:
    print("Nenhum PDF novo encontrado — o site ja esta com tudo.")
