import { CharacterType } from '../../character-type.js';
import { DiacriticType } from '../../diacritic-type.js';
import { EncodingTableBase } from '../encoding-table-base.js';
import { UnicodeType } from './unicode-type.js';

const c = (value: number): string => String.fromCharCode(value);

export class UnicodeTable extends EncodingTableBase {
  static readonly UNICODE_TABLE = new UnicodeTable();

  private constructor() {
    super();
    this.addCharacter(UnicodeType.Hamza, c(1569), CharacterType.Hamza);
    this.addItem(UnicodeType.AlifWithMaddah, c(1570), CharacterType.Alif, DiacriticType.Maddah);
    this.addItem(UnicodeType.AlifWithHamzaAbove, c(1571), CharacterType.Alif, DiacriticType.HamzaAbove);
    this.addItem(UnicodeType.WawWithHamzaAbove, c(1572), CharacterType.Waw, DiacriticType.HamzaAbove);
    this.addItem(UnicodeType.AlifWithHamzaBelow, c(1573), CharacterType.Alif, DiacriticType.HamzaBelow);
    this.addItem(UnicodeType.YaWithHamzaAbove, c(1574), CharacterType.Ya, DiacriticType.HamzaAbove);
    this.addCharacter(UnicodeType.Alif, c(1575), CharacterType.Alif);
    this.addCharacter(UnicodeType.Ba, c(1576), CharacterType.Ba);
    this.addCharacter(UnicodeType.TaMarbuta, c(1577), CharacterType.TaMarbuta);
    this.addCharacter(UnicodeType.Ta, c(1578), CharacterType.Ta);
    this.addCharacter(UnicodeType.Tha, c(1579), CharacterType.Tha);
    this.addCharacter(UnicodeType.Jeem, c(1580), CharacterType.Jeem);
    this.addCharacter(UnicodeType.HHa, c(1581), CharacterType.HHa);
    this.addCharacter(UnicodeType.Kha, c(1582), CharacterType.Kha);
    this.addCharacter(UnicodeType.Dal, c(1583), CharacterType.Dal);
    this.addCharacter(UnicodeType.Thal, c(1584), CharacterType.Thal);
    this.addCharacter(UnicodeType.Ra, c(1585), CharacterType.Ra);
    this.addCharacter(UnicodeType.Zain, c(1586), CharacterType.Zain);
    this.addCharacter(UnicodeType.Seen, c(1587), CharacterType.Seen);
    this.addCharacter(UnicodeType.Sheen, c(1588), CharacterType.Sheen);
    this.addCharacter(UnicodeType.Sad, c(1589), CharacterType.Sad);
    this.addCharacter(UnicodeType.DDad, c(1590), CharacterType.DDad);
    this.addCharacter(UnicodeType.TTa, c(1591), CharacterType.TTa);
    this.addCharacter(UnicodeType.DTha, c(1592), CharacterType.DTha);
    this.addCharacter(UnicodeType.Ain, c(1593), CharacterType.Ain);
    this.addCharacter(UnicodeType.Ghain, c(1594), CharacterType.Ghain);
    this.addCharacter(UnicodeType.Tatweel, c(1600), CharacterType.Tatweel);
    this.addCharacter(UnicodeType.Fa, c(1601), CharacterType.Fa);
    this.addCharacter(UnicodeType.Qaf, c(1602), CharacterType.Qaf);
    this.addCharacter(UnicodeType.Kaf, c(1603), CharacterType.Kaf);
    this.addCharacter(UnicodeType.Lam, c(1604), CharacterType.Lam);
    this.addCharacter(UnicodeType.Meem, c(1605), CharacterType.Meem);
    this.addCharacter(UnicodeType.Noon, c(1606), CharacterType.Noon);
    this.addCharacter(UnicodeType.Ha, c(1607), CharacterType.Ha);
    this.addCharacter(UnicodeType.Waw, c(1608), CharacterType.Waw);
    this.addCharacter(UnicodeType.AlifMaksura, c(1609), CharacterType.AlifMaksura);
    this.addCharacter(UnicodeType.Ya, c(1610), CharacterType.Ya);
    this.addDiacritic(UnicodeType.Fathatan, c(1611), DiacriticType.Fathatan);
    this.addDiacritic(UnicodeType.Dammatan, c(1612), DiacriticType.Dammatan);
    this.addDiacritic(UnicodeType.Kasratan, c(1613), DiacriticType.Kasratan);
    this.addDiacritic(UnicodeType.Fatha, c(1614), DiacriticType.Fatha);
    this.addDiacritic(UnicodeType.Damma, c(1615), DiacriticType.Damma);
    this.addDiacritic(UnicodeType.Kasra, c(1616), DiacriticType.Kasra);
    this.addDiacritic(UnicodeType.Shadda, c(1617), DiacriticType.Shadda);
    this.addDiacritic(UnicodeType.Sukun, c(1618), DiacriticType.Sukun);
    this.addDiacritic(UnicodeType.Maddah, c(1619), DiacriticType.Maddah);
    this.addDiacritic(UnicodeType.HamzaAbove, c(1620), DiacriticType.HamzaAbove);
    this.addItem(UnicodeType.AlifKhanjareeya, c(1648), null, DiacriticType.AlifKhanjareeya);
    this.addItem(UnicodeType.AlifWithHamzatWasl, c(1649), CharacterType.Alif, DiacriticType.HamzatWasl);
    this.addCharacter(UnicodeType.SmallHighSeen, c(1756), CharacterType.SmallHighSeen);
    this.addCharacter(UnicodeType.SmallHighRoundedZero, c(1759), CharacterType.SmallHighRoundedZero);
    this.addCharacter(UnicodeType.SmallHighUprightRectangularZero, c(1760), CharacterType.SmallHighUprightRectangularZero);
    this.addCharacter(UnicodeType.SmallHighMeemIsolatedForm, c(1762), CharacterType.SmallHighMeemIsolatedForm);
    this.addCharacter(UnicodeType.SmallLowSeen, c(1763), CharacterType.SmallLowSeen);
    this.addCharacter(UnicodeType.SmallWaw, c(1765), CharacterType.SmallWaw);
    this.addCharacter(UnicodeType.SmallYa, c(1766), CharacterType.SmallYa);
    this.addCharacter(UnicodeType.SmallHighNoon, c(1768), CharacterType.SmallHighNoon);
    this.addCharacter(UnicodeType.EmptyCentreLowStop, c(1770), CharacterType.EmptyCentreLowStop);
    this.addCharacter(UnicodeType.EmptyCentreHighStop, c(1771), CharacterType.EmptyCentreHighStop);
    this.addCharacter(UnicodeType.RoundedHighStopWithFilledCentre, c(1772), CharacterType.RoundedHighStopWithFilledCentre);
    this.addCharacter(UnicodeType.SmallLowMeem, c(1773), CharacterType.SmallLowMeem);
  }
}
