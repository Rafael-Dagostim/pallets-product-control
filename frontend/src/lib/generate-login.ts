export function generateLogin(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const digits = Math.floor(Math.random() * 900 + 100).toString();
  return base + digits;
}
