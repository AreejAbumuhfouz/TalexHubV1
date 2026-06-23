// ════════════════════════════════════════════════════════════
// locationData.js  —  كل البيانات الثابتة في ملف واحد
// استخدام:  import { COUNTRIES, CITIES_BY_COUNTRY, PHONE_CODES, NATIONALITIES, JOB_TITLES, ALL_LOCATIONS } from './locationData';
// ════════════════════════════════════════════════════════════

export const NATIONALITIES = [
  { en:'Saudi',          ar:'سعودي'           },
  { en:'Emirati',        ar:'إماراتي'          },
  { en:'Kuwaiti',        ar:'كويتي'            },
  { en:'Qatari',         ar:'قطري'             },
  { en:'Bahraini',       ar:'بحريني'           },
  { en:'Omani',          ar:'عُماني'           },
  { en:'Jordanian',      ar:'أردني'            },
  { en:'Egyptian',       ar:'مصري'             },
  { en:'Lebanese',       ar:'لبناني'           },
  { en:'Syrian',         ar:'سوري'             },
  { en:'Iraqi',          ar:'عراقي'            },
  { en:'Yemeni',         ar:'يمني'             },
  { en:'Libyan',         ar:'ليبي'             },
  { en:'Tunisian',       ar:'تونسي'            },
  { en:'Algerian',       ar:'جزائري'           },
  { en:'Moroccan',       ar:'مغربي'            },
  { en:'Sudanese',       ar:'سوداني'           },
  { en:'Palestinian',    ar:'فلسطيني'          },
  { en:'British',        ar:'بريطاني'          },
  { en:'American',       ar:'أمريكي'           },
  { en:'German',         ar:'ألماني'           },
  { en:'French',         ar:'فرنسي'            },
  { en:'Canadian',       ar:'كندي'             },
  { en:'Australian',     ar:'أسترالي'          },
  { en:'Turkish',        ar:'تركي'             },
  { en:'Indian',         ar:'هندي'             },
  { en:'Pakistani',      ar:'باكستاني'         },
  { en:'Dutch',          ar:'هولندي'           },
  { en:'Swedish',        ar:'سويدي'            },
  { en:'Singaporean',    ar:'سنغافوري'         },
  { en:'Filipino',       ar:'فلبيني'           },
  { en:'Indonesian',     ar:'إندونيسي'         },
  { en:'Sri Lankan',     ar:'سريلانكي'         },
  { en:'Bangladeshi',    ar:'بنغلاديشي'        },
  { en:'Nepali',         ar:'نيبالي'           },
];

export const COUNTRIES = [
  { code:'SA', en:'Saudi Arabia',         ar:'المملكة العربية السعودية', flag:'🇸🇦' },
  { code:'AE', en:'United Arab Emirates', ar:'الإمارات العربية المتحدة', flag:'🇦🇪' },
  { code:'KW', en:'Kuwait',               ar:'الكويت',                   flag:'🇰🇼' },
  { code:'QA', en:'Qatar',                ar:'قطر',                      flag:'🇶🇦' },
  { code:'BH', en:'Bahrain',              ar:'البحرين',                  flag:'🇧🇭' },
  { code:'OM', en:'Oman',                 ar:'عُمان',                    flag:'🇴🇲' },
  { code:'JO', en:'Jordan',               ar:'الأردن',                   flag:'🇯🇴' },
  { code:'EG', en:'Egypt',                ar:'مصر',                      flag:'🇪🇬' },
  { code:'LB', en:'Lebanon',              ar:'لبنان',                    flag:'🇱🇧' },
  { code:'SY', en:'Syria',                ar:'سوريا',                    flag:'🇸🇾' },
  { code:'IQ', en:'Iraq',                 ar:'العراق',                   flag:'🇮🇶' },
  { code:'YE', en:'Yemen',                ar:'اليمن',                    flag:'🇾🇪' },
  { code:'LY', en:'Libya',                ar:'ليبيا',                    flag:'🇱🇾' },
  { code:'TN', en:'Tunisia',              ar:'تونس',                     flag:'🇹🇳' },
  { code:'DZ', en:'Algeria',              ar:'الجزائر',                  flag:'🇩🇿' },
  { code:'MA', en:'Morocco',              ar:'المغرب',                   flag:'🇲🇦' },
  { code:'SD', en:'Sudan',                ar:'السودان',                  flag:'🇸🇩' },
  { code:'PS', en:'Palestine',            ar:'فلسطين',                   flag:'🇵🇸' },
  { code:'GB', en:'United Kingdom',       ar:'المملكة المتحدة',          flag:'🇬🇧' },
  { code:'US', en:'United States',        ar:'الولايات المتحدة',         flag:'🇺🇸' },
  { code:'DE', en:'Germany',              ar:'ألمانيا',                  flag:'🇩🇪' },
  { code:'FR', en:'France',               ar:'فرنسا',                    flag:'🇫🇷' },
  { code:'CA', en:'Canada',               ar:'كندا',                     flag:'🇨🇦' },
  { code:'AU', en:'Australia',            ar:'أستراليا',                 flag:'🇦🇺' },
  { code:'TR', en:'Turkey',               ar:'تركيا',                    flag:'🇹🇷' },
  { code:'NL', en:'Netherlands',          ar:'هولندا',                   flag:'🇳🇱' },
  { code:'SE', en:'Sweden',               ar:'السويد',                   flag:'🇸🇪' },
  { code:'SG', en:'Singapore',            ar:'سنغافورة',                 flag:'🇸🇬' },
  { code:'IN', en:'India',                ar:'الهند',                    flag:'🇮🇳' },
  { code:'PK', en:'Pakistan',             ar:'باكستان',                  flag:'🇵🇰' },
];

export const CITIES_BY_COUNTRY = {
  SA: [
    {en:'Riyadh',ar:'الرياض'},{en:'Jeddah',ar:'جدة'},{en:'Mecca',ar:'مكة المكرمة'},
    {en:'Medina',ar:'المدينة المنورة'},{en:'Dammam',ar:'الدمام'},{en:'Al-Ahsa',ar:'الأحساء'},
    {en:'Taif',ar:'الطائف'},{en:'Tabuk',ar:'تبوك'},{en:'Buraidah',ar:'بريدة'},
    {en:'Khamis Mushait',ar:'خميس مشيط'},{en:'Jubail',ar:'الجبيل'},{en:'Hail',ar:'حائل'},
    {en:'Najran',ar:'نجران'},{en:'Yanbu',ar:'ينبع'},{en:'Abha',ar:'أبها'},
    {en:'Arar',ar:'عرعر'},{en:'Kharj',ar:'الخرج'},{en:'Qatif',ar:'القطيف'},
    {en:'Dhahran',ar:'الظهران'},{en:'Jazan',ar:'جازان'},
  ],
  AE: [
    {en:'Dubai',ar:'دبي'},{en:'Abu Dhabi',ar:'أبوظبي'},{en:'Sharjah',ar:'الشارقة'},
    {en:'Al Ain',ar:'العين'},{en:'Umm Al Quwain',ar:'أم القيوين'},{en:'Fujairah',ar:'الفجيرة'},
    {en:'Ras Al Khaimah',ar:'رأس الخيمة'},{en:'Ajman',ar:'عجمان'},
    {en:'Khor Fakkan',ar:'خورفكان'},{en:'Kalba',ar:'كلباء'},
  ],
  KW: [
    {en:'Kuwait City',ar:'الكويت'},{en:'Hawalli',ar:'حولي'},{en:'Farwaniya',ar:'الفروانية'},
    {en:'Mubarak Al-Kabeer',ar:'مبارك الكبير'},{en:'Ahmadi',ar:'الأحمدي'},{en:'Jahra',ar:'الجهراء'},
    {en:'Salmiya',ar:'السالمية'},{en:'Jabriya',ar:'الجابرية'},
  ],
  QA: [
    {en:'Doha',ar:'الدوحة'},{en:'Al Rayyan',ar:'الريان'},{en:'Al Wakra',ar:'الوكرة'},
    {en:'Al Khor',ar:'الخور'},{en:'Umm Salal',ar:'أم صلال'},{en:'Al Shamal',ar:'الشمال'},
  ],
  BH: [
    {en:'Manama',ar:'المنامة'},{en:'Muharraq',ar:'المحرق'},{en:'Riffa',ar:'الرفاع'},
    {en:'Hamad Town',ar:'مدينة حمد'},{en:'Sitra',ar:'سترة'},{en:'Jidhafs',ar:'جدحفص'},
  ],
  OM: [
    {en:'Muscat',ar:'مسقط'},{en:'Salalah',ar:'صلالة'},{en:'Sohar',ar:'صحار'},
    {en:'Nizwa',ar:'نزوى'},{en:'Sur',ar:'صور'},{en:'Ibri',ar:'عبري'},
    {en:'Buraimi',ar:'البريمي'},{en:'Rustaq',ar:'الرستاق'},
  ],
  JO: [
    {en:'Amman',ar:'عمّان'},{en:'Irbid',ar:'إربد'},{en:'Zarqa',ar:'الزرقاء'},
    {en:'Aqaba',ar:'العقبة'},{en:'Salt',ar:'السلط'},{en:'Madaba',ar:'مأدبا'},
    {en:'Karak',ar:'الكرك'},{en:'Jerash',ar:'جرش'},{en:'Ajloun',ar:'عجلون'},{en:'Maan',ar:'معان'},
  ],
  EG: [
    {en:'Cairo',ar:'القاهرة'},{en:'Alexandria',ar:'الإسكندرية'},{en:'Giza',ar:'الجيزة'},
    {en:'Sharm El Sheikh',ar:'شرم الشيخ'},{en:'Hurghada',ar:'الغردقة'},{en:'Luxor',ar:'الأقصر'},
    {en:'Aswan',ar:'أسوان'},{en:'Port Said',ar:'بورسعيد'},{en:'Mansoura',ar:'المنصورة'},
  ],
  LB: [
    {en:'Beirut',ar:'بيروت'},{en:'Tripoli',ar:'طرابلس'},{en:'Sidon',ar:'صيدا'},
    {en:'Tyre',ar:'صور'},{en:'Jounieh',ar:'جونية'},{en:'Zahle',ar:'زحلة'},
  ],
  SY: [
    {en:'Damascus',ar:'دمشق'},{en:'Aleppo',ar:'حلب'},{en:'Homs',ar:'حمص'},
    {en:'Lattakia',ar:'اللاذقية'},{en:'Hama',ar:'حماة'},
  ],
  IQ: [
    {en:'Baghdad',ar:'بغداد'},{en:'Basra',ar:'البصرة'},{en:'Mosul',ar:'الموصل'},
    {en:'Erbil',ar:'أربيل'},{en:'Kirkuk',ar:'كركوك'},{en:'Najaf',ar:'النجف'},
    {en:'Karbala',ar:'كربلاء'},{en:'Sulaymaniyah',ar:'السليمانية'},
  ],
  LY: [
    {en:'Tripoli',ar:'طرابلس'},{en:'Benghazi',ar:'بنغازي'},
    {en:'Misrata',ar:'مصراتة'},{en:'Sabha',ar:'سبها'},
  ],
  TN: [
    {en:'Tunis',ar:'تونس'},{en:'Sfax',ar:'صفاقس'},{en:'Sousse',ar:'سوسة'},
    {en:'Bizerte',ar:'بنزرت'},{en:'Kairouan',ar:'القيروان'},{en:'Monastir',ar:'المنستير'},
  ],
  DZ: [
    {en:'Algiers',ar:'الجزائر'},{en:'Oran',ar:'وهران'},{en:'Constantine',ar:'قسنطينة'},
    {en:'Annaba',ar:'عنابة'},{en:'Tlemcen',ar:'تلمسان'},{en:'Batna',ar:'باتنة'},
  ],
  MA: [
    {en:'Rabat',ar:'الرباط'},{en:'Casablanca',ar:'الدار البيضاء'},{en:'Fez',ar:'فاس'},
    {en:'Marrakech',ar:'مراكش'},{en:'Agadir',ar:'أكادير'},{en:'Tangier',ar:'طنجة'},
    {en:'Meknes',ar:'مكناس'},{en:'Oujda',ar:'وجدة'},
  ],
  PS: [
    {en:'Ramallah',ar:'رام الله'},{en:'Gaza',ar:'غزة'},{en:'Nablus',ar:'نابلس'},
    {en:'Hebron',ar:'الخليل'},{en:'Jenin',ar:'جنين'},{en:'Jerusalem',ar:'القدس'},
  ],
  GB: ['London','Manchester','Birmingham','Leeds','Glasgow','Liverpool','Bristol','Edinburgh'],
  US: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Diego','Dallas','San Francisco','Seattle','Boston','Austin'],
  DE: ['Berlin','Hamburg','Munich','Cologne','Frankfurt','Stuttgart','Düsseldorf'],
  FR: ['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Bordeaux'],
  CA: ['Toronto','Montreal','Vancouver','Calgary','Edmonton','Ottawa','Winnipeg'],
  AU: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast','Canberra'],
  TR: ['Istanbul','Ankara','Izmir','Bursa','Antalya','Adana'],
  NL: ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven'],
  SE: ['Stockholm','Gothenburg','Malmö','Uppsala'],
  SG: ['Singapore'],
  IN: ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune'],
  PK: ['Karachi','Lahore','Islamabad','Faisalabad','Rawalpindi','Multan'],
};

export const PHONE_CODES = [
  { code:'JO', dial:'+962', flag:'🇯🇴', en:'Jordan',               ar:'الأردن'            },
  { code:'SA', dial:'+966', flag:'🇸🇦', en:'Saudi Arabia',          ar:'السعودية'          },
  { code:'AE', dial:'+971', flag:'🇦🇪', en:'UAE',                   ar:'الإمارات'          },
  { code:'KW', dial:'+965', flag:'🇰🇼', en:'Kuwait',                ar:'الكويت'            },
  { code:'QA', dial:'+974', flag:'🇶🇦', en:'Qatar',                 ar:'قطر'               },
  { code:'BH', dial:'+973', flag:'🇧🇭', en:'Bahrain',               ar:'البحرين'           },
  { code:'OM', dial:'+968', flag:'🇴🇲', en:'Oman',                  ar:'عُمان'             },
  { code:'EG', dial:'+20',  flag:'🇪🇬', en:'Egypt',                 ar:'مصر'               },
  { code:'LB', dial:'+961', flag:'🇱🇧', en:'Lebanon',               ar:'لبنان'             },
  { code:'SY', dial:'+963', flag:'🇸🇾', en:'Syria',                 ar:'سوريا'             },
  { code:'IQ', dial:'+964', flag:'🇮🇶', en:'Iraq',                  ar:'العراق'            },
  { code:'YE', dial:'+967', flag:'🇾🇪', en:'Yemen',                 ar:'اليمن'             },
  { code:'LY', dial:'+218', flag:'🇱🇾', en:'Libya',                 ar:'ليبيا'             },
  { code:'TN', dial:'+216', flag:'🇹🇳', en:'Tunisia',               ar:'تونس'              },
  { code:'DZ', dial:'+213', flag:'🇩🇿', en:'Algeria',               ar:'الجزائر'           },
  { code:'MA', dial:'+212', flag:'🇲🇦', en:'Morocco',               ar:'المغرب'            },
  { code:'SD', dial:'+249', flag:'🇸🇩', en:'Sudan',                 ar:'السودان'           },
  { code:'PS', dial:'+970', flag:'🇵🇸', en:'Palestine',             ar:'فلسطين'            },
  { code:'TR', dial:'+90',  flag:'🇹🇷', en:'Turkey',                ar:'تركيا'             },
  { code:'IN', dial:'+91',  flag:'🇮🇳', en:'India',                 ar:'الهند'             },
  { code:'PK', dial:'+92',  flag:'🇵🇰', en:'Pakistan',              ar:'باكستان'           },
  { code:'GB', dial:'+44',  flag:'🇬🇧', en:'United Kingdom',        ar:'المملكة المتحدة'   },
  { code:'US', dial:'+1',   flag:'🇺🇸', en:'United States',         ar:'الولايات المتحدة'  },
  { code:'CA', dial:'+1',   flag:'🇨🇦', en:'Canada',                ar:'كندا'              },
  { code:'DE', dial:'+49',  flag:'🇩🇪', en:'Germany',               ar:'ألمانيا'           },
  { code:'FR', dial:'+33',  flag:'🇫🇷', en:'France',                ar:'فرنسا'             },
  { code:'AU', dial:'+61',  flag:'🇦🇺', en:'Australia',             ar:'أستراليا'          },
  { code:'NL', dial:'+31',  flag:'🇳🇱', en:'Netherlands',           ar:'هولندا'            },
  { code:'SE', dial:'+46',  flag:'🇸🇪', en:'Sweden',                ar:'السويد'            },
  { code:'SG', dial:'+65',  flag:'🇸🇬', en:'Singapore',             ar:'سنغافورة'          },
];

export const JOB_TITLES = [
  'Software Engineer','Senior Software Engineer','Staff Engineer','Principal Engineer',
  'Frontend Developer','Senior Frontend Developer','Backend Developer','Senior Backend Developer',
  'Full Stack Developer','Mobile Developer','iOS Developer','Android Developer',
  'React Native Developer','Flutter Developer',
  'DevOps Engineer','Cloud Engineer','Site Reliability Engineer','Platform Engineer',
  'QA Engineer','Automation Engineer','Security Engineer','Penetration Tester',
  'Blockchain Developer','Embedded Systems Engineer',
  'Data Scientist','Senior Data Scientist','Data Analyst','Business Intelligence Analyst',
  'Machine Learning Engineer','AI Engineer','Data Engineer','MLOps Engineer',
  'NLP Engineer','Computer Vision Engineer',
  'UI/UX Designer','Product Designer','Graphic Designer','Motion Designer',
  'Brand Designer','UX Researcher','Design Lead',
  'Product Manager','Senior Product Manager','Director of Product',
  'Project Manager','Program Manager','Scrum Master','Agile Coach',
  'Engineering Manager','VP of Engineering','CTO','Tech Lead',
  'Digital Marketing Manager','SEO Specialist','Content Writer','Social Media Manager',
  'Growth Hacker','Performance Marketing Specialist','Brand Manager','PR Manager',
  'Business Analyst','Business Development Manager','Sales Manager','Account Manager',
  'Account Executive','Customer Success Manager',
  'HR Manager','Talent Acquisition Specialist','Recruiter','People Operations Manager',
  'Financial Analyst','Senior Financial Analyst','Accountant','CFO','Controller','Auditor',
  'مطور واجهة أمامية','مطور خلفية','مطور تطبيقات','مطور برمجيات','مهندس برمجيات',
  'مصمم UI/UX','مصمم جرافيك','مدير منتج','مدير مشروع','محلل بيانات','عالم بيانات',
  'مهندس ذكاء اصطناعي','مهندس تعلم آلي','مدير تسويق رقمي','أخصائي سيو',
  'محاسب','محلل مالي','مدير موارد بشرية','مسؤول توظيف','مدير مبيعات',
  'مطور DevOps','مهندس أمن معلومات','مهندس شبكات','محلل أعمال',
];

const REMOTE_OPTIONS = [
  { key:'Remote',  en:'Remote',  ar:'عن بُعد',   icon:'🌐' },
  { key:'Hybrid',  en:'Hybrid',  ar:'هجين',       icon:'🏠' },
  { key:'On-site', en:'On-site', ar:'في الموقع',  icon:'🏢' },
];

export const ALL_LOCATIONS = (() => {
  const list = [];
  REMOTE_OPTIONS.forEach(r => list.push({ key:r.key, en:r.en, ar:r.ar, icon:r.icon, type:'mode' }));
  COUNTRIES.forEach(c => {
    list.push({ key:c.en, en:c.en, ar:c.ar, icon:c.flag, type:'country' });
  });
  COUNTRIES.forEach(c => {
    const cities = CITIES_BY_COUNTRY[c.code] || [];
    cities.forEach(city => {
      const cityEn = typeof city === 'string' ? city : city.en;
      const cityAr = typeof city === 'string' ? city : city.ar;
      list.push({ key:`${cityEn}, ${c.en}`, en:`${cityEn}, ${c.en}`, ar:`${cityAr}، ${c.ar}`, icon:c.flag, type:'city' });
    });
  });
  return list;
})();