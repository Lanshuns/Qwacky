export const compareTags = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'base' }) || a.localeCompare(b)
