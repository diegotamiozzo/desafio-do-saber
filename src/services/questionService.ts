import { GameConfig, Question, QuestionCount } from '../types';

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
 * GroqQuestionService
 * Chama o backend com a API Groq para gerar a quantidade configurada de perguntas.
 */
export class GroqQuestionService implements IQuestionService {
  public lastGenerationSource: 'groq' = 'groq';
  public lastNotice?: string;

  public validateQuestion(question: Partial<Question>): ValidationResult {
    return validateQuestion(question);
  }

  public validateQuestionsList(questions: Question[], expectedCount?: QuestionCount): ValidationResult {
    return validateQuestionsList(questions, expectedCount);
  }

  public async generateQuestions(config: GameConfig): Promise<Question[]> {
    try {
      const response = await fetch('/api/perguntas/gerar', {
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

      if (data.source === 'groq' && Array.isArray(data.perguntas)) {
        const qs = data.perguntas as Question[];
        const validation = this.validateQuestionsList(qs, config.quantidade);
        if (validation.valid) {
          this.lastGenerationSource = 'groq';
          this.lastNotice = undefined;
          return qs;
        }
        throw new Error(`Perguntas inválidas recebidas da API Groq: ${validation.errors.join(' ')}`);
      }

      throw new Error(data.notice || data.error || 'A API Groq não retornou perguntas válidas.');
    } catch (err) {
      this.lastNotice = err instanceof Error ? err.message : 'Não foi possível gerar perguntas pela API Groq.';
      throw err;
    }
  }
}

export const questionService = new GroqQuestionService();
