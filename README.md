# CodeReviewer — front-end

Interface em React + TypeScript + Vite para a API `POST /ai/review` do
[CodeReviewer](https://github.com/kauamassei/CodeReviewer).

## Rodando

```bash
npm install
cp .env.example .env
npm run dev
```

Suba o Spring Boot em `localhost:8080`. O Vite faz proxy de `/ai` para lá
(`vite.config.ts`), então não há problema de CORS em desenvolvimento.

## Contrato da API

Tudo que toca o backend está em `src/services/api.ts`. O código assume:

```
POST /ai/review
Content-Type: application/json

{ "code": "...", "prompt": "...", "language": "java" }
```

A resposta pode ser texto puro ou JSON. Se for JSON, o front procura um campo
de texto entre `review`, `result`, `response`, `content`, `message`, `text`,
`analysis` e `output`. Se nenhum bater, ele mostra o JSON inteiro na tela —
aí é só olhar o formato e ajustar `extractReview`.

Se o seu DTO usa outros nomes, mude apenas `buildBody` e `extractReview`.

## CORS em produção

Sem o proxy do Vite, o backend precisa liberar a origem do front:

```java
@CrossOrigin(origins = "http://localhost:5173")
@PostMapping("/ai/review")
public ResponseEntity<?> review(@RequestBody ReviewRequest request) { ... }
```

E no `.env` do front: `VITE_API_URL=https://sua-api.com`.

## Trocando o plano de fundo

Coloque o arquivo em `public/` e defina no `.env`:

```
VITE_BG_TYPE=video      # gradient | image | video
VITE_BG_SRC=/bg.mp4
```

O véu escuro (`.bg-veil` no `global.css`) mantém o contraste do texto sobre
qualquer mídia — ajuste a opacidade ali se o vídeo ficar escuro ou claro demais.
Os discos iridescentes continuam por cima; para removê-los, apague as três
`<div className="disc ...">` em `src/components/Background.tsx`.

Para vídeo, prefira MP4 (H.264) com menos de ~5 MB e sem áudio.

## Estrutura

```
src/
  components/
    Background.tsx    fundo trocável + discos
    Navbar.tsx        navegação do topo
    Hero.tsx          headline (encolhe quando a conversa começa)
    PromptBar.tsx     campo de código + prompt + envio
    Conversation.tsx  mensagens e blocos de código
  services/api.ts     chamada ao /ai/review
  styles/global.css   todo o CSS
  types.ts
```

## Formato da resposta

O backend hoje repassa o envelope cru do Gemini:

```json
{ "candidates": [ { "content": { "parts": [ { "text": "{\"score\":85,...}" } ] } } ] }
```

O front desempacota duas camadas em `src/services/api.ts`:

1. `extractText` pega `candidates[0].content.parts[*].text`;
2. `parseReport` faz `JSON.parse` desse texto (removendo cercas ```` ```json ````)
   e monta `{ score, summary, issues[] }`.

Se o parse funcionar, a tela mostra o relatório formatado. Se não, cai no modo
texto — ou seja, nunca quebra, mesmo que o modelo responda em prosa.

O ideal, quando você tiver tempo, é o backend devolver só esse objeto interno
em vez do envelope inteiro. Aí `extractText` e `parseReport` continuam
funcionando sem nenhuma mudança no front.
