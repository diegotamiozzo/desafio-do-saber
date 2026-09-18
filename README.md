# Desafio do Saber

Jogo educativo de perguntas e respostas para dois jogadores, com perguntas geradas por IA, banco local de fallback e suporte a botões físicos ou simulação pelo teclado.

## Requisitos

- Node.js 18 ou superior
- npm
- Uma chave da API Groq para geração de perguntas por IA (opcional; sem ela, o sistema usa o banco local)

## Instalação local

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto usando `.env.example` como referência:

```env
GROQ_API_KEY=sua_chave_groq
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=admin
VITE_API_BASE_URL=
```

`GROQ_API_KEY` é usada somente pelo servidor. Se não for informada, a aplicação continua funcionando com o gerador local contextual.

As credenciais `VITE_ADMIN_USER` e `VITE_ADMIN_PASS` são as credenciais demonstrativas da tela de login. Como variáveis `VITE_*` são incorporadas ao frontend, elas não devem ser consideradas um mecanismo de segurança para produção.

## Executar em desenvolvimento

Inicie o servidor Express com middleware do Vite:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O servidor disponibiliza:

- `GET /api/status`: verifica a disponibilidade do backend e da IA.
- `POST /api/perguntas/gerar`: gera um lote de 4, 8 ou 12 perguntas conforme a configuração.

Durante a partida, as teclas `1` e `2` simulam os botões dos jogadores 1 e 2. O clique nas alternativas é feito pelo mediador.

## Configuração da partida

Na tela **Configurações**, é possível selecionar:

- Tema predefinido ou personalizado
- Contexto específico para orientar as perguntas
- Dificuldade: fácil, médio ou difícil

Cada partida pode ser curta (4 perguntas), média (8 perguntas) ou longa (12 perguntas). O jogo mantém as configurações, preferência de som e histórico das últimas partidas no `localStorage` do navegador.

## Build e execução em produção

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

O projeto não possui atualmente um test runner ou script de testes automatizados no `package.json`.

## Deploy separado: Netlify + Render

O frontend pode ser hospedado no Netlify e o servidor Express em outro serviço, como Render.

### Backend

O arquivo `render.yaml` já contém a configuração do Web Service. No Render, crie o serviço a partir do repositório ou use o Blueprint e configure:

```env
GROQ_API_KEY=sua_chave_groq
```

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Health check:** `/api/status`

O servidor usa automaticamente a porta fornecida pelo Render por meio da variável `PORT`. Localmente, o padrão continua sendo a porta `3000`.

O Render pode executar os mesmos comandos manualmente:

```bash
npm run build
npm start
```

### Frontend no Netlify

O `netlify.toml` já configura:

- Diretório publicado: `dist`
- Comando de build: `npm run build`
- Redirecionamento das rotas da SPA para `/index.html`

Nas variáveis de ambiente do Netlify, configure:

```env
VITE_API_BASE_URL=https://seu-backend.onrender.com
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=admin
```

`VITE_API_BASE_URL` deve apontar apenas para a origem do backend, sem acrescentar `/api` ao final. O frontend monta automaticamente os endpoints `/api/status` e `/api/perguntas/gerar`.

### Ordem recomendada do deploy

1. Faça o deploy do backend no Render e copie a URL pública, por exemplo `https://desafio-do-saber-api.onrender.com`.
2. Configure `GROQ_API_KEY` no Render e confirme que `https://seu-backend.onrender.com/api/status` retorna JSON.
3. No Netlify, configure `VITE_API_BASE_URL` com a URL do backend e execute o deploy do frontend.
4. Teste login, geração de perguntas e os endpoints pelo site publicado.

## Estrutura principal

- `src/pages`: telas de login, início, configurações e partida.
- `src/components`: componentes visuais reutilizáveis.
- `src/context`: autenticação e estado completo da partida.
- `src/services`: geração de perguntas, persistência, hardware simulado e conexão com o servidor.
- `src/data`: temas, configurações padrão e banco local de perguntas.
- `src/types`: tipos compartilhados do domínio.
- `server.ts`: API Express, integração com Groq e servidor do frontend.

## Observações

- O gerador remoto valida e normaliza as perguntas antes de usá-las; em caso de falha de rede, indisponibilidade da IA ou resposta inválida, o serviço local assume automaticamente.
- A integração física via USB Serial está implementada no navegador. O firmware de exemplo está em `hardware/esp32_desafio_saber.ino`.
- Não coloque chaves de API em arquivos versionados. Use variáveis de ambiente no ambiente de execução.

## ESP32 via USB Serial

O ESP32 se comunica com o computador pelo cabo USB usando a porta serial. Não é necessário Wi-Fi, Bluetooth ou servidor adicional para os botões: o navegador recebe diretamente os eventos pela Web Serial API.

### Ligações elétricas

Use dois botões normalmente abertos:

| Função | GPIO do ESP32 | Outra conexão |
|---|---:|---|
| Jogador 1 | GPIO 18 | Botão entre GPIO 18 e GND |
| Jogador 2 | GPIO 19 | Botão entre GPIO 19 e GND |

O código usa `INPUT_PULLUP`, portanto não conecte os botões diretamente a 5 V. O ESP32 e o computador devem compartilhar o GND pelo próprio cabo USB.

### Gravar o código no ESP32

1. Abra `hardware/esp32_desafio_saber.ino` na Arduino IDE.
2. Instale o suporte da placa ESP32 pelo gerenciador de placas.
3. Selecione a placa e a porta USB correspondente.
4. Compile e faça o upload.
5. O firmware inicia a serial em **115200 baud** e envia `ESP32_READY`.

Ao pressionar os botões, o ESP32 envia uma linha por evento:

```text
BTN:1
BTN:2
```

### Conectar ao Desafio do Saber

1. Execute a aplicação com `npm run dev`.
2. Abra `http://localhost:3000` no Google Chrome ou Microsoft Edge.
3. Faça login e clique no ícone de CPU no cabeçalho.
4. Selecione a porta USB do ESP32 e autorize o acesso.
5. O ícone ficará verde quando a porta estiver conectada.
6. Inicie a partida; o primeiro botão pressionado será reconhecido como jogador 1 ou jogador 2.

O navegador precisa estar em um contexto seguro para Web Serial: `localhost` funciona localmente; em produção use HTTPS. Se o ESP32 não estiver conectado, as teclas `1` e `2` continuam disponíveis como fallback.

### Protocolo USB

O frontend aceita `BTN:1`, `BTN:2`, `PLAYER:1`, `PLAYER:2` ou apenas `1` e `2`, sempre terminados por uma quebra de linha. A velocidade deve ser `115200` baud, igual à configuração do firmware.
