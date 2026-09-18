var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_groq_sdk = __toESM(require("groq-sdk"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var groqClient = null;
function getGroq() {
  const apiKey = process.env.GROQ_API_KEY || process.env.ROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!groqClient) {
    groqClient = new import_groq_sdk.default({ apiKey });
  }
  return groqClient;
}
app.get("/api/status", (req, res) => {
  const groq = getGroq();
  res.json({
    status: "ok",
    aiAvailable: Boolean(groq),
    provider: "Groq",
    model: "openai/gpt-oss-20b"
  });
});
app.post("/api/perguntas/gerar", async (req, res) => {
  const { tema = "Animais", temaPersonalizado, contexto, dificuldade = "facil" } = req.body || {};
  const requestedQuantity = Number(req.body?.quantidade);
  const quantidade = [4, 8, 12].includes(requestedQuantity) ? requestedQuantity : 8;
  const groq = getGroq();
  const finalTheme = tema === "Personalizado" && temaPersonalizado ? temaPersonalizado : tema;
  if (!groq) {
    return res.json({
      success: true,
      source: "mock",
      message: "GROQ_API_KEY n\xE3o configurada. Utilizando banco local curado.",
      perguntas: null
    });
  }
  try {
    const contextPromptPart = contexto && contexto.trim() ? `
*** ATEN\xC7\xC3O M\xC1XIMA E OBRIGAT\xD3RIA AO CONTEXTO DEFINIDO PELO MEDIADOR ***:
O mediador solicitou explicitamente que as perguntas sejam sobre: "${contexto.trim()}".
TODAS AS ${quantidade} PERGUNTAS DEVEM SER OBRIGATORIAMENTE E ESPECIFICAMENTE SOBRE "${contexto.trim()}".
Por exemplo, se o assunto for um estado ou cultura como "Rio Grande do Sul", crie perguntas sobre suas cidades (ex: Porto Alegre, Gramado), s\xEDmbolos (quero-quero, cavalo crioulo), culin\xE1ria (chimarr\xE3o, churrasco), geografia (pampa, serras), trajes (bombacha) e curiosidades infantis sobre o Rio Grande do Sul. N\xE3o misture com outros assuntos n\xE3o relacionados.` : "";
    const systemPrompt = `Voc\xEA \xE9 um educador especialista em jogos educativos infantis (para crian\xE7as de 6 a 12 anos) em l\xEDngua portuguesa (Brasil).
Crie exatamente ${quantidade} perguntas de m\xFAltipla escolha educativas, seguras, l\xFAdicas e divertidas.
Voc\xEA deve responder ESTRITAMENTE em formato JSON com a raiz {"perguntas": [...]}.`;
    const userPrompt = `Gere exatamente ${quantidade} perguntas de m\xFAltipla escolha infantis com as configura\xE7\xF5es abaixo:

- Tema Base: ${finalTheme}${contextPromptPart}
- N\xEDvel de Dificuldade: ${dificuldade === "facil" ? "F\xE1cil (para crian\xE7as pequenas, linguagem simples e direta)" : dificuldade === "medio" ? "M\xE9dio (perguntas curiosas que estimulam o racioc\xEDnio)" : "Dif\xEDcil (desafiadoras e interessantes para crian\xE7as mais velhas)"}
- Quantidade: Exatamente ${quantidade} perguntas.

Regras Estritas:
1. Todas as perguntas devem focar diretamente no contexto e tema solicitado.
2. 100% apropriadas e seguras para crian\xE7as (sem viol\xEAncia, medo ou conte\xFAdo adulto).
3. N\xE3o repita perguntas nem conceitos semelhantes no mesmo lote.
4. Cada pergunta deve ter exatamente 4 alternativas curtas (A, B, C, D), com apenas 1 correta.
5. Inclua uma curiosidade educativa curta para cada pergunta.
6. Retorne estritamente um JSON estruturado com os campos:
{
  "perguntas": [
    {
      "id": 1,
      "pergunta": "Texto da pergunta?",
      "alternativas": [
        { "id": "A", "texto": "Op\xE7\xE3o 1" },
        { "id": "B", "texto": "Op\xE7\xE3o 2" },
        { "id": "C", "texto": "Op\xE7\xE3o 3" },
        { "id": "D", "texto": "Op\xE7\xE3o 4" }
      ],
      "respostaCorreta": "A",
      "curiosidade": "Curiosidade r\xE1pida sobre o tema",
      "tema": "${finalTheme}"
    }
  ]
}`;
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.65,
      max_completion_tokens: 6e3
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia da API Groq");
    }
    const parsed = JSON.parse(content);
    const rawList = Array.isArray(parsed.perguntas) ? parsed.perguntas : Array.isArray(parsed.questions) ? parsed.questions : null;
    if (!rawList || rawList.length === 0) {
      throw new Error("Formato retornado inv\xE1lido pela Groq");
    }
    const normalized = rawList.map((q, idx) => {
      let alternatives = Array.isArray(q.alternativas) ? q.alternativas : Array.isArray(q.opcoes) ? q.opcoes : [];
      if (alternatives.length > 0 && typeof alternatives[0] === "string") {
        alternatives = alternatives.slice(0, 4).map((str, aIdx) => ({
          id: ["A", "B", "C", "D"][aIdx],
          texto: str
        }));
      }
      const validAlternatives = ["A", "B", "C", "D"].map((letter, letterIdx) => {
        const found = alternatives.find((a) => a.id === letter || a.letra === letter);
        const text = found ? String(found.texto || found.text || "").trim() : alternatives[letterIdx]?.texto || alternatives[letterIdx] || `Op\xE7\xE3o ${letter}`;
        return {
          id: letter,
          texto: String(text).trim()
        };
      });
      let correctLetter = "A";
      const rawCorrect = String(q.respostaCorreta || q.resposta_correta || q.resposta || "").toUpperCase().trim();
      if (["A", "B", "C", "D"].includes(rawCorrect)) {
        correctLetter = rawCorrect;
      } else {
        const matchAlt = validAlternatives.find((a) => a.texto.toLowerCase() === rawCorrect.toLowerCase());
        if (matchAlt) {
          correctLetter = matchAlt.id;
        }
      }
      return {
        id: idx + 1,
        pergunta: String(q.pergunta || q.question || "").trim(),
        alternativas: validAlternatives,
        respostaCorreta: correctLetter,
        dificuldade,
        tema: String(q.tema || finalTheme).trim(),
        curiosidade: q.curiosidade ? String(q.curiosidade).trim() : void 0
      };
    });
    return res.json({
      success: true,
      source: "groq",
      perguntas: normalized.slice(0, quantidade)
    });
  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.warn("Groq API retornou erro:", errorMsg);
    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("rate_limit") || errorMsg.includes("Rate limit");
    const notice = isRateLimit ? "Limite tempor\xE1rio por minuto da Groq atingido. O gerador inteligente local garantiu as perguntas sobre o seu tema." : "IA Groq temporariamente indispon\xEDvel. Ativando gerador tem\xE1tico inteligente.";
    return res.json({
      success: true,
      source: "smart_local",
      error: errorMsg,
      notice,
      perguntas: null
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Desafio do Saber rodando na porta ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
