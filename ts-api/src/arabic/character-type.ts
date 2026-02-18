export enum CharacterType {
  Alif,
  Ba,
  Ta,
  Tha,
  Jeem,
  HHa,
  Kha,
  Dal,
  Thal,
  Ra,
  Zain,
  Seen,
  Sheen,
  Sad,
  DDad,
  TTa,
  DTha,
  Ain,
  Ghain,
  Fa,
  Qaf,
  Kaf,
  Lam,
  Meem,
  Noon,
  Ha,
  Waw,
  Ya,
  Hamza,
  AlifMaksura,
  TaMarbuta,
  Tatweel,
  SmallHighSeen,
  SmallHighRoundedZero,
  SmallHighUprightRectangularZero,
  SmallHighMeemIsolatedForm,
  SmallLowSeen,
  SmallWaw,
  SmallYa,
  SmallHighNoon,
  EmptyCentreLowStop,
  EmptyCentreHighStop,
  RoundedHighStopWithFilledCentre,
  SmallLowMeem,
  Placeholder
}

const PHONETIC_NAME_BY_TYPE: Array<string | undefined> = [
  'alif',
  'bā',
  'tā',
  'thā',
  'jīm',
  'ḥā',
  'khā',
  'dāl',
  'dhāl',
  'rā',
  'zāy',
  'sīn',
  'shīn',
  'ṣād',
  'ḍād',
  'ṭā',
  'ẓā',
  'ʿayn',
  'ghayn',
  'fā',
  'qāf',
  'kāf',
  'lām',
  'mīm',
  'nūn',
  'hā',
  'wāw',
  'yā',
  'hamza'
];

export function getPhoneticName(characterType: CharacterType): string | undefined {
  return PHONETIC_NAME_BY_TYPE[characterType];
}

export function getPhoneticRoot(characterType: CharacterType): string | undefined {
  if (characterType === CharacterType.Alif) {
    return PHONETIC_NAME_BY_TYPE[CharacterType.Hamza];
  }

  return PHONETIC_NAME_BY_TYPE[characterType];
}
