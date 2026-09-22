/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark } from '../types';

export const LANDMARKS: Landmark[] = [
  {
    id: 'siq',
    nameEn: 'The Siq Entrance',
    nameAr: 'مدخل السيق',
    subtitleEn: 'The 1.2km Sacred Chasm',
    subtitleAr: 'الشق الصخري المقدس بطول 1.2 كم',
    routeOrder: 1,
    svgCoordinates: { x: 120, y: 380 },
    geoCoordinates: { lat: 30.3253, lng: 35.4542 },
    shortDescEn: 'The legendary gorge flanked by 80m soaring sandstone cliffs, clay conduits, and sacred votive niches.',
    shortDescAr: 'الممر الصخري الأسطوري المحاط بجدران شاهقة ترتفع 80 متراً مع قنوات مائية فخارية ومحاريب دينية.',
    curatedStoryEn: 'Winding through the cool, dim corridor of the Siq, the sound of your footsteps echoes against 80-meter vertical cliffs. Ancient Nabataean terracotta aqueducts still line the rock walls at eye level, engineered with gentle 2-degree gradients to bring fresh spring water from Ain Musa directly to the city center without spilling a drop.',
    curatedStoryAr: 'عند السير في ممر السيق البارد والمظلل، يتردد صدى خطواتك بين جدران صخرية شاهقة ترتفع 80 متراً. لا تزال القنوات الفخارية النبطية تمتد على جوانب الصخر بانحدار مدروس بدقة (درجتان) لتوصيل مياه نبع عين موسى العذبة لقلب المدينة دون هدر قطرة واحدة.',
    knowledgeEntryIds: ['kb-siq', 'kb-water-engineering', 'kb-myth-djinns'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1579606032822-6b921389e13d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'treasury',
    nameEn: 'Al-Khazneh (The Treasury)',
    nameAr: 'الخزنة',
    subtitleEn: 'The Rose-Red Royal Mausoleum',
    subtitleAr: 'الضريح الملكي المنحوت في الصخر الوردي',
    routeOrder: 2,
    svgCoordinates: { x: 280, y: 310 },
    geoCoordinates: { lat: 30.3222, lng: 35.4516 },
    shortDescEn: 'The breathtaking 39.5m royal tomb carved for King Aretas IV, crowned by the mythical stone urn.',
    shortDescAr: 'الواجهة الملكية الساحرة بارتفاع 39.5 متراً للملك الحارث الرابع، متوجة بالجرة الصخرية الشهيرة.',
    curatedStoryEn: 'As the narrow darkness of the Siq breaks open, the brilliant sunlit Corinthian columns of Al-Khazneh dazzle your eyes. Carved from top to bottom into the living rose-red mountain, its relief sculptures honor deified ancestors and protective deities. Excavations underneath revealed four burial crypts holding Nabataean royal skeletons.',
    curatedStoryAr: 'مع انقشاع ظلال السيق الضيقة، تنكشف فجأة أعمدة الخزنة الكورنثية المتلألئة تحت أشعة الشمس. نُحتت الواجهة من أعلى الصخر إلى أسفله لتمثل ضريحاً ملكياً فخماً، وأثبتت الحفريات الحديثة وجود غرف دفن سفلية تحت الساحة تضم رفات النبلاء الأنباط.',
    knowledgeEntryIds: ['kb-treasury', 'kb-myth-treasury-gold', 'kb-geology-sandstone'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'facades',
    nameEn: 'Street of Facades',
    nameAr: 'شارع الواجهات',
    subtitleEn: 'Carved Tombs of the Caravan Guilds',
    subtitleAr: 'مدافن تجار قوافل البخور النبطية',
    routeOrder: 3,
    svgCoordinates: { x: 440, y: 260 },
    geoCoordinates: { lat: 30.3236, lng: 35.4478 },
    shortDescEn: 'Dozens of multi-tiered rock tombs bearing crowstep battlements and Egyptian stylized cavetto cornices.',
    shortDescAr: 'عشرات المدافن الصخرية متعددة الطبقات المزينة بتدرجات الغراب والأفاريز النبطية المصرية.',
    curatedStoryEn: 'Beyond the Treasury, the valley broadens into the Street of Facades. Here, dozens of monumental tomb facades are stacked vertically along the sandstone ridge. Built by wealthy merchant families who financed frankincense and spice expeditions across the Arabian deserts, these tombs displayed their prestige through Assyrian crowstep crests.',
    curatedStoryAr: 'بعد الخزنة، يتسع الوادي ليصل إلى شارع الواجهات حيث تصطف عشرات المدافن الصخرية المنحوتة في تدرجات الجبل. شيدتها عائلات التجار الأثرياء الذين سيروا قوافل البخور والتوابل عبر صحارى الجزيرة العربية، مخلدين مكانتهم بتدرجات الغراب الآشورية الأنيقة.',
    knowledgeEntryIds: ['kb-street-facades', 'kb-trade-routes', 'kb-betyls-aniconism'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1571243557997-6a1215c2ecff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'theatre',
    nameEn: 'The Rock-Cut Theatre',
    nameAr: 'المدرج الصخري',
    subtitleEn: 'Civic Arena Hewn from Solid Mountain',
    subtitleAr: 'المسرح المنحوت في قلب الجبل الصخري',
    routeOrder: 4,
    svgCoordinates: { x: 590, y: 220 },
    geoCoordinates: { lat: 30.3242, lng: 35.4455 },
    shortDescEn: 'A breathtaking amphitheater carved directly into the mountain, seating 8,000 citizens for civil gatherings.',
    shortDescAr: 'مسرح استثنائي حُفرت مدرجاته الـ 45 مباشرة في الصخر، يتسع لأكثر من 8000 متفرج.',
    curatedStoryEn: 'Unlike Greek or Roman theaters built from stone masonry blocks, this colossal arena was carved directly down into the sandstone bedrock in the 1st century AD. In the process, the Nabataeans ruthlessly sliced through older tomb chambers, demonstrating the city’s rapid transformation into an urban civic hub for assemblies and festivities.',
    curatedStoryAr: 'على عكس المسارح الرومانية المبنية من كتل الحجارة، حفر الأنباط هذا المدرج الضخم مباشرة في بطن الجبل الصخري في القرن الأول الميلادي. واقتطعوا أثناء نحته غرف مدافن أقدم، مما عكس تحول بترا الحضاري السريع إلى حاضرة مدنية للاجتماعات والاحتفالات العامة.',
    knowledgeEntryIds: ['kb-theatre', 'kb-monument-preservation'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1580834341580-8c17a3a632df?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'monastery',
    nameEn: 'Ad-Deir (The Monastery)',
    nameAr: 'الدير',
    subtitleEn: 'The Majestic Crown of the High Peaks',
    subtitleAr: 'جوهرة أعالي جبال بترا الشامخة',
    routeOrder: 5,
    svgCoordinates: { x: 740, y: 130 },
    geoCoordinates: { lat: 30.3377, lng: 35.4316 },
    shortDescEn: 'Petra’s most massive monument, standing 48m high atop 800 mountain steps with views to Wadi Araba.',
    shortDescAr: 'أضخم صرح في بترا بارتفاع 48 متراً بعد صعود 800 درجة صخرية مع إطلالة بانورامية على وادي عربة.',
    curatedStoryEn: 'Ad-Deir rewards those who climb the 800 rugged rock-hewn steps through mountain ridges. Dwarfing even the Treasury in physical scale, this colossal facade spans 47 meters wide. Nabataeans climbed here for solemn religious banquets honoring King Obodas. From the windswept ridge nearby, views stretch to Palestine and the Wadi Araba desert.',
    curatedStoryAr: 'يكافئ الدير زواره بعد صعود 800 درجة صخرية وعرة بين القمم الجبلية. يفوق الدير واجهة الخزنة حجماً، إذ يمتد بعرض 47 متراً. كان الأنباط يصعدون إليه لإقامة المآدب الدينية والطقوس تكريماً للملك المؤله عبادة الأول، مع إطلالة ساحرة نحو وادي عربة.',
    knowledgeEntryIds: ['kb-monastery', 'kb-dushara-al-uzza', 'kb-geology-sandstone'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509233631037-deb7efd36207?auto=format&fit=crop&w=600&q=80'
  }
];
