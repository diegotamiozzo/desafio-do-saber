import { GameConfig, Question, QuestionCount } from '../types';
import { MOCK_QUESTIONS_BANK } from '../data/mockQuestions';
import { buildApiUrl } from '../config/api';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IQuestionService {
  generateQuestions(config: GameConfig): Promise<Question[]>;
  validateQuestion(question: Partial<Question>): ValidationResult;
  validateQuestionsList(questions: Question[], expectedCount?: QuestionCount): ValidationResult;
}

/**
 * Validação rigorosa para garantir perguntas no formato exigido e seguras para crianças.
 */
export function validateQuestion(q: Partial<Question>): ValidationResult {
  const errors: string[] = [];

  if (!q.pergunta || typeof q.pergunta !== 'string' || q.pergunta.trim().length < 5) {
    errors.push('A pergunta precisa ter um texto válido com pelo menos 5 caracteres.');
  }

  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) {
    errors.push('A pergunta deve conter exatamente 4 alternativas (A, B, C, D).');
  } else {
    const ids = q.alternativas.map((a) => a.id);
    const expectedIds = ['A', 'B', 'C', 'D'];
    const hasAllIds = expectedIds.every((id) => ids.includes(id as 'A' | 'B' | 'C' | 'D'));
    if (!hasAllIds) {
      errors.push('As alternativas devem ter IDs "A", "B", "C" e "D".');
    }

    const hasEmptyText = q.alternativas.some((a) => !a.texto || typeof a.texto !== 'string' || a.texto.trim().length === 0);
    if (hasEmptyText) {
      errors.push('Todas as alternativas devem ter um texto não vazio.');
    }
  }

  if (!q.respostaCorreta || !['A', 'B', 'C', 'D'].includes(q.respostaCorreta)) {
    errors.push('A resposta correta deve ser uma das alternativas válidas ("A", "B", "C" ou "D").');
  }

  if (!q.dificuldade || !['facil', 'medio', 'dificil'].includes(q.dificuldade)) {
    errors.push('A dificuldade deve ser "facil", "medio" ou "dificil".');
  }

  if (!q.tema || typeof q.tema !== 'string' || q.tema.trim().length === 0) {
    errors.push('O tema da pergunta não pode ser vazio.');
  }

  // Verificação de segurança infantil básica (filtro de palavras proibidas)
  const forbidden = ['violência', 'arma', 'sangue', 'morte', 'crime', 'droga'];
  const textToCheck = `${q.pergunta || ''} ${q.alternativas?.map((a) => a.texto).join(' ') || ''}`.toLowerCase();
  for (const word of forbidden) {
    if (textToCheck.includes(word)) {
      errors.push(`Conteúdo impróprio para crianças detectado: "${word}".`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateQuestionsList(questions: Question[], expectedCount: QuestionCount = 8): ValidationResult {
  const allErrors: string[] = [];

  if (!Array.isArray(questions)) {
    return { valid: false, errors: ['A lista de perguntas é inválida.'] };
  }

  if (questions.length !== expectedCount) {
    allErrors.push(`A lista deve conter exatamente ${expectedCount} perguntas. Foram encontradas ${questions.length}.`);
  }

  questions.forEach((q, idx) => {
    const res = validateQuestion(q);
    if (!res.valid) {
      allErrors.push(`Pergunta #${idx + 1}: ${res.errors.join('; ')}`);
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Normaliza strings para busca sem acentos e minúsculas
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica relevância de uma pergunta para um determinado contexto textual
 */
function calculateQuestionRelevance(q: Question, contextNormalized: string): number {
  if (!contextNormalized) return 0;

  const fullQuestionText = normalizeText(
    `${q.pergunta} ${q.tema} ${q.curiosidade || ''} ${q.alternativas.map((a) => a.texto).join(' ')}`
  );

  // Verificações específicas para termos regionais (ex: Rio Grande do Sul)
  const isRSContext =
    contextNormalized.includes('rio grande do sul') ||
    contextNormalized.includes('rs') ||
    contextNormalized.includes('gaucho') ||
    contextNormalized.includes('porto alegre') ||
    contextNormalized.includes('pampa') ||
    contextNormalized.includes('chimarrao');

  if (isRSContext) {
    if (q.tema.toLowerCase().includes('rio grande do sul')) {
      return 100;
    }
    const rsTerms = ['porto alegre', 'chimarrao', 'quero-quero', 'gaucho', 'churrasco', 'pampa', 'gaita', 'bombacha', 'pinhao', 'cavalo crioulo', 'gramado', 'sul'];
    for (const term of rsTerms) {
      if (fullQuestionText.includes(term)) {
        return 80;
      }
    }
  }

  // Busca por termos específicos presentes no contexto
  const words = contextNormalized
    .split(/[\s,.-]+/)
    .filter((w) => w.length > 2 && !['para', 'com', 'que', 'dos', 'das', 'uma', 'sobre'].includes(w));

  let score = 0;
  for (const word of words) {
    if (fullQuestionText.includes(word)) {
      score += 20;
    }
  }

  return score;
}

/**
 * MockQuestionService
 * Gera a quantidade configurada de perguntas infantis, priorizando rigorosamente o contexto e tema.
 */
export class MockQuestionService implements IQuestionService {
  public validateQuestion(question: Partial<Question>): ValidationResult {
    return validateQuestion(question);
  }

  public validateQuestionsList(questions: Question[], expectedCount?: QuestionCount): ValidationResult {
    return validateQuestionsList(questions, expectedCount);
  }

  public async generateQuestions(config: GameConfig): Promise<Question[]> {
    // Simula pequena latência para feedback de carregamento
    await new Promise((resolve) => setTimeout(resolve, 400));

    const targetTheme = config.tema === 'Personalizado' && config.temaPersonalizado.trim()
      ? config.temaPersonalizado.trim()
      : config.tema;

    const rawContext = [config.contexto, config.temaPersonalizado].filter(Boolean).join(' ');
    const contextNormalized = normalizeText(rawContext);

    // 1. Classifica todo o banco de perguntas por relevância ao contexto
    const scoredQuestions = MOCK_QUESTIONS_BANK.map((q) => ({
      question: q,
      relevance: calculateQuestionRelevance(q, contextNormalized),
    }));

    // Separa as perguntas que têm relação direta com o contexto
    const directMatches = scoredQuestions
      .filter((sq) => sq.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map((sq) => sq.question);

    let selected: Question[] = [];

    if (directMatches.length >= config.quantidade) {
      // Temos perguntas suficientes do próprio contexto no banco (como Rio Grande do Sul!)
      selected = directMatches.slice(0, config.quantidade);
    } else if (directMatches.length > 0) {
      // Usa todas as perguntas do contexto encontradas
      selected = [...directMatches];

      // Completa com perguntas do mesmo tema ou gerais
      const remainingBank = MOCK_QUESTIONS_BANK.filter(
        (q) => !selected.some((sq) => sq.id === q.id)
      );

      // Filtra por tema
      const sameTheme = remainingBank.filter(
        (q) => q.tema.toLowerCase() === targetTheme.toLowerCase()
      );

      const toAdd = [...sameTheme, ...remainingBank];
      for (const q of toAdd) {
        if (selected.length >= config.quantidade) break;
        if (!selected.some((sq) => sq.id === q.id)) {
          selected.push(q);
        }
      }
    } else {
      // Nenhum termo específico encontrado no banco, filtra por tema
      let themeFiltered = MOCK_QUESTIONS_BANK.filter((q) => {
        if (targetTheme === 'Conhecimentos Gerais' || targetTheme === 'Curiosidades') {
          return true;
        }
        return q.tema.toLowerCase() === targetTheme.toLowerCase();
      });

      if (themeFiltered.length < config.quantidade) {
        const others = MOCK_QUESTIONS_BANK.filter((q) => !themeFiltered.some((tf) => tf.id === q.id));
        themeFiltered = [...themeFiltered, ...others];
      }

      // Embaralha
      selected = [...themeFiltered].sort(() => Math.random() - 0.5).slice(0, config.quantidade);
    }

    // 2. Ajusta IDs, formata tema e embaralha alternativas
    const result: Question[] = selected.slice(0, config.quantidade).map((q, index) => {
      const questionTema = targetTheme || q.tema;

      const correctAlternativeText =
        q.alternativas.find((a) => a.id === q.respostaCorreta)?.texto || q.alternativas[0].texto;

      const textsShuffled = [...q.alternativas.map((a) => a.texto)].sort(() => Math.random() - 0.5);

      const newAlternatives = (['A', 'B', 'C', 'D'] as const).map((letter, i) => ({
        id: letter,
        texto: textsShuffled[i],
      }));

      const newCorrectLetter =
        newAlternatives.find((a) => a.texto === correctAlternativeText)?.id || 'A';

      const adaptedQuestion: Question = {
        id: index + 1,
        pergunta: q.pergunta,
        alternativas: newAlternatives,
        respostaCorreta: newCorrectLetter,
        dificuldade: config.dificuldade,
        tema: q.tema === 'Rio Grande do Sul' ? 'Rio Grande do Sul' : questionTema,
        emoji: q.emoji || '⭐',
        curiosidade: q.curiosidade,
      };

      return adaptedQuestion;
    });

    const validation = this.validateQuestionsList(result, config.quantidade);
    if (!validation.valid) {
      console.warn('Erros na validação de perguntas locais:', validation.errors);
    }

    return result;
  }
}

export interface GenerationResponseData {
  questions: Question[];
  source: 'groq' | 'gemini' | 'smart_offline';
  notice?: string;
}

/**
 * GroqQuestionService
 * Chama o backend com a API Groq para gerar a quantidade configurada de perguntas.
 * Se houver qualquer indisponibilidade de rede, recorre automaticamente ao gerador context-aware inteligente.
 */
export class GroqQuestionService implements IQuestionService {
  private fallbackService = new MockQuestionService();
  public lastGenerationSource: 'groq' | 'gemini' | 'smart_offline' = 'smart_offline';
  public lastNotice?: string;

  public validateQuestion(question: Partial<Question>): ValidationResult {
    return validateQuestion(question);
  }

  public validateQuestionsList(questions: Question[], expectedCount?: QuestionCount): ValidationResult {
    return validateQuestionsList(questions, expectedCount);
  }

  public async generateQuestions(config: GameConfig): Promise<Question[]> {
    try {
      const response = await fetch(buildApiUrl('/api/perguntas/gerar'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tema: config.tema,
          temaPersonalizado: config.temaPersonalizado,
          contexto: config.contexto,
          dificuldade: config.dificuldade,
          quantidade: config.quantidade,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: HTTP ${response.status}`);
      }

      const data = await response.json();

      if ((data.source === 'groq' || data.source === 'gemini') && Array.isArray(data.perguntas) && data.perguntas.length >= config.quantidade) {
        let qs: Question[] = data.perguntas;
        if (qs.length < config.quantidade) {
          const fallbackQs = await this.fallbackService.generateQuestions(config);
          const needed = config.quantidade - qs.length;
          qs = [...qs, ...fallbackQs.slice(0, needed)].map((q, idx) => ({ ...q, id: idx + 1 }));
        }
        const validation = this.validateQuestionsList(qs.slice(0, config.quantidade), config.quantidade);
        if (validation.valid) {
          this.lastGenerationSource = data.source === 'gemini' ? 'gemini' : 'groq';
          this.lastNotice = undefined;
          return qs.slice(0, config.quantidade);
        }
      }

      if (data.source === 'smart_local' && Array.isArray(data.perguntas) && data.perguntas.length === config.quantidade) {
        this.lastGenerationSource = 'smart_offline';
        this.lastNotice = data.notice || data.error;
        return data.perguntas;
      }

      if (data.error) {
        this.lastNotice = data.notice || 'IA temporariamente indisponível. Gerador contextual ativado.';
      }
    } catch (err) {
      console.warn('Comunicação com API Groq indisponível, acionando gerador contextual local:', err);
    }

    this.lastGenerationSource = 'smart_offline';
    return this.fallbackService.generateQuestions(config);
  }
}

// Exporta o serviço ativo com Groq AI e fallback contextual
export const questionService = new GroqQuestionService();
