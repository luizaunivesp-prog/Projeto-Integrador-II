// URL do backend. Em produção, o Vite substitui import.meta.env.VITE_API_URL
// pelo valor configurado no serviço de hospedagem (ex: Vercel/Netlify).
// Localmente, se essa variável não existir, cai no localhost de sempre.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
