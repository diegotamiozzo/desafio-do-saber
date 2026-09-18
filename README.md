# Desafio do Saber

Jogo educativo de perguntas e respostas para dois jogadores, com perguntas geradas exclusivamente pela API da Groq e suporte a botões físicos ESP32 ou simulação pelo teclado.

## Requisitos

- Node.js 18 ou superior
- npm
- Uma chave `GROQ_API_KEY`

## Instalação local

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz usando `.env.example` como referência:

```env
GROQ_API_KEY=sua_chave_groq
ADMIN_USER=seu_usuario
ADMIN_PASS=sua_senha
```

`GROQ_API_KEY` é usada somente pelo servidor. A aplicação não possui banco local nem gerador alternativo: se a API Groq estiver indisponível, a geração de perguntas falha explicitamente.

O login é validado pelo servidor usando exclusivamente `ADMIN_USER` e `ADMIN_PASS` configurados no ambiente de execução, se uma das variáveis não estiver configurada, nenhum login será aceito.

## Executar em desenvolvimento

Inicie o servidor Express com middleware do Vite:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O servidor disponibiliza:

- `GET /api/status`: verifica a disponibilidade do backend e da Groq.
- `POST /api/perguntas/gerar`: gera um lote de 4, 8 ou 12 perguntas.

Durante a partida, as teclas `1` e `2` simulam os botões dos jogadores 1 e 2. O mediador seleciona a alternativa escolhida pela criança.

## Configuração da partida

Na tela **Configurações**, é possível selecionar:

- Tema predefinido ou personalizado
- Contexto específico para orientar as perguntas
- Dificuldade: fácil, médio ou difícil
- Duração: 4, 8 ou 12 perguntas

As configurações, a preferência de som e o histórico das partidas são mantidos no `localStorage` do navegador.

## Build e execução

Verifique os tipos TypeScript:

```bash
npm run lint
```

Gere o frontend e o bundle do servidor:

```bash
npm run build
```

Execute a versão produzida:

```bash
npm start
```

O build gera o frontend em `dist` e o servidor empacotado em `dist/server.cjs`. Em produção, o Express serve os arquivos estáticos e aplica o fallback da SPA para as rotas do React.

Para visualizar apenas o build do frontend:

```bash
npm run preview
```

## Deploy no Render

O deploy é feito como um único Web Service no Render: o mesmo processo Express serve o frontend compilado e a API Groq. O arquivo `render.yaml` já contém a configuração do serviço.

Configuração equivalente:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Health check:** `/api/status`
- **Variável obrigatória:** `GROQ_API_KEY`
- **Variáveis obrigatórias:** `GROQ_API_KEY`, `ADMIN_USER` e `ADMIN_PASS`

O servidor usa automaticamente a porta fornecida pelo Render através de `PORT` e usa `3000` localmente quando essa variável não existe.

Depois do deploy, valide:

```text
https://seu-servico.onrender.com/api/status
```

A resposta deve informar `status: "ok"` e `aiAvailable: true`. Como frontend e API usam a mesma origem, não é necessário configurar URL de API, CORS ou um segundo serviço de hospedagem.

## Estrutura principal

- `src/pages`: telas de login, início, configurações e partida.
- `src/components`: componentes visuais reutilizáveis.
- `src/context`: autenticação e estado completo da partida.
- `src/services/questionService.ts`: chamada à API Groq e validação das perguntas.
- `src/services/hardwareService.ts`: teclado e USB Serial do ESP32.
- `src/data/constants.ts`: temas, dificuldades e configurações padrão.
- `src/types`: tipos compartilhados do domínio.
- `server.ts`: API Express, integração com Groq e servidor do frontend.

## ESP32 via USB Serial

O ESP32 se comunica com o computador pelo cabo USB usando a porta serial. Não é necessário Wi-Fi, Bluetooth ou servidor adicional para os botões: o navegador recebe diretamente os eventos pela Web Serial API.

Use dois botões normalmente abertos:

| Função | GPIO do ESP32 | Outra conexão |
|---|---:|---|
| Jogador 1 | GPIO 18 | Botão entre GPIO 18 e GND |
| Jogador 2 | GPIO 19 | Botão entre GPIO 19 e GND |

O firmware de exemplo está em `hardware/esp32_desafio_saber.ino`, usa `INPUT_PULLUP`, inicia a serial em **115200 baud** e envia:

```text
BTN:1
BTN:2
```

O frontend também aceita `PLAYER:1`, `PLAYER:2` ou apenas `1` e `2`, sempre terminados por uma quebra de linha.

Para conectar:

1. Execute `npm run dev` localmente ou abra a URL HTTPS do Render.
2. Use Google Chrome ou Microsoft Edge em um computador.
3. Faça login e clique no ícone de CPU no cabeçalho.
4. Selecione a porta USB do ESP32 e autorize o acesso.

Se o ESP32 não estiver conectado, as teclas `1` e `2` continuam disponíveis como fallback.

Não coloque chaves de API em arquivos versionados.
