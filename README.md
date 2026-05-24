# GeoClue Duel

**Indovina il paese prima del tuo avversario.**

GeoClue Duel è un gioco web di geografia competitivo in React + Vite + TypeScript. A ogni round viene scelto un paese o territorio misterioso: puoi tentare subito senza indizi per 10 punti, oppure rischiare di sbagliare e sbloccare indizi sempre più forti fino alla bandiera finale.

## Funzionalità

- Partita veloce, normale e lunga con obiettivi 10, 30 e 50 punti.
- Avversario bot a difficoltà media con probabilità crescente in base agli indizi.
- 1v1 locale hot-seat sullo stesso dispositivo.
- Torneo a eliminazione diretta da 4, 8, 16 o 32 partecipanti.
- Tornei misti con giocatori locali e bot generati automaticamente.
- Simulazione automatica degli incontri bot vs bot.
- Input con autocomplete e matching robusto per italiano, inglese e alias.
- Dataset completo da 254 paesi/territori stile Flagpedia, incluse dipendenze e paesi costitutivi del Regno Unito.
- Bandiere delle 254 entità salvate localmente in `public/flags/`.
- Service worker di produzione per funzionare offline dopo la prima visita.
- Impostazioni e progressi base salvati in `localStorage`.
- Struttura pronta per estendere dataset e futuro multiplayer online.

## Installazione

```bash
npm install
```

## Avvio locale

```bash
npm run dev
```

Apri l’URL mostrato da Vite, di solito `http://localhost:5173`.

## Test

```bash
npm run test
```

I test coprono normalizzazione risposte, matching alias, punteggi, indizi e generazione bracket.

## Build produzione

```bash
npm run build
```

I file statici vengono creati in `dist/`.

Per provare la build:

```bash
npm run preview
```

## Pubblicazione su GitHub Pages

Il progetto usa `base: './'` in `vite.config.ts`, quindi la build funziona anche sotto path di repository GitHub Pages.

Flusso manuale:

```bash
npm run build
```

Poi pubblica la cartella `dist/` su GitHub Pages, per esempio con una GitHub Action o con il branch configurato per servire file statici.

Esempio Action minima:

```yaml
name: Deploy GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Dataset

Il gioco usa questo dataset completo:

```text
src/data/countries.ts
src/data/countries.full.ts
```

`countries.full.ts` contiene le 254 entità generate dalla lista Flagpedia e arricchite con REST Countries quando possibile. `countries.ts` applica anche le schede seed curate a mano per alcuni paesi già rifiniti.

Il seed manuale resta disponibile in:

```text
src/data/countries.seed.ts
```

Ogni entità usa il tipo `Country` in:

```text
src/data/countryTypes.ts
```

Campi principali: nomi IT/EN, alias accettati, continente, regione, sistema politico, popolazione, confini, tipo territorio, famiglie linguistiche e bandiera.

Per rigenerare il dataset completo:

```bash
npm run data:expand
```

Lo script genera `src/data/countries.full.ts` partendo dalla lista pubblica Flagpedia da 254 bandiere. REST Countries viene usato per popolazione, traduzioni, regioni, confini e lingue; per Inghilterra, Irlanda del Nord, Scozia e Galles vengono applicate patch manuali perché non fanno parte del set REST Countries.

Per riscaricare tutte le bandiere:

```bash
npm run flags:download
```

Lo script legge la lista Flagpedia, scarica 254 PNG da FlagCDN e li salva in `public/flags/`.

## Struttura progetto

```text
src/
  App.tsx
  components/
  data/
  game/
  styles/
  utils/
scripts/
  buildFullCountries.mjs
  downloadFlags.mjs
```

La logica pura è in `src/game/`, separata dalla UI. `src/game/multiplayerTypes.ts` contiene i contratti iniziali per un futuro adattatore multiplayer online.

## Note offline

La logica, il dataset completo e le bandiere sono locali. In produzione viene registrato `public/service-worker.js`: dopo la prima visita online, app shell e asset richiesti vengono serviti anche offline dalla cache del browser.

## Fonti dati

- Flagpedia: lista pubblica di 254 bandiere paese/territorio.
- REST Countries: popolazione, regioni, traduzioni, confini e lingue.
- FlagCDN: immagini PNG delle bandiere, salvate localmente nel repository.
