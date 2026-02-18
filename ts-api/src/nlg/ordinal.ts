const ORDINALS = [
  'zeroth',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
  'sixteenth',
  'seventeenth',
  'eighteenth',
  'nineteenth',
  'twentieth'
] as const;

export function getShortName(value: number): string {
  const digit = value % 100;
  let suffix = 'th';

  if (!(digit >= 11 && digit <= 13)) {
    switch (value % 10) {
      case 1:
        suffix = 'st';
        break;
      case 2:
        suffix = 'nd';
        break;
      case 3:
        suffix = 'rd';
        break;
      default:
        suffix = 'th';
    }
  }

  return `${value}${suffix}`;
}

export function getLongName(value: number): string {
  return value < ORDINALS.length ? (ORDINALS[value] ?? getShortName(value)) : getShortName(value);
}
