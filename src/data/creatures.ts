/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Creature, TimeOfDay } from '../types';

export const CREATURES: Record<string, Creature> = {
  camel: {
    id: 'camel',
    nameEn: 'Al-Jammal (Camel)',
    nameAr: 'الجَمَّال (الجمل النبطي)',
    titleEn: 'Caravan Master of the Water Trails',
    titleAr: 'دليل القوافل ومسالك الماء',
    rarity: 'Common',
    loreEn: 'Patient, tireless, and possessing ancestral memory of every hidden spring and cistern carved into the canyons. Al-Jammal guided frankincense merchants across the burning sands to Petra’s gates.',
    loreAr: 'صبور، لا يكل، ويحفظ في ذاكرته الفطرية كل نبع خفي وصهريج حُفر في بطون الجبال. قاد قوافل اللبان والبخور عبر رمال الصحراء بأمان إلى بوابات بترا.',
    icon: '🐫',
    svgArtKey: 'camel',
    traits: ['Water-Finder', 'Heavy Pack-Master', 'Desert Endurance'],
    preferredTime: 'Morning',
    startingLandmarkAffinity: 'siq'
  },
  scorpion: {
    id: 'scorpion',
    nameEn: 'Al-Aqrab (Scorpion)',
    nameAr: 'العَقْرَب (عقرب الشقوق)',
    titleEn: 'Sentinel of the Rose Shadow Shrines',
    titleAr: 'حارس المحاريب والظلال الوردية',
    rarity: 'Common',
    loreEn: 'Dwelling silently in the shaded clefts and sacred betyl niches of the canyon walls. Al-Aqrab detects every seismic tremor and protects the secret inscriptions from reckless intruders.',
    loreAr: 'يعيش في هدوء بين شقوق الصخر ومحاريب الأنصاب المقدسة في جدران الوادي. يشعر بأدق الهزات الصخرية ويحرس النقوش القديمة من المتطفلين.',
    icon: '🦂',
    svgArtKey: 'scorpion',
    traits: ['Shadow-Stalker', 'Stone Resonance', 'Night Navigation'],
    preferredTime: 'Dusk / Night',
    startingLandmarkAffinity: 'facades'
  },
  falcon: {
    id: 'falcon',
    nameEn: 'Al-Saqr (Falcon)',
    nameAr: 'الصَّقْر (صقر الأعالي)',
    titleEn: 'Sky Scout of the Mountain Ridge',
    titleAr: 'كشّاف الأعالي ورياح الجبال',
    rarity: 'Rare',
    loreEn: 'Riding the thermal winds high above Ad-Deir and the High Place of Sacrifice. Al-Saqr spots incoming desert storms hours in advance and warned ancient Nabataean watchtowers of approaching caravans.',
    loreAr: 'يمتطي التيارات الهوائية الصاعدة فوق الدير ومذبح الأضاحي العالي. يلمح العواصف القادمة من مسافات شاسعة، وكان يوقظ أبراج المراقبة النبطية لاستقبال القوافل.',
    icon: '🦅',
    svgArtKey: 'falcon',
    traits: ['Aerial Vantage', 'Storm Forecaster', 'High Vista Insight'],
    preferredTime: 'Afternoon',
    startingLandmarkAffinity: 'theatre'
  },
  ibex: {
    id: 'ibex',
    nameEn: 'Al-Badan (Nubian Ibex)',
    nameAr: 'البَدَن (الوعل النوبي الملكي)',
    titleEn: 'Sacred Horned Mountain Sovereign',
    titleAr: 'سيد الجبال ذو القرنين المقدس',
    rarity: 'Legendary',
    loreEn: 'The mythical horned sovereign depicted on ancient Nabataean pottery and royal seal rings. Agile on sheer vertical cliffs, Al-Badan only reveals itself to pilgrims who have walked the full sacred path through all five great monuments.',
    loreAr: 'السيد الجبلي ذو القرنين المعقوفين المخلد على الفخار النبطي وخواتم الملوك. يقفز بخفة على الجروف الرأسية، ولا يتجلى إلا للزائر الحكيم الذي طاف بكافة معالم بترا الخمسة.',
    icon: '🐐',
    svgArtKey: 'ibex',
    traits: ['Cliff Mastery', 'Royal Blessing', 'Ancient Lorekeeper'],
    preferredTime: 'Morning',
    startingLandmarkAffinity: 'monastery'
  }
};

/**
 * Deterministic explainable formula for opening the Satchel:
 * Inputs:
 * 1. Starting Landmark (siq: 10, treasury: 25, facades: 40, theatre: 55, monastery: 70)
 * 2. Time of Day (Morning: 5, Afternoon: 15, Dusk / Night: 25)
 * 3. Seed / Roll Value (0 - 100)
 * 4. Visited Landmarks count: If all 5 visited (>= 5), the Legendary Ibex is unlocked!
 */
export function calculateCreatureReveal(
  startingLandmarkId: string,
  timeOfDay: TimeOfDay,
  seedScore: number,
  allLandmarksVisited: boolean
): { creature: Creature; explainableFormula: string; roll: number } {
  // If visitor has completed all 5 landmarks, and opts for the pinnacle or hits high score
  if (allLandmarksVisited && (startingLandmarkId === 'monastery' || seedScore >= 40)) {
    return {
      creature: CREATURES.ibex,
      roll: seedScore,
      explainableFormula: `[Landmark: ${startingLandmarkId} (${allLandmarksVisited ? '5/5 Landmarks Cleared' : 'Incomplete'})] + [Time: ${timeOfDay}] + [Weighted Roll: ${seedScore}] ➔ Legendary Condition Met: Unlocked Al-Badan (Nubian Ibex)!`
    };
  }

  // Base landmark affinity weights
  const landmarkWeights: Record<string, number> = {
    siq: 10,
    treasury: 25,
    facades: 40,
    theatre: 55,
    monastery: 70
  };

  const timeWeights: Record<TimeOfDay, number> = {
    Morning: 10,
    Afternoon: 20,
    'Dusk / Night': 30
  };

  const lw = landmarkWeights[startingLandmarkId] || 20;
  const tw = timeWeights[timeOfDay] || 15;
  const compositeScore = (lw + tw + seedScore) % 100;

  // Falcon is Rare (unlocked when composite score >= 65 or starting landmark is theatre/monastery with good roll)
  if (compositeScore >= 65 || (startingLandmarkId === 'theatre' && timeOfDay === 'Afternoon')) {
    return {
      creature: CREATURES.falcon,
      roll: compositeScore,
      explainableFormula: `[Landmark Affinity: ${lw}] + [Time Factor: ${tw}] + [Seed Roll: ${seedScore}] = Index ${compositeScore} (Score ≥ 65) ➔ Rare Falcon (Al-Saqr) Revealed`
    };
  }

  // Scorpion is common/crevice guardian (favors Dusk / Night or Facades)
  if (timeOfDay === 'Dusk / Night' || compositeScore >= 35) {
    return {
      creature: CREATURES.scorpion,
      roll: compositeScore,
      explainableFormula: `[Landmark Affinity: ${lw}] + [Time Factor: ${tw}] + [Seed Roll: ${seedScore}] = Index ${compositeScore} (Night / Crevice Archetype) ➔ Canyon Sentinel Scorpion (Al-Aqrab) Revealed`
    };
  }

  // Default desert caravan companion: Camel
  return {
    creature: CREATURES.camel,
    roll: compositeScore,
    explainableFormula: `[Landmark Affinity: ${lw}] + [Time Factor: ${tw}] + [Seed Roll: ${seedScore}] = Index ${compositeScore} (Trail Archetype) ➔ Desert Caravan Camel (Al-Jammal) Revealed`
  };
}
