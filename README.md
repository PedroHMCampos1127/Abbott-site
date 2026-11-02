# Guilherme Abbott · Professor de Beach Tênis

Site de uma página para as aulas de beach tênis do Guilherme Abbott (Votorantim, SP).
Estático: HTML, CSS e JavaScript puros, sem etapa de build.

## Estrutura

```
.
├── index.html                 página do site
├── robots.txt
├── assets/
│   ├── css/styles.css         estilos (base, hero, professor, aulas, parcerias, celular)
│   ├── js/
│   │   ├── hero.js            intro, cursor, nav, hero
│   │   ├── professor.js       rolagem suave, "Conheça o professor", fotos passando
│   │   ├── aulas.js           grade de horários, filtros, configurador de planos
│   │   └── parcerias.js       raquete 3D e cupom GABBOTT
│   ├── img/                   fotos em WebP + imagem de compartilhamento (og-image.jpg)
│   ├── video/                 raquete 360° (webm transparente + mp4 para Safari)
│   └── icons/                 favicon e ícone do iPhone
└── design-system/             DS Abbott (referência visual, não é carregado pelo site)
```

## Seções

1. **Hero** — intro com cortina, título em máscara, foto em duotone.
2. **Conheça o professor** — formação CBT/ITF, experiência e fotos passando no scroll.
3. **Aulas** — grade da semana (links diretos para o WhatsApp), planos com a tabela de preços e aula experimental.
4. **Parcerias** — raquete 3D e cupom GABBOTT da Loja de Beach Tennis.

## Rodar no computador

Abrir o `index.html` no navegador já funciona. Para testar como em produção (e no celular, na mesma rede Wi-Fi):

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000` (ou `http://IP-DO-MAC:8000` no celular).

## Deploy

Qualquer hospedagem de site estático serve (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
Não há build: a pasta publicada é a raiz do projeto.

Depois de publicar:
- trocar `og:image` no `<head>` do `index.html` pelo endereço completo da imagem;
- conferir o vídeo da raquete no Safari/iPhone.

## Dependências (CDN, versões fixas)

- GSAP 3.13 (ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase)
- Lenis 1.3.4
- Google Fonts: Bebas Neue, Playfair Display, Inter

## Dados para manter atualizados

- WhatsApp: +55 15 99742-1167 (links `wa.me` no `index.html` e em `assets/js/aulas.js`)
- Horários e preços: `index.html` (grade) e `assets/js/aulas.js` (tabela `PRICES`, valores de 2025)
- Cupom: GABBOTT · loja: lojadebeachtennis.com.br
