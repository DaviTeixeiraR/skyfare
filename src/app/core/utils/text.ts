/** Remove acentos e caixa para comparar textos em buscas ("São Paulo" casa com "sao paulo"). */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
