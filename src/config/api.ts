/**
 * Configuração da URL base da API
 * Suporta execução local, no AI Studio ou quando o frontend estiver no Netlify
 * apontando para o backend no Render (configurável via VITE_API_BASE_URL ou localStorage).
 */

const STORAGE_KEY = 'desafio_saber_api_url';

export function getApiBaseUrl(): string {
  // 1. Checa se o usuário configurou manualmente no navegador (para facilidade de teste)
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, '');
  }

  // 2. Checa variável de ambiente do Vite (ex: configurada no Netlify)
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Padrão: rota relativa (mesma origem)
  return '';
}

export function setCustomApiBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (!url.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    }
  }
}

export function buildApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}
