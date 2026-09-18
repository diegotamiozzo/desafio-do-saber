import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const configuredUser = process.env.ADMIN_USER?.trim();
  const configuredPassword = process.env.ADMIN_PASS;
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!configuredUser || !configuredPassword) {
    return res.status(503).json({
      success: false,
      error: 'Credenciais administrativas não configuradas no servidor.',
    });
  }

  if (username !== configuredUser || password !== configuredPassword) {
    return res.status(401).json({
      success: false,
      error: 'Usuário ou senha incorretos.',
    });
  }

  return res.json({ success: true, user: configuredUser });
});

// Inicializa o cliente Groq de forma segura
let groqClient: Groq | null = null;
function getGroq(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Endpoint de verificação de status da API
app.get('/api/status', (req, res) => {
  const groq = getGroq();
  res.json({
    status: 'ok',
    aiAvailable: Boolean(groq),
    provider: 'Groq',
    model: 'openai/gpt-oss-20b',
  });
});

// Endpoint para gerar perguntas inéditas via Groq (modelo openai/gpt-oss-20b)
app.post('/api/perguntas/gerar', async (req, res) => {
  const { tema = 'Animais', temaPersonalizado, contexto, dificuldade = 'facil' } = req.body || {};
  const requestedQuantity = Number(req.body?.quantidade);
  const quantidade = [4, 8, 12].includes(requestedQuantity) ? requestedQuantity : 8;
  const groq = getGroq();

  const finalTheme = (tema === 'Personalizado' && temaPersonalizado) ? temaPersonalizado : tema;

  if (!groq) {
    return res.status(503).json({
      success: false,
      error: 'GROQ_API_KEY não configurada no servidor.',
    });
  }

  try {
    const contextPromptPart = contexto && contexto.trim()
      ? `\n*** ATENÇÃO MÁXIMA E OBRIGATÓRIA AO CONTEXTO DEFINIDO PELO MEDIADOR ***:
O mediador solicitou explicitamente que as perguntas sejam sobre: "${contexto.trim()}".
TODAS AS ${quantidade} PERGUNTAS DEVEM SER OBRIGATORIAMENTE E ESPECIFICAMENTE SOBRE "${contexto.trim()}".
Por exemplo, se o assunto for um estado ou cultura como "Rio Grande do Sul", crie perguntas sobre suas cidades (ex: Porto Alegre, Gramado), símbolos (quero-quero, cavalo crioulo), culinária (chimarrão, churrasco), geografia (pampa, serras), trajes (bombacha) e curiosidades infantis sobre o Rio Grande do Sul. Não misture com outros assuntos não relacionados.`
      : '';

    const systemPrompt = `Você é um educador especialista em jogos educativos infantis (para crianças de 6 a 12 anos) em língua portuguesa (Brasil).
Crie exatamente ${quantidade} perguntas de múltipla escolha educativas, seguras, lúdicas e divertidas.
Você deve responder ESTRITAMENTE em formato JSON com a raiz {"perguntas": [...]}.`;

    const userPrompt = `Gere exatamente ${quantidade} perguntas de múltipla escolha infantis com as configurações abaixo:

- Tema Base: ${finalTheme}${contextPromptPart}
- Nível de Dificuldade: ${dificuldade === 'facil' ? 'Fácil (para crianças pequenas, linguagem simples e direta)' : dificuldade === 'medio' ? 'Médio (perguntas curiosas que estimulam o raciocínio)' : 'Difícil (desafiadoras e interessantes para crianças mais velhas)'}
- Quantidade: Exatamente ${quantidade} perguntas.

Regras Estritas:
1. Todas as perguntas devem focar diretamente no contexto e tema solicitado.
2. 100% apropriadas e seguras para crianças (sem violência, medo ou conteúdo adulto).
3. Não repita perguntas nem conceitos semelhantes no mesmo lote.
4. Cada pergunta deve ter exatamente 4 alternativas curtas (A, B, C, D), com apenas 1 correta.
5. Inclua uma curiosidade educativa curta para cada pergunta.
6. Retorne estritamente um JSON estruturado com os campos:
{
  "perguntas": [
    {
      "id": 1,
      "pergunta": "Texto da pergunta?",
      "alternativas": [
        { "id": "A", "texto": "Opção 1" },
        { "id": "B", "texto": "Opção 2" },
        { "id": "C", "texto": "Opção 3" },
        { "id": "D", "texto": "Opção 4" }
      ],
      "respostaCorreta": "A",
      "curiosidade": "Curiosidade rápida sobre o tema",
      "tema": "${finalTheme}"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.65,
      max_completion_tokens: 6000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da API Groq');
    }

    const parsed = JSON.parse(content);
    const rawList = Array.isArray(parsed.perguntas) ? parsed.perguntas : Array.isArray(parsed.questions) ? parsed.questions : null;
    if (!rawList || rawList.length === 0) {
      throw new Error('Formato retornado inválido pela Groq');
    }

    // Normalização para garantir IDs sequenciais e estrutura completa
    const normalized = rawList.map((q: any, idx: number) => {
      let alternatives = Array.isArray(q.alternativas) ? q.alternativas : Array.isArray(q.opcoes) ? q.opcoes : [];

      // Se opções vierem como lista simples de strings: ["A", "B", "C", "D"]
      if (alternatives.length > 0 && typeof alternatives[0] === 'string') {
        alternatives = alternatives.slice(0, 4).map((str: string, aIdx: number) => ({
          id: ['A', 'B', 'C', 'D'][aIdx] as 'A' | 'B' | 'C' | 'D',
          texto: str,
        }));
      }

      const validAlternatives = (['A', 'B', 'C', 'D'] as const).map((letter, letterIdx) => {
        const found = alternatives.find((a: any) => a.id === letter || a.letra === letter);
        const text = found ? String(found.texto || found.text || '').trim() : (alternatives[letterIdx]?.texto || alternatives[letterIdx] || `Opção ${letter}`);
        return {
          id: letter,
          texto: String(text).trim(),
        };
      });

      let correctLetter: 'A' | 'B' | 'C' | 'D' = 'A';
      const rawCorrect = String(q.respostaCorreta || q.resposta_correta || q.resposta || '').toUpperCase().trim();
      if (['A', 'B', 'C', 'D'].includes(rawCorrect)) {
        correctLetter = rawCorrect as 'A' | 'B' | 'C' | 'D';
      } else {
        const matchAlt = validAlternatives.find((a) => a.texto.toLowerCase() === rawCorrect.toLowerCase());
        if (matchAlt) {
          correctLetter = matchAlt.id;
        }
      }

      return {
        id: idx + 1,
        pergunta: String(q.pergunta || q.question || '').trim(),
        alternativas: validAlternatives,
        respostaCorreta: correctLetter,
        dificuldade,
        tema: String(q.tema || finalTheme).trim(),
        curiosidade: q.curiosidade ? String(q.curiosidade).trim() : undefined,
      };
    });

    return res.json({
      success: true,
      source: 'groq',
      perguntas: normalized.slice(0, quantidade),
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.warn('Groq API retornou erro:', errorMsg);

    const isRateLimit = errorMsg.includes('429') || errorMsg.includes('rate_limit') || errorMsg.includes('Rate limit');
    const notice = isRateLimit
      ? 'Limite temporário por minuto da Groq atingido. Tente novamente mais tarde.'
      : 'IA Groq temporariamente indisponível. Tente novamente mais tarde.';

    return res.status(isRateLimit ? 429 : 502).json({
      success: false,
      error: errorMsg,
      notice,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Desafio do Saber rodando na porta ${PORT}`);
  });
}

startServer();
