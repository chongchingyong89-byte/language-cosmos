// World Shops: one shop per country, each teaching its own language habits.
// Phase 1 is playable; later phases show as "coming soon" with what they'll teach.
import { JAPAN } from './japan.js';

export const SHOPS = [
  { ...JAPAN, phase: 1, ready: true },
  { id: 'my', flag: '🇲🇾', country: 'Malaysia', name: 'Kedai Runcit & Mamak', native: 'Kedai Runcit', phase: 2,
    teaches: 'Malay counters (sebiji, sebatang, sehelai), "Apa khabar?", Manglish "lah", ordering teh tarik',
    snacks: [{ emoji: '🍛', native: 'nasi lemak' }, { emoji: '🫓', native: 'roti canai' }, { emoji: '🧋', native: 'teh tarik' }, { emoji: '🍡', native: 'kuih' }] },
  { id: 'cn', flag: '🇨🇳', country: 'China', name: 'Corner Shop', native: '小卖部', phase: 2,
    teaches: 'Measure words (个, 瓶, 张), tones in prices, paying by phone',
    snacks: [{ emoji: '🥟', native: '包子' }, { emoji: '🍢', native: '糖葫芦' }, { emoji: '🌻', native: '瓜子' }, { emoji: '🌶️', native: '辣条' }] },
  { id: 'kr', flag: '🇰🇷', country: 'Korea', name: 'Convenience Store', native: '편의점', phase: 3,
    teaches: 'Speech levels (-요 vs plain), two number systems, "nunchi" moments',
    snacks: [{ emoji: '🍙', native: '삼각김밥' }, { emoji: '🍢', native: '떡볶이' }, { emoji: '🍌', native: '바나나우유' }, { emoji: '🍜', native: '컵라면' }] },
  { id: 'th', flag: '🇹🇭', country: 'Thailand', name: 'Night Market', native: 'ตลาดนัด', phase: 3,
    teaches: 'Polite particles ครับ/ค่ะ, tones, classifiers, "kreng jai"',
    snacks: [{ emoji: '🥭', native: 'ข้าวเหนียวมะม่วง' }, { emoji: '🧋', native: 'ชาเย็น' }, { emoji: '🍢', native: 'หมูปิ้ง' }, { emoji: '🥥', native: 'ไอติมกะทิ' }] },
  { id: 'in', flag: '🇮🇳', country: 'India', name: 'Kirana Store', native: 'किराना', phase: 4,
    teaches: 'Hindi numbers, aap/tum/tu, friendly bargaining',
    snacks: [{ emoji: '🥟', native: 'समोसा' }, { emoji: '☕', native: 'चाय' }, { emoji: '🍥', native: 'जलेबी' }, { emoji: '🍪', native: 'biscuits' }] },
  { id: 'fr', flag: '🇫🇷', country: 'France', name: 'Boulangerie', native: 'Boulangerie', phase: 4,
    teaches: 'The "Bonjour" rule, tu vs vous, quatre-vingt numbers',
    snacks: [{ emoji: '🥐', native: 'croissant' }, { emoji: '🥖', native: 'baguette' }, { emoji: '🍫', native: 'pain au chocolat' }, { emoji: '🍬', native: 'macarons' }] },
  { id: 'mx', flag: '🇲🇽', country: 'Mexico', name: 'Tiendita', native: 'Tiendita', phase: 4,
    teaches: 'Tú vs usted, cute diminutives (-ito), "se me cayó"',
    snacks: [{ emoji: '🌮', native: 'tacos' }, { emoji: '🌽', native: 'elote' }, { emoji: '🍬', native: 'tamarindo' }, { emoji: '🍞', native: 'conchas' }] },
];
