/**
 * Text formatting utility to replace hardcoded pet name with the user-defined pet name.
 */
export const replacePetName = (text: string, petName?: string): string => {
  if (!text) return '';
  const cleanName = (petName || '').trim();
  if (!cleanName || cleanName === 'Финни') return text;

  return text
    .replace(/У Финни\b/g, `У ${cleanName}`)
    .replace(/у Финни\b/g, `у ${cleanName}`)
    .replace(/за Финни\b/g, `за ${cleanName}`)
    .replace(/для Финни\b/g, `для ${cleanName}`)
    .replace(/от Финни\b/g, `от ${cleanName}`)
    .replace(/к Финни\b/g, `к ${cleanName}`)
    .replace(/Финни\b/g, cleanName)
    .replace(/финни\b/g, cleanName);
};
