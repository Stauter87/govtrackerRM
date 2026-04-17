/* eslint-disable */
import { useState, useMemo, useCallback } from "react";

// ─── ROTATION & PENSION RULES ─────────────────────────────────────────────────
// Level 0-1 (President, Ministers, Akims): rotation every 3 years
// Level 2-3 (Vice-ministers, Deputy akims): rotation every 4 years
// Level 4+ (Committees, Dept heads): rotation every 5 years
// Pension age: men 63, women 61

const ROTATION_YEARS = { 0: 3, 1: 3, 2: 4, 3: 4, 4: 5 };

function parseYear(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function parseBirthYear(bd) {
  if (!bd) return null;
  const m = String(bd).match(/(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function getAlerts(node) {
  const currentYear = new Date().getFullYear();
  const sinceYear = parseYear(node.since);
  const birthYear = parseBirthYear(node.birthday);
  const isFemale = node.female === true;
  const pensionAge = isFemale ? 61 : 63;
  const rotLimit = ROTATION_YEARS[Math.min(node.level || 0, 4)] || 4;

  const rot = sinceYear ? {
    yearsIn: currentYear - sinceYear,
    yearsLeft: rotLimit - (currentYear - sinceYear),
    rotLimit,
    overdue: (currentYear - sinceYear) >= rotLimit
  } : null;

  const pen = birthYear ? {
    age: currentYear - birthYear,
    yearsLeft: pensionAge - (currentYear - birthYear),
    pensionAge,
    overdue: (currentYear - birthYear) >= pensionAge
  } : null;

  // Pick most urgent alert for badge
  let alert = null;
  if (rot && rot.yearsLeft <= 1) {
    alert = { type: rot.overdue ? "rot_over" : "rot_soon", yearsLeft: rot.yearsLeft };
  }
  if (pen && pen.yearsLeft <= 3) {
    const penAlert = { type: pen.overdue ? "pen_over" : "pen_soon", yearsLeft: pen.yearsLeft };
    if (!alert || pen.yearsLeft < (rot?.yearsLeft ?? 99)) alert = penAlert;
  }
  return { rot, pen, alert };
}

// ─── ALERT BADGE ──────────────────────────────────────────────────────────────
function AlertBadge({ node }) {
  const { alert } = getAlerts(node);
  if (!alert) return null;
  const styles = {
    rot_over: ["#dc2626","#fca5a5","🔄 Ротация просрочена"],
    rot_soon: ["#d97706","#fde68a", alert.yearsLeft === 0 ? "🔄 Ротация в этом году" : `🔄 Ротация ~${alert.yearsLeft}г.`],
    pen_over: ["#7c3aed","#c4b5fd","🏁 Пенс. возраст"],
    pen_soon: ["#0891b2","#a5f3fc",`👴 До пенсии ${alert.yearsLeft}г.`],
  };
  const [bg, tc, label] = styles[alert.type] || ["#6b7280","#f3f4f6","?"];
  return (
    <span style={{ fontSize:8, padding:"1px 5px", borderRadius:8, whiteSpace:"nowrap",
      background:bg+"22", color:tc, border:`1px solid ${bg}44`, flexShrink:0 }}>
      {label}
    </span>
  );
}

// ─── FULL TREE DATA ───────────────────────────────────────────────────────────
const TREE = {
  id:"president", name:"Касым-Жомарт Токаев", title:"Президент Республики Казахстан",
  since:"2019", birthday:"1953", level:0, org:"Акорда",
  bio:"Родился 17 мая 1953 г. в Алма-Ате. Окончил МГИМО (1975). Дипломат, государственный деятель. Премьер-министр (1999–2002). Председатель Сената (2007–2011, 2013–2019). Заместитель Генерального секретаря ООН (2011–2013). Президент с 20 марта 2019 г.",
  children:[
    // ── АДМИНИСТРАЦИЯ ПРЕЗИДЕНТА
    {id:"ap_ch", name:"Дадебаев Айбек Аркабаевич", title:"Руководитель Администрации Президента", since:"2024", birthday:"1970", level:1, org:"АП",
     bio:"Руководитель Администрации Президента с февраля 2024 г. Ранее — управляющий делами Президента. Карьеру начал в 2008 г. помощником Председателя Сената Токаева. С 2011 г. — в постпредстве Казахстана при ООН в Женеве.", children:[]},

    // ── КНБ
    {id:"knb_ch", name:"Сагимбаев Ермек Алдабергенович", title:"Председатель КНБ РК, генерал-лейтенант", since:"2022", birthday:"1970", level:1, org:"КНБ",
     bio:"Председатель Комитета национальной безопасности РК. Генерал-лейтенант национальной безопасности.",
     children:[
       {id:"knb_1", name:"Алтынбаев Али Сапаргалиевич", title:"Первый заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"Первый заместитель Председателя КНБ РК.", children:[]},
       {id:"knb_2", name:"Тулеуов Асхат Калмагамбетович", title:"Заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"", children:[]},
       {id:"knb_3", name:"Рахымбердиев Бакытбек Толешевич", title:"Заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"", children:[]},
       {id:"knb_4", name:"Саркулов Руслан Серикович", title:"Заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"", children:[]},
       {id:"knb_5", name:"Наймантаев Алмас Тлепбергенович", title:"Заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"", children:[]},
       {id:"knb_6", name:"Ирменов Марат Гатауллович", title:"Заместитель Председателя КНБ, генерал-майор", since:"", birthday:"", level:2, org:"КНБ", bio:"", children:[]},
       {id:"knb_7", name:"Жумабаев Марат Кабиденович", title:"Зам. Председателя КНБ – Директор Службы внешней разведки", since:"", birthday:"", level:2, org:"КНБ", bio:"Директор Службы внешней разведки КНБ РК.", children:[]},
       {id:"knb_8", name:"Кунанбаев Берик Садыкович", title:"Зам. Председателя КНБ – Директор ССН «А»", since:"", birthday:"", level:2, org:"КНБ", bio:"Директор Службы специального назначения «А».", children:[]},
       {id:"knb_border", name:"Алдажуманов Ерлан Ергалиулы", title:"Зам. Председателя КНБ – Директор Пограничной службы, генерал-майор", since:"", birthday:"", level:2, org:"КНБ",
        bio:"Директор Пограничной службы КНБ РК.",
        children:[
          {id:"border_1", name:"Абсаматов Бауыржан Хамитович", title:"Первый зам. Директора – нач. Главного штаба Погранслужбы, полковник", since:"", birthday:"", level:3, org:"Погранслужба КНБ", bio:"", children:[]},
          {id:"border_2", name:"Джунусов Толеужан Сабырович", title:"Заместитель Директора Пограничной службы КНБ, генерал-майор", since:"", birthday:"", level:3, org:"Погранслужба КНБ", bio:"", children:[]},
          {id:"border_3", name:"Дюсембеков Даулет Мирашович", title:"Заместитель Директора Пограничной службы КНБ, полковник", since:"", birthday:"", level:3, org:"Погранслужба КНБ", bio:"", children:[]},
        ]},
     ]},

    // ── СГО
    {id:"sgo", name:"Исабеков Сакен Саинович", title:"Начальник Службы государственной охраны РК", since:"", birthday:"", level:1, org:"СГО",
     bio:"Начальник СГО Республики Казахстан.",
     children:[
       {id:"sgo_1", name:"Жакипов Шынгыс Лесович", title:"Заместитель начальника СГО", since:"", birthday:"", level:2, org:"СГО", bio:"", children:[]},
       {id:"sgo_2", name:"Тореханов Роман Алмаханович", title:"Зам. нач. СГО – нач. Службы охраны Президента", since:"", birthday:"", level:2, org:"СГО", bio:"", children:[]},
       {id:"sgo_3", name:"Омарбеков Айткурман Жоламанович", title:"Зам. нач. СГО – Командующий Силами особого назначения", since:"", birthday:"", level:2, org:"СГО", bio:"", children:[]},
       {id:"sgo_4", name:"Канцеров Константин Вадимович", title:"Заместитель начальника СГО", since:"", birthday:"", level:2, org:"СГО", bio:"", children:[]},
     ]},

    // ── СЕНАТ
    {id:"senate", name:"Ашимбаев Маулен", title:"Председатель Сената Парламента", since:"2020", birthday:"1969", level:1, org:"Сенат",
     bio:"Председатель Сената с 2020 г. Директор КИСИ (2002–2007). Руководитель АП (2019–2020).", children:[]},

    // ── МАЖИЛИС
    {id:"majilis", name:"Кошанов Ерлан", title:"Председатель Мажилиса Парламента", since:"2022", birthday:"1968", level:1, org:"Мажилис",
     bio:"Председатель Мажилиса с января 2022 г. Руководитель АП (2019–2022).", children:[]},

    // ── ВЕРХОВНЫЙ СУД
    {id:"vsupr", name:"Мергалиев Асламбек", title:"Председатель Верховного Суда РК", since:"2022", birthday:"1965", level:1, org:"Верховный Суд",
     bio:"Председатель Верховного Суда Республики Казахстан с 2022 г.", children:[]},

    // ── КОНСТИТУЦИОННЫЙ СУД
    {id:"ks", name:"Азимова Эльвира Абилхасимовна", title:"Председатель Конституционного Суда РК", since:"2022", birthday:"1970", female:true, level:1, org:"КС",
     bio:"Председатель Конституционного Суда РК.",
     children:[
       {id:"ks_1", name:"Нурмуханов Бакыт Маратович", title:"Заместитель Председателя Конституционного Суда", since:"", birthday:"", level:2, org:"КС", bio:"", children:[]},
     ]},

    // ── ГЕНПРОКУРАТУРА
    {id:"gp", name:"Асылов Берик Ногайулы", title:"Генеральный Прокурор РК", since:"2023", birthday:"1972", level:1, org:"Генпрокуратура",
     bio:"Генеральный прокурор РК с 2023 г.",
     children:[
       {id:"gp_1", name:"Умиралиев Жандос Жанибекович", title:"Первый заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_2", name:"Койгелдиев Галымжан Мамбетович", title:"Заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_3", name:"Чиндалиев Асет Казакбаевич", title:"Заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_4", name:"Садырбеков Габит Амангельдиевич", title:"Заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_5", name:"Жумагали Асхат Жумагалиулы", title:"Заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_6", name:"Утегенов Ерлан Рахимжанович", title:"Заместитель Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
       {id:"gp_app", name:"Мухаметжанов Алмаз Оралович", title:"Руководитель Аппарата Генерального Прокурора", since:"", birthday:"", level:2, org:"Генпрокуратура", bio:"", children:[]},
     ]},

    // ── ЦИК
    {id:"cik", name:"Абдиров Нурлан Мажитович", title:"Председатель ЦИК РК", since:"2022", birthday:"1966", level:1, org:"ЦИК",
     bio:"Председатель Центральной избирательной комиссии РК.",
     children:[
       {id:"cik_1", name:"Ерман Мухтар Тилдабекулы", title:"Заместитель председателя ЦИК", since:"", birthday:"", level:2, org:"ЦИК", bio:"", children:[]},
       {id:"cik_2", name:"Утемисов Шавхат Анесович", title:"Секретарь ЦИК", since:"", birthday:"", level:2, org:"ЦИК", bio:"", children:[]},
     ]},

    // ══════════════════════════════════════════
    // ПРАВИТЕЛЬСТВО
    // ══════════════════════════════════════════
    {id:"pm", name:"Бектенов Олжас Абенович", title:"Премьер-Министр РК", since:"2024", birthday:"1981", level:1, org:"Правительство РК",
     bio:"Премьер-Министр с 6 февраля 2024 г. Руководитель АП (2022–2024). Руководитель Агентства по противодействию коррупции (2019–2022). Заместитель Генерального прокурора (2016–2019).",
     children:[

      // ── ВПМ1: Скляр
      {id:"vpm1", name:"Скляр Роман Васильевич", title:"Первый Заместитель Премьер-Министра", since:"2022", birthday:"1967", level:2, org:"Правительство",
       bio:"Первый вице-премьер с 2022 г. Министр индустрии (2019). Вице-премьер с 2019 г. Курирует: промышленность, энергетику, сельское хозяйство.",
       children:[
         // МИНФИН
         {id:"minfin", name:"Такиев Мади Токешович", title:"Министр финансов РК", since:"2024", birthday:"1978", level:3, org:"Министерство финансов",
          bio:"Министр финансов с 6 февраля 2024 г. Депутат Мажилиса (2023–2024), председатель Комитета по финансам и бюджету. Родился 1 апреля 1978 г.",
          children:[
            {id:"mf_app", name:"Ержанов Эрнар Бурибаевич", title:"Руководитель аппарата Минфина", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
            {id:"mf_vm1", name:"Биржанов Ержан Ерикович", title:"Вице-министр финансов", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
            {id:"mf_vm2", name:"Бейсенбекулы Абзал", title:"Вице-министр финансов", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
            {id:"mf_vm3", name:"Кенбеил Даурен Маратулы", title:"Вице-министр финансов", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
            {id:"mf_vm4", name:"Темирбеков Даурен Оденович", title:"Вице-министр финансов", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
            {id:"mf_vm5", name:"Турысов Асет Нурланович", title:"Вице-министр финансов", since:"", birthday:"", level:4, org:"Минфин", bio:"", children:[]},
          ]},
         // МСХ
         {id:"moa", name:"Сапаров Айдарбек Сейпеллович", title:"Министр сельского хозяйства РК", since:"2024", birthday:"1977", level:3, org:"Министерство сельского хозяйства",
          bio:"Министр сельского хозяйства РК с 2024 г.",
          children:[
            {id:"moa_vm1", name:"Султанов Азат Сиражиддинович", title:"Вице-министр сельского хозяйства", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
            {id:"moa_vm2", name:"Бердалин Амангалий Бисенбаевич", title:"Вице-министр сельского хозяйства", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
            {id:"moa_vm3", name:"Тасжуреков Ербол Куанышевич", title:"Вице-министр сельского хозяйства", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
            {id:"moa_vm4", name:"Кенжеханулы Ермек", title:"Вице-министр сельского хозяйства", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
            {id:"moa_vm5", name:"Канафин Таласбек Ахмединович", title:"Вице-министр сельского хозяйства", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
            {id:"moa_app", name:"Ли Сергей Михайлович", title:"Руководитель аппарата МСХ", since:"", birthday:"", level:4, org:"МСХ", bio:"", children:[]},
          ]},
         // МЭ
         {id:"energo", name:"Аккенженов Ерлан Кудайбергенович", title:"Министр энергетики РК", since:"2024", birthday:"1974", level:3, org:"Министерство энергетики",
          bio:"Министр энергетики РК с 2024 г.",
          children:[
            {id:"me_vm1", name:"Акбаров Ерлан Есеналиевич", title:"Вице-министр энергетики", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
            {id:"me_vm2", name:"Ильяс Бакытжан Нассенулы", title:"Вице-министр энергетики", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
            {id:"me_vm3", name:"Туткышбаев Кайырхан Серикович", title:"Вице-министр энергетики", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
            {id:"me_vm4", name:"Жаркешов Санжар Серикбаевич", title:"Вице-министр энергетики", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
            {id:"me_vm5", name:"Есимханов Сунгат Куатович", title:"Вице-министр энергетики", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
            {id:"me_app", name:"Ашуев Айдын Жумабекович", title:"Руководитель аппарата МЭ", since:"", birthday:"", level:4, org:"МЭ", bio:"", children:[]},
          ]},
         // МПС
         {id:"mps", name:"Нагаспаев Ерсайын Каиргазиевич", title:"Министр промышленности и строительства РК", since:"2024", birthday:"1975", level:3, org:"Министерство промышленности и строительства",
          bio:"Министр промышленности и строительства РК с 2024 г.",
          children:[
            {id:"mps_vm1", name:"Шархан Иран Шарханович", title:"Вице-министр промышленности и строительства", since:"", birthday:"", level:4, org:"МПС", bio:"", children:[]},
            {id:"mps_vm2", name:"Кажкенов Куандык Жумабекович", title:"Вице-министр промышленности и строительства", since:"", birthday:"", level:4, org:"МПС", bio:"", children:[]},
            {id:"mps_vm3", name:"Исакулов Рахымжан Ержанович", title:"Вице-министр промышленности и строительства", since:"", birthday:"", level:4, org:"МПС", bio:"", children:[]},
            {id:"mps_vm4", name:"Сапарбеков Олжас Сапарбекович", title:"Вице-министр промышленности и строительства", since:"", birthday:"", level:4, org:"МПС", bio:"", children:[]},
            {id:"mps_vm5", name:"Дубирова Жаннат Балгабаевна", title:"Вице-министр промышленности и строительства", since:"", birthday:"", female:true, level:4, org:"МПС", bio:"", children:[]},
            {id:"mps_app", name:"Кенжебаева Айгуль Каржаубаевна", title:"Руководитель аппарата МПС", since:"", birthday:"", female:true, level:4, org:"МПС", bio:"", children:[]},
          ]},
       ]},

      // ── ВПМ2: Койшыбаев
      {id:"vpm2", name:"Койшыбаев Галымжан Тельманович", title:"Зам. Премьер-Министра – Руководитель Аппарата Правительства", since:"2023", birthday:"1968", level:2, org:"Аппарат Правительства",
       bio:"Руководитель Аппарата Правительства с 2023 г.", children:[]},

      // ── ВПМ3: Бозумбаев
      {id:"vpm3", name:"Бозумбаев Канат Алдабергенович", title:"Заместитель Премьер-Министра", since:"2024", birthday:"1962", level:2, org:"Правительство",
       bio:"Заместитель Премьер-Министра с марта 2024 г. Ранее — аким Карагандинской и Павлодарской областей, министр энергетики. Курирует: транспорт, экологию, водные ресурсы.",
       children:[
         // МТ
         {id:"transport", name:"Сауранбаев Нурлан Ермекович", title:"Министр транспорта РК", since:"2024", birthday:"1969", level:3, org:"Министерство транспорта",
          bio:"Министр транспорта РК с 2024 г.",
          children:[
            {id:"mt_vm1", name:"Калиакпаров Максат Каиржанович", title:"Вице-министр транспорта", since:"", birthday:"", level:4, org:"МТ", bio:"", children:[]},
            {id:"mt_vm2", name:"Ластаев Талгат Тлеубекович", title:"Вице-министр транспорта", since:"", birthday:"", level:4, org:"МТ", bio:"", children:[]},
            {id:"mt_vm3", name:"Тайжанов Жанибек Жумаевич", title:"Вице-министр транспорта", since:"", birthday:"", level:4, org:"МТ", bio:"", children:[]},
            {id:"mt_vm4", name:"Кожахметов Дамир Маратович", title:"Вице-министр транспорта", since:"", birthday:"", level:4, org:"МТ", bio:"", children:[]},
            {id:"mt_app", name:"Дайырбеков Куаныш Рысбекулы", title:"Руководитель аппарата МТ", since:"", birthday:"", level:4, org:"МТ", bio:"", children:[]},
          ]},
         // МЭПР
         {id:"ecogeo", name:"Нысанбаев Ерлан Нуралиевич", title:"Министр экологии и природных ресурсов РК", since:"2024", birthday:"1961", level:3, org:"Министерство экологии и природных ресурсов",
          bio:"Министр экологии и природных ресурсов РК с 2024 г. Старейший по возрасту член Правительства.",
          children:[
            {id:"eco_vm1", name:"Шарбиев Нуркен Кожамуратович", title:"Вице-министр экологии", since:"", birthday:"", level:4, org:"МЭПР", bio:"", children:[]},
            {id:"eco_vm2", name:"Ошурбаев Мансур Турсынович", title:"Вице-министр экологии", since:"", birthday:"", level:4, org:"МЭПР", bio:"", children:[]},
            {id:"eco_vm3", name:"Алиев Жомарт Шияпович", title:"Вице-министр экологии", since:"", birthday:"", level:4, org:"МЭПР", bio:"", children:[]},
            {id:"eco_vm4", name:"Курмалаев Нурлан Саиынович", title:"Вице-министр экологии", since:"", birthday:"", level:4, org:"МЭПР", bio:"", children:[]},
            {id:"eco_app", name:"Беков Кыдырберди Андирович", title:"Руководитель аппарата МЭПР", since:"", birthday:"", level:4, org:"МЭПР", bio:"", children:[]},
          ]},
         // МВРИ
         {id:"water", name:"Нуржигитов Нуржан Молдиярович", title:"Министр водных ресурсов и ирригации РК", since:"2023", birthday:"1978", level:3, org:"Министерство водных ресурсов и ирригации",
          bio:"Министр водных ресурсов и ирригации РК с 2023 г.",
          children:[
            {id:"wt_vm1", name:"Алдамжаров Нурлан Жанузакович", title:"Первый вице-министр водных ресурсов", since:"", birthday:"", level:4, org:"МВРИ", bio:"", children:[]},
            {id:"wt_vm2", name:"Ибрайханов Ерболат Максутханович", title:"Вице-министр водных ресурсов", since:"", birthday:"", level:4, org:"МВРИ", bio:"", children:[]},
            {id:"wt_vm3", name:"Момышев Талгат Амангелдиевич", title:"Вице-министр водных ресурсов", since:"", birthday:"", level:4, org:"МВРИ", bio:"", children:[]},
            {id:"wt_vm4", name:"Абдраимов Аслан Сабазович", title:"Вице-министр водных ресурсов", since:"", birthday:"", level:4, org:"МВРИ", bio:"", children:[]},
            {id:"wt_app", name:"Казантаев Даурен Ганибекович", title:"Руководитель аппарата МВРИ", since:"", birthday:"", level:4, org:"МВРИ", bio:"", children:[]},
          ]},
       ]},

      // ── ВПМ4: Жумангарин
      {id:"vpm4", name:"Жумангарин Серик Макашевич", title:"Зам. Премьер-Министра – Министр национальной экономики", since:"2024", birthday:"1969", level:2, org:"МНЭ",
       bio:"Вице-премьер и министр национальной экономики с 2024 г.",
       children:[
         {id:"mne_vm1", name:"Амрин Азамат Кеменгерович", title:"Первый вице-министр нац. экономики", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         {id:"mne_vm2", name:"Касенов Арман Бакитжанович", title:"Вице-министр нац. экономики", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         {id:"mne_vm3", name:"Омарбеков Бауыржан Бакытулы", title:"Вице-министр нац. экономики", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         {id:"mne_vm4", name:"Дарбаев Асан Кобентаевич", title:"Вице-министр нац. экономики", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         {id:"mne_vm5", name:"Сагнаев Ерлан Ермекович", title:"Вице-министр нац. экономики", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         {id:"mne_app", name:"Сыздыков Олжас Олжабаевич", title:"Руководитель аппарата МНЭ", since:"", birthday:"", level:3, org:"МНЭ", bio:"", children:[]},
         // МТИ
         {id:"mti", name:"Шаккалиев Арман Абаевич", title:"Министр торговли и интеграции РК", since:"2023", birthday:"1977", level:3, org:"Министерство торговли и интеграции",
          bio:"Министр торговли и интеграции с сентября 2023 г. Ранее — Первый вице-министр МТИ (2022–2023). Курирует: внутреннюю и внешнюю торговлю, интеграцию, техрегулирование. Тел: +7(7172)74-94-97",
          children:[
            {id:"mti_app", name:"Каримов Азамат Кайратович", title:"Руководитель аппарата МТИ", since:"", birthday:"", level:4, org:"МТИ", bio:"Тел: +7(7172)75-16-03. Email: a.karimov@mti.gov.kz", children:[]},
            {id:"mti_vm1", name:"Бижанова Айжан Адиловна", title:"Первый вице-министр торговли и интеграции", since:"", birthday:"", female:true, level:4, org:"МТИ", bio:"Курирует: внутреннюю торговлю, защиту прав потребителей. Тел: +7(7172)74-96-03", children:[]},
            {id:"mti_vm2", name:"Кушукова Жанель Сабыровна", title:"Вице-министр торговли и интеграции", since:"", birthday:"", female:true, level:4, org:"МТИ", bio:"Курирует: внешнеторговую деятельность, экономическую интеграцию (ЕАЭС). Тел: +7(7172)75-07-24", children:[]},
            {id:"mti_vm3", name:"Нусупов Асет Ильясович", title:"Вице-министр торговли и интеграции", since:"", birthday:"", level:4, org:"МТИ", bio:"Курирует: цифровизацию, электронную торговлю. Тел: +7(7172)75-07-40", children:[]},
            {id:"mti_vm4", name:"Абилдабеков Айдар Ахметбекович", title:"Вице-министр торговли и интеграции", since:"2025", birthday:"1970", level:4, org:"МТИ", bio:"Вице-министр с 2025 г. Ранее — председатель Комитета торговли МТИ. Курирует: продвижение экспорта, техническое регулирование. Тел: +7(7172)75-07-26", children:[]},
          ]},
       ]},

      // ── ВПМ5: Мадиев (ИИ)
      {id:"vpm5", name:"Мадиев Жаслан Хасенович", title:"Зам. Премьер-Министра – Министр ИИ и цифрового развития", since:"2025", birthday:"1985", level:2, org:"МАИД",
       bio:"Вице-премьер и министр ИИ и цифрового развития с 2025 г. Новое министерство создано в 2025 г.",
       children:[
         {id:"maidd_vm1", name:"Коняшкин Ростислав Анатольевич", title:"Первый вице-министр ИИ и цифр. развития", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
         {id:"maidd_vm2", name:"Олжабеков Малик Серикович", title:"Вице-министр ИИ и цифр. развития", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
         {id:"maidd_vm3", name:"Мун Дмитрий Андреевич", title:"Вице-министр ИИ и цифр. развития", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
         {id:"maidd_vm4", name:"Мусалиев Досжан Уалдинович", title:"Вице-министр ИИ и цифр. развития", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
         {id:"maidd_vm5", name:"Мухаметкалиев Бахтияр Абаевич", title:"Вице-министр ИИ и цифр. развития", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
         {id:"maidd_app", name:"Джумабеков Арман Даирович", title:"Руководитель аппарата МАИД", since:"", birthday:"", level:3, org:"МАИД", bio:"", children:[]},
       ]},

      // ── ВПМ6: Балаева (Культура)
      {id:"vpm6", name:"Балаева Аида Галымовна", title:"Зам. Премьер-Министра – Министр культуры и информации", since:"2023", birthday:"1980", female:true, level:2, org:"МКИ",
       bio:"Вице-премьер и министр культуры и информации с 2023 г. Министр информации (2020–2022). Зам. руководителя АП (2022–2023).",
       children:[
         {id:"mki_vm1", name:"Искаков Канат Жумабаевич", title:"Первый вице-министр культуры и информации", since:"", birthday:"", level:3, org:"МКИ", bio:"", children:[]},
         {id:"mki_vm2", name:"Кочетов Евгений Дмитриевич", title:"Вице-министр культуры и информации", since:"", birthday:"", level:3, org:"МКИ", bio:"", children:[]},
         {id:"mki_vm3", name:"Али Рустам", title:"Вице-министр культуры и информации", since:"", birthday:"", level:3, org:"МКИ", bio:"", children:[]},
         {id:"mki_vm4", name:"Сыдыков Айбек Жексеналыевич", title:"Вице-министр культуры и информации", since:"", birthday:"", level:3, org:"МКИ", bio:"", children:[]},
         {id:"mki_app", name:"Мухаметкали Ринат Закиулы", title:"Руководитель аппарата МКИ", since:"", birthday:"", level:3, org:"МКИ", bio:"", children:[]},
         // МП
         {id:"edu", name:"Сулейменова Жулдыз Досбергеновна", title:"Министр просвещения РК", since:"2024", birthday:"1982", female:true, level:3, org:"Министерство просвещения",
          bio:"Министр просвещения РК с 2024 г.",
          children:[
            {id:"mp_vm1", name:"Мелдебекова Майра Турганбаевна", title:"Первый вице-министр просвещения", since:"", birthday:"", female:true, level:4, org:"МП", bio:"", children:[]},
            {id:"mp_vm2", name:"Акпарова Шынар Куанышовна", title:"Вице-министр просвещения", since:"", birthday:"", female:true, level:4, org:"МП", bio:"", children:[]},
            {id:"mp_vm3", name:"Шарабасов Жайык Сериккалиевич", title:"Вице-министр просвещения", since:"", birthday:"", level:4, org:"МП", bio:"", children:[]},
            {id:"mp_vm4", name:"Ахметжанов Асылбек Амантайулы", title:"Вице-министр просвещения", since:"", birthday:"", level:4, org:"МП", bio:"", children:[]},
            {id:"mp_app", name:"Жолманов Айдос Сагатович", title:"Руководитель аппарата МП", since:"", birthday:"", level:4, org:"МП", bio:"", children:[]},
          ]},
         // МНВО
         {id:"sci", name:"Нурбек Саясат", title:"Министр науки и высшего образования РК", since:"2022", birthday:"1980", level:3, org:"Министерство науки и высшего образования",
          bio:"Министр науки и высшего образования с 2022 г. Ранее — президент НАО Назарбаев Университет.",
          children:[
            {id:"sci_vm1", name:"Ешенкулов Талгат Ильясович", title:"Вице-министр науки и высшего образования", since:"", birthday:"", level:4, org:"МНВО", bio:"", children:[]},
            {id:"sci_vm2", name:"Кобенова Гулзат Избасаровна", title:"Вице-министр науки и высшего образования", since:"", birthday:"", female:true, level:4, org:"МНВО", bio:"", children:[]},
            {id:"sci_vm3", name:"Щеглова Динара Ринатовна", title:"Вице-министр науки и высшего образования", since:"", birthday:"", female:true, level:4, org:"МНВО", bio:"", children:[]},
            {id:"sci_app", name:"Кожахмет Мадияр Дуйсенбайулы", title:"Руководитель аппарата МНВО", since:"", birthday:"", level:4, org:"МНВО", bio:"", children:[]},
          ]},
         // МТС
         {id:"tsm", name:"Мырзабосынов Ербол Куантаевич", title:"Министр туризма и спорта РК", since:"2025", birthday:"1983", level:3, org:"Министерство туризма и спорта",
          bio:"Министр туризма и спорта РК с 2025 г. Ранее — аким Акмолинской области.",
          children:[
            {id:"tsm_vm1", name:"Рапиков Бауржан Серикбайевич", title:"Заместитель министра туризма и спорта", since:"", birthday:"", level:4, org:"МТС", bio:"", children:[]},
            {id:"tsm_vm2", name:"Жарасбаев Серик Маратович", title:"Заместитель министра туризма и спорта", since:"", birthday:"", level:4, org:"МТС", bio:"", children:[]},
            {id:"tsm_app", name:"Сериков Роллан Серикович", title:"Руководитель аппарата МТС", since:"", birthday:"", level:4, org:"МТС", bio:"", children:[]},
          ]},
       ]},

      // ── МВД (прямое подчинение ПМ)
      {id:"mvd", name:"Саденов Ержан Сапарбекович", title:"Министр внутренних дел РК", since:"2023", birthday:"1968", level:2, org:"МВД",
       bio:"Родился 24 октября 1968 г. Генерал-лейтенант полиции. Нач. ДП Акмолинской обл. (2016–2019), ДП Астаны (2019–2022). Зам. министра ВД (2022–2023). Министр с 2 сентября 2023 г.",
       children:[
         {id:"mvd_app", name:"Рысбаев Айдос Какашаулы", title:"Руководитель аппарата МВД", since:"", birthday:"", level:3, org:"МВД", bio:"", children:[]},
         {id:"mvd_vm1", name:"Аленов Бауржан Толегенович", title:"Первый заместитель министра ВД", since:"2024", birthday:"1976", level:3, org:"МВД", bio:"Первый вице-министр с октября 2024 г. Ранее — нач. ДП Алматинской области.", children:[]},
         {id:"mvd_vm2", name:"Адилов Санжар Аскенович", title:"Заместитель министра ВД", since:"2024", birthday:"", level:3, org:"МВД", bio:"Ранее — нач. академии МВД в Карагандe, нач. ДП Карагандинской области.", children:[]},
         {id:"mvd_vm3", name:"Лепеха Игорь Владимирович", title:"Заместитель министра ВД", since:"", birthday:"", level:3, org:"МВД", bio:"", children:[]},
         {id:"mvd_vm4", name:"Сайтбеков Айдар Муталикович", title:"Заместитель министра ВД", since:"", birthday:"", level:3, org:"МВД", bio:"", children:[]},
         {id:"mvd_vm5", name:"Балтабеков Ансаган Скендерович", title:"Зам. министра ВД – Главнокомандующий Нацгвардией", since:"2024", birthday:"", level:3, org:"МВД", bio:"Назначен 18 сентября 2024 г.", children:[]},
         {id:"mvd_vm6", name:"Кайырбеков Абай Серикович", title:"Зам. Министра ВД – Председатель Комитета УИС", since:"2025", birthday:"", level:3, org:"МВД", bio:"Назначен 28 февраля 2025 г.", children:[]},
         {id:"mvd_vm7", name:"Сарсенов Сакен Сейтжаппарович", title:"Заместитель министра ВД", since:"", birthday:"", level:3, org:"МВД", bio:"", children:[]},
       ]},

      // ── МО
      {id:"mod", name:"Косанов Даурен Жуматаевич", title:"Министр обороны РК", since:"2024", birthday:"1968", level:2, org:"МО",
       bio:"Министр обороны РК с 2024 г. Генерал армии.",
       children:[
         {id:"mod_vm1", name:"Абубакиров Каныш Асанханович", title:"Первый зам. МО – нач. Генерального штаба", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm2", name:"Мустабеков Аскар Досбосынович", title:"Зам. МО по воспитательной работе", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm3", name:"Жазыкбаев Шайх-Хасан Сатаркулулы", title:"Зам. МО по вооружению и военной технике", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm4", name:"Джумакеев Алмаз Дженишевич", title:"Зам. МО по тылу и военной инфраструктуре", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm5", name:"Ахмедиев Дархан Мейрамович", title:"Заместитель Министра обороны", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm6", name:"Садыков Кайрат Ануарбекович", title:"Зам. МО – Главнокомандующий Силами воздушной обороны", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
         {id:"mod_vm7", name:"Бейсенов Аскер Курмангалиевич", title:"Заместитель Министра обороны", since:"", birthday:"", level:3, org:"МО", bio:"", children:[]},
       ]},

      // ── МИД
      {id:"mfa", name:"Кошербаев Ермек Беделбаевич", title:"Министр иностранных дел РК", since:"2025", birthday:"1973", level:2, org:"МИД",
       bio:"Министр иностранных дел с 2025 г. Ранее — аким ВКО, посол Казахстана.",
       children:[
         {id:"mfa_vm1", name:"Ашикбаев Ержан Нигматуллаулы", title:"Первый заместитель Министра иностранных дел", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
         {id:"mfa_vm2", name:"Исетов Арман Аскарович", title:"Заместитель министра иностранных дел", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
         {id:"mfa_vm3", name:"Конуспаев Ермухамбет Болатпекович", title:"Заместитель министра иностранных дел", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
         {id:"mfa_vm4", name:"Бакаев Алибек Асетович", title:"Заместитель Министра иностранных дел", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
         {id:"mfa_vm5", name:"Куантыров Алибек Сакенович", title:"Заместитель Министра иностранных дел", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
         {id:"mfa_app", name:"Саинов Амангельды Газезович", title:"Руководитель аппарата МИД", since:"", birthday:"", level:3, org:"МИД", bio:"", children:[]},
       ]},

      // ── МИНЗДРАВ
      {id:"dsm", name:"Альназарова Акмарал Шарипбаевна", title:"Министр здравоохранения РК", since:"2024", birthday:"1975", female:true, level:2, org:"Министерство здравоохранения",
       bio:"Министр здравоохранения с 6 февраля 2024 г. Родилась в 1975 г. в Кызылорде. Врач. Депутат Сената до назначения.",
       children:[
         {id:"dsm_app", name:"Токежанов Болат Турганович", title:"Руководитель аппарата Минздрава", since:"", birthday:"", level:3, org:"Минздрав", bio:"", children:[]},
         {id:"dsm_vm1", name:"Султангазиев Тимур Сламжанович", title:"Первый вице-министр здравоохранения", since:"", birthday:"", level:3, org:"Минздрав", bio:"", children:[]},
         {id:"dsm_vm2", name:"Муратов Тимур Муратулы", title:"Вице-министр здравоохранения", since:"", birthday:"", level:3, org:"Минздрав", bio:"", children:[]},
         {id:"dsm_vm3", name:"Рустемова Алия Шайзадаевна", title:"Вице-министр здравоохранения", since:"", birthday:"", female:true, level:3, org:"Минздрав", bio:"", children:[]},
         {id:"dsm_vm4", name:"Оспанов Ербол Дуйсебаевич", title:"Вице-министр здравоохранения", since:"", birthday:"", level:3, org:"Минздрав", bio:"", children:[]},
       ]},

      // ── МЮ
      {id:"adilet", name:"Сарсембаев Ерлан Жаксылыкович", title:"Министр юстиции РК", since:"2024", birthday:"1977", level:2, org:"Министерство юстиции",
       bio:"Министр юстиции РК с 2024 г.",
       children:[
         {id:"myu_vm1", name:"Мерсалимова Лаура Канатовна", title:"Вице-министр юстиции", since:"", birthday:"", female:true, level:3, org:"МЮ", bio:"", children:[]},
         {id:"myu_vm2", name:"Молдабеков Бекболат Серикович", title:"Вице-министр юстиции", since:"", birthday:"", level:3, org:"МЮ", bio:"", children:[]},
         {id:"myu_vm3", name:"Жакселекова Ботагоз Шаймардановна", title:"Вице-министр юстиции", since:"", birthday:"", female:true, level:3, org:"МЮ", bio:"", children:[]},
         {id:"myu_vm4", name:"Ваисов Даниель Мереевич", title:"Вице-министр юстиции", since:"", birthday:"", level:3, org:"МЮ", bio:"", children:[]},
         {id:"myu_app", name:"Ерсеитова Сандугаш Абдразаковна", title:"Руководитель аппарата МЮ", since:"", birthday:"", female:true, level:3, org:"МЮ", bio:"", children:[]},
       ]},

      // ── МТСЗН
      {id:"enbek", name:"Ертаев Аскарбек Маратович", title:"Министр труда и соцзащиты РК", since:"2024", birthday:"1980", level:2, org:"Министерство труда и соцзащиты",
       bio:"Министр труда и социальной защиты населения РК с 2024 г.",
       children:[
         {id:"mtsz_vm1", name:"Шегай Виктория Вильгельмовна", title:"Вице-министр труда и соцзащиты", since:"", birthday:"", female:true, level:3, org:"МТСЗН", bio:"", children:[]},
         {id:"mtsz_vm2", name:"Жазыкпаев Бахтияр Базарбаевич", title:"Вице-министр труда и соцзащиты", since:"", birthday:"", level:3, org:"МТСЗН", bio:"", children:[]},
         {id:"mtsz_app", name:"Толеев Нурдаулет Толеулы", title:"Руководитель аппарата МТСЗН", since:"", birthday:"", level:3, org:"МТСЗН", bio:"", children:[]},
       ]},

      // ── МЧС
      {id:"emer", name:"Аринов Чингис Сайранулы", title:"Министр по чрезвычайным ситуациям РК", since:"2024", birthday:"1981", level:2, org:"МЧС",
       bio:"Министр по ЧС с 6 февраля 2024 г. Генерал-майор. 2006–2022 — СГО. Зам. нач. СГО (2022–2024).",
       children:[
         {id:"mchs_vm1", name:"Турсынбаев Кеген Ахметович", title:"Вице-министр по ЧС", since:"", birthday:"", level:3, org:"МЧС", bio:"", children:[]},
         {id:"mchs_vm2", name:"Камалов Рамиль Фаткулович", title:"Вице-министр по ЧС", since:"", birthday:"", level:3, org:"МЧС", bio:"", children:[]},
         {id:"mchs_vm3", name:"Абдышев Батырбек Кадырбекович", title:"Вице-министр по ЧС", since:"", birthday:"", level:3, org:"МЧС", bio:"", children:[]},
         {id:"mchs_vm4", name:"Садырбаев Ерболат Алтынбекович", title:"Вице-министр по ЧС", since:"", birthday:"", level:3, org:"МЧС", bio:"", children:[]},
         {id:"mchs_app", name:"Есимсеитов Даурен Сансызбаевич", title:"Руководитель аппарата МЧС", since:"", birthday:"", level:3, org:"МЧС", bio:"", children:[]},
       ]},

      // ══════════════════════════════════════════
      // АКИМАТЫ РЕГИОНОВ (реальные данные gov.kz)
      // ══════════════════════════════════════════

      // ОБЛАСТЬ АБАЙ
      {id:"ak_abay", name:"Берик Уали", title:"Аким области Абай", since:"2025", birthday:"1978", level:2, org:"Акимат обл. Абай",
       bio:"Аким области Абай с февраля 2025 г.",
       children:[
         {id:"abay_z1", name:"Садыр Ербол Абилхайырулы", title:"Первый заместитель акима обл. Абай", since:"", birthday:"", level:3, org:"Акимат обл. Абай", bio:"Курирует: экономику, бюджет, финансы, предпринимательство, туризм, инвестиции, здравоохранение, занятость.", children:[]},
         {id:"abay_z2", name:"Туленбергенов Серик Тулювгалиевич", title:"Заместитель акима обл. Абай", since:"", birthday:"", level:3, org:"Акимат обл. Абай", bio:"Курирует: строительство, ЖКХ, энергетику, транспорт, дороги, телекоммуникации.", children:[]},
         {id:"abay_z3", name:"Оспанов Думан Рыспекович", title:"Заместитель акима обл. Абай", since:"", birthday:"", level:3, org:"Акимат обл. Абай", bio:"Курирует: сельское хозяйство, ветеринарию, природные ресурсы.", children:[]},
         {id:"abay_z4", name:"Раханов Мейрлан Акылбекович", title:"Заместитель акима обл. Абай", since:"", birthday:"", level:3, org:"Акимат обл. Абай", bio:"Курирует: внутреннюю политику, культуру, информацию, образование, спорт, молодёжь.", children:[]},
         {id:"abay_app", name:"Бакпаев Эльдар Кусманович", title:"Руководитель аппарата акима обл. Абай", since:"", birthday:"", level:3, org:"Акимат обл. Абай", bio:"Курирует: цифровизацию, мобилизационную подготовку, правопорядок.", children:[
           {id:"abay_az1", name:"Самат Айбек Толегенович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат обл. Абай", bio:"Координирует: инспекционно-контрольный отдел, организационный отдел, мониторинг общественно-политической сферы.", children:[]},
           {id:"abay_az2", name:"Асылбекова Гульнур Нурбековна", title:"Заместитель руководителя аппарата", since:"", birthday:"", female:true, level:4, org:"Акимат обл. Абай", bio:"Координирует: отдел контроля и документооборота, сводный анализ, мониторинг экономики.", children:[]},
           {id:"abay_az3", name:"Есенжолов Нуржан Ергалиевич", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат обл. Абай", bio:"Координирует: управление персоналом, работу с обращениями, мониторинг АПК.", children:[]},
           {id:"abay_az4", name:"Алшынбай Ербол", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат обл. Абай", bio:"Координирует: антитеррористическую комиссию, мониторинг госуслуг и строительства.", children:[]},
           {id:"abay_press", name:"Касымов Азамат Абилович", title:"Пресс-секретарь акима обл. Абай", since:"", birthday:"", level:4, org:"Акимат обл. Абай", bio:"", children:[]},
         ]},
       ]},

      // АКТЮБИНСКАЯ
      {id:"ak_akt", name:"Шахаров Асхат Берлешевич", title:"Аким Актюбинской области", since:"2024", birthday:"1974", level:2, org:"Акимат Актюбинской обл.",
       bio:"Аким Актюбинской области с 2024 г.",
       children:[
         {id:"akt_z1", name:"Батырхан Жолдас Нурланович", title:"Заместитель акима — религия, образование, культура, молодёжь", since:"", birthday:"", level:3, org:"Акимат Актюбинской обл.", bio:"", children:[]},
         {id:"akt_z2", name:"Елеуов Галымжан Алмасбекович", title:"Заместитель акима — земля, соцзащита, экология, АПК", since:"", birthday:"", level:3, org:"Акимат Актюбинской обл.", bio:"", children:[]},
         {id:"akt_z3", name:"Есенбаев Асылбек Есимканович", title:"Заместитель акима — строительство, транспорт, ЖКХ", since:"", birthday:"", level:3, org:"Акимат Актюбинской обл.", bio:"", children:[]},
         {id:"akt_z4", name:"Абдикаримов Абзал Алиевич", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Актюбинской обл.", bio:"", children:[]},
         {id:"akt_app", name:"Амир Досхан Досжанович", title:"Руководитель аппарата акима области", since:"", birthday:"", level:3, org:"Акимат Актюбинской обл.", bio:"", children:[
           {id:"akt_az1", name:"Есенгалиев Муканбеткали Есжанович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Актюбинской обл.", bio:"", children:[]},
           {id:"akt_az2", name:"Сопрун Оксана Анатольевна", title:"Заместитель руководителя аппарата", since:"", birthday:"", female:true, level:4, org:"Акимат Актюбинской обл.", bio:"", children:[]},
           {id:"akt_az3", name:"Утемуратов Нургелды Сулейменович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Актюбинской обл.", bio:"", children:[]},
           {id:"akt_az4", name:"Есенаманов Адайбек Шакирович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Актюбинской обл.", bio:"", children:[]},
         ]},
       ]},

      // АКМОЛИНСКАЯ
      {id:"ak_akm", name:"Ахметжанов Марат Муратович", title:"Аким Акмолинской области", since:"2023", birthday:"1971", level:2, org:"Акимат Акмолинской обл.",
       bio:"Аким Акмолинской области с 5 сентября 2023 г.",
       children:[
         {id:"akm_z1", name:"Рамазанов Ельдос Муратович", title:"Первый заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
         {id:"akm_z2", name:"Балпан Мурат Сагатулы", title:"Заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
         {id:"akm_z3", name:"Жаркешов Ернар Серикбаевич", title:"Заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
         {id:"akm_z4", name:"Амренова Алтынай Байкадамовна", title:"Заместитель акима области", since:"", birthday:"", female:true, level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
         {id:"akm_z5", name:"Айтбаев Досулан Ерланович", title:"Заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
         {id:"akm_app", name:"Жумабеков Ержан Сулейменович", title:"Руководитель аппарата акима Акмолинской области", since:"", birthday:"", level:3, org:"Акимат Акмолинской обл.", bio:"", children:[]},
       ]},

      // АЛМАТИНСКАЯ
      {id:"ak_almobl", name:"Султангазиев Марат Елеусизович", title:"Аким Алматинской области", since:"2024", birthday:"1970", level:2, org:"Акимат Алматинской обл.",
       bio:"Аким Алматинской области с 2024 г.",
       children:[
         {id:"almobl_z1", name:"Есболатов Канат Болатович", title:"Первый заместитель акима Алматинской области", since:"", birthday:"", level:3, org:"Акимат Алматинской обл.", bio:"", children:[]},
         {id:"almobl_z2", name:"Масабаев Асет Дуйсебекович", title:"Заместитель акима Алматинской области", since:"", birthday:"", level:3, org:"Акимат Алматинской обл.", bio:"", children:[]},
         {id:"almobl_z3", name:"Бакытулы Бакытнур", title:"Заместитель акима Алматинской области", since:"", birthday:"", level:3, org:"Акимат Алматинской обл.", bio:"", children:[]},
         {id:"almobl_z4", name:"Майлыбаев Гани Айдарулы", title:"Заместитель акима Алматинской области", since:"", birthday:"", level:3, org:"Акимат Алматинской обл.", bio:"", children:[]},
         {id:"almobl_app", name:"Мадигулов Мурат Бахыткеримович", title:"Руководитель аппарата акима Алматинской области", since:"", birthday:"", level:3, org:"Акимат Алматинской обл.", bio:"", children:[]},
       ]},

      // АТЫРАУСКАЯ
      {id:"ak_atr", name:"Шапкенов Серик Жамбулович", title:"Аким Атырауской области", since:"2024", birthday:"1973", level:2, org:"Акимат Атырауской обл.",
       bio:"Аким Атырауской области с 2024 г.",
       children:[
         {id:"atr_z1", name:"Бисембиев Жасулан Оракович", title:"Заместитель акима Атырауской области", since:"", birthday:"", level:3, org:"Акимат Атырауской обл.", bio:"", children:[]},
         {id:"atr_z2", name:"Нуртаев Кайрат Талапович", title:"Заместитель акима Атырауской области", since:"", birthday:"", level:3, org:"Акимат Атырауской обл.", bio:"", children:[]},
         {id:"atr_z3", name:"Мурзиев Марат Бисенгалиевич", title:"Заместитель акима Атырауской области", since:"", birthday:"", level:3, org:"Акимат Атырауской обл.", bio:"", children:[]},
         {id:"atr_z4", name:"Шамуратов Дарын Дюсембаевич", title:"Заместитель акима Атырауской области", since:"", birthday:"", level:3, org:"Акимат Атырауской обл.", bio:"", children:[]},
         {id:"atr_app", name:"Женисбекулы Нурлыбек", title:"Руководитель аппарата акима области", since:"", birthday:"", level:3, org:"Акимат Атырауской обл.", bio:"", children:[]},
       ]},

      // ВКО
      {id:"ak_vko", name:"Сактаганов Нурымбет Аманович", title:"Аким Восточно-Казахстанской области", since:"2025", birthday:"1969", level:2, org:"Акимат ВКО",
       bio:"Аким ВКО с февраля 2025 г.",
       children:[
         {id:"vko_z1", name:"Нургалиев Ербол Жолдаспекович", title:"Заместитель акима ВКО", since:"", birthday:"", level:3, org:"Акимат ВКО", bio:"", children:[]},
         {id:"vko_z2", name:"Сапанов Дархан Бакытжанович", title:"Заместитель акима ВКО", since:"", birthday:"", level:3, org:"Акимат ВКО", bio:"", children:[]},
         {id:"vko_z3", name:"Байахметов Бакытжан Какенкаджиевич", title:"Заместитель акима ВКО", since:"", birthday:"", level:3, org:"Акимат ВКО", bio:"", children:[]},
         {id:"vko_app", name:"Текешов Ерлан Хасенович", title:"Руководитель аппарата акима ВКО", since:"", birthday:"", level:3, org:"Акимат ВКО", bio:"", children:[
           {id:"vko_az1", name:"Аспенбетова Раушан Найманханкызы", title:"Заместитель руководителя аппарата", since:"", birthday:"", female:true, level:4, org:"Акимат ВКО", bio:"", children:[]},
           {id:"vko_az2", name:"Асылханов Мерей Токтарбекович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат ВКО", bio:"", children:[]},
           {id:"vko_az3", name:"Сериков Бектас Серикулы", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат ВКО", bio:"", children:[]},
         ]},
       ]},

      // г. АЛМАТЫ
      {id:"ak_almaty", name:"Сатыбалды Дархан Амангельдиевич", title:"Аким г. Алматы", since:"2025", birthday:"1972", level:2, org:"Акимат г. Алматы",
       bio:"Аким Алматы с 2025 г. Ранее — аким Жамбылской области (2022–2024).",
       children:[
         {id:"alm_z1", name:"Сматлаев Алмасхан Бауржанович", title:"Первый заместитель акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
         {id:"alm_z2", name:"Шаханов Бейбут Маратханович", title:"Заместитель акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
         {id:"alm_z3", name:"Смагулов Олжас Мухтарович", title:"Заместитель акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
         {id:"alm_z4", name:"Абдрахим Нурлан Ергалиулы", title:"Заместитель акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
         {id:"alm_z5", name:"Нукенов Абзал Нукенович", title:"Заместитель акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
         {id:"alm_app", name:"Исабеков Ерлан Шойевич", title:"Руководитель аппарата акима г. Алматы", since:"", birthday:"", level:3, org:"Акимат г. Алматы", bio:"", children:[]},
       ]},

      // г. АСТАНА
      {id:"ak_astana", name:"Касымбек Женис Махмудулы", title:"Аким г. Астаны", since:"2023", birthday:"1969", level:2, org:"Акимат г. Астаны",
       bio:"Аким столицы с 2023 г. Ранее — министр индустрии и инфраструктурного развития.",
       children:[
         {id:"ast_z1", name:"Нуркенов Нурлан Жанбыршыулы", title:"Первый зам. акима — архитектура, строительство, экология", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"Курирует: архитектуру, градостроительство, земельные отношения, строительство, благоустройство, экологию, ветеринарию.", children:[]},
         {id:"ast_z2", name:"Байкен Есет Берикулы", title:"Зам. акима — внутренняя политика, образование, культура", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"Курирует: внутреннюю политику, образование, развитие языков, культуру, религию, профилактику правонарушений.", children:[]},
         {id:"ast_z3", name:"Глотов Евгений Сергеевич", title:"Зам. акима — экономика, инвестиции, цифровизация", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"Курирует: жилищную, налоговую, бюджетную политику, инвестиции, предпринимательство, промышленность, цифровизацию.", children:[]},
         {id:"ast_z4", name:"Отебаев Ерсин Кенжебаевич", title:"Зам. акима — энергетика, ЖКХ, дороги, LRT", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"Курирует: энергетику, газоснабжение, ЧС, ЖКХ, инженерные сети, автодороги, строительство LRT.", children:[]},
         {id:"ast_z5", name:"Мейрхан Ерик Серикович", title:"Зам. акима — здравоохранение, спорт, мобилизация", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"Курирует: здравоохранение, занятость, соцзащиту, спорт, мобилизационную подготовку.", children:[]},
         {id:"ast_app", name:"Ешкеев Даулат Затович", title:"Руководитель аппарата акима г. Астаны", since:"", birthday:"", level:3, org:"Акимат г. Астаны", bio:"", children:[]},
       ]},

      // г. ШЫМКЕНТ
      {id:"ak_shym", name:"Сыздыкбеков Габит Абдимажитович", title:"Аким г. Шымкент", since:"2023", birthday:"1975", level:2, org:"Акимат г. Шымкент",
       bio:"Аким Шымкента с 2023 г.",
       children:[
         {id:"shym_z1", name:"Каримов Айдын Мейрамбекович", title:"Первый заместитель акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
         {id:"shym_z2", name:"Куранбек Сарсен Абаевич", title:"Заместитель акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
         {id:"shym_z3", name:"Сейтенов Ержан Иргебаевич", title:"Заместитель акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
         {id:"shym_z4", name:"Сабитов Арман Сабитович", title:"Заместитель акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
         {id:"shym_z5", name:"Беркимбаев Берик Серикович", title:"Заместитель акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
         {id:"shym_app", name:"Аширбеков Берик Айдарович", title:"Руководитель аппарата акима г. Шымкент", since:"", birthday:"", level:3, org:"Акимат г. Шымкент", bio:"", children:[]},
       ]},

      // ЖАМБЫЛСКАЯ
      {id:"ak_zhb", name:"Карашукеев Ербол Шыракпаевич", title:"Аким Жамбылской области", since:"2022", birthday:"1976", level:2, org:"Акимат Жамбылской обл.",
       bio:"Аким Жамбылской области с 2022 г.",
       children:[
         {id:"zhb_z1", name:"Календеров Нуржан Сабитович", title:"Первый заместитель акима Жамбылской области", since:"", birthday:"", level:3, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         {id:"zhb_z2", name:"Али Алтай Сембекович", title:"Заместитель акима Жамбылской области", since:"", birthday:"", level:3, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         {id:"zhb_z3", name:"Тамабек Абулхаир Галымович", title:"Заместитель акима Жамбылской области", since:"", birthday:"", level:3, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         {id:"zhb_z4", name:"Есмагамбетова Айжан Серикбаевна", title:"Заместитель акима", since:"", birthday:"", female:true, level:3, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         {id:"zhb_z5", name:"Салемов Серик Жаксылыкович", title:"Заместитель акима Жамбылской области", since:"", birthday:"", level:3, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         {id:"zhb_app", name:"Илебаев Лесбек Куралбаевич", title:"Руководитель аппарата акима Жамбылской области", since:"", birthday:"", level:3, org:"Акимат Жамбылской обл.", bio:"", children:[
           {id:"zhb_az1", name:"Курманбеков Серик Сатбекович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Жамбылской обл.", bio:"", children:[]},
           {id:"zhb_az2", name:"Есеев Бауыржан Бакытжанович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Жамбылской обл.", bio:"", children:[]},
           {id:"zhb_az3", name:"Кенесбек Бекжан Айдарович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Жамбылской обл.", bio:"", children:[]},
           {id:"zhb_az4", name:"Айдарханов Дастан Алибекович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Жамбылской обл.", bio:"", children:[]},
         ]},
       ]},

      // ЖЕТЫСУСКАЯ
      {id:"ak_zhet", name:"Исабаев Бейбит Оксикбаевич", title:"Аким Жетысуской области", since:"2024", birthday:"1976", level:2, org:"Акимат Жетысуской обл.",
       bio:"Аким Жетысуской области с 2024 г.",
       children:[
         {id:"zhet_z1", name:"Жаканбаев Алибек Аскербекович", title:"Первый заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Жетысуской обл.", bio:"", children:[]},
         {id:"zhet_z2", name:"Канагатов Асет Серикович", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Жетысуской обл.", bio:"", children:[]},
         {id:"zhet_z3", name:"Кольбаев Марлен Капашович", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Жетысуской обл.", bio:"", children:[]},
         {id:"zhet_z4", name:"Есдаулетов Диас Рахметович", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Жетысуской обл.", bio:"", children:[]},
       ]},

      // ЗКО
      {id:"ak_zkaz", name:"Турегалиев Нариман", title:"Аким Западно-Казахстанской области", since:"2025", birthday:"1972", level:2, org:"Акимат ЗКО",
       bio:"Аким ЗКО с 2025 г.",
       children:[
         {id:"zkaz_z1", name:"Айтмухамбетов Калияр Шадиярович", title:"Заместитель акима ЗКО", since:"", birthday:"", level:3, org:"Акимат ЗКО", bio:"", children:[]},
         {id:"zkaz_z2", name:"Каюпов Тлепберген Ерсаевич", title:"Заместитель акима ЗКО", since:"", birthday:"", level:3, org:"Акимат ЗКО", bio:"", children:[]},
         {id:"zkaz_z3", name:"Мулкай Мирас Рустемович", title:"Заместитель акима ЗКО", since:"", birthday:"", level:3, org:"Акимат ЗКО", bio:"", children:[]},
         {id:"zkaz_z4", name:"Мендигалиев Каиржан Ермекович", title:"Заместитель акима ЗКО", since:"", birthday:"", level:3, org:"Акимат ЗКО", bio:"", children:[]},
         {id:"zkaz_app", name:"Ораз Нурдилда Серикулы", title:"Руководитель аппарата ЗКО", since:"", birthday:"", level:3, org:"Акимат ЗКО", bio:"", children:[
           {id:"zkaz_az1", name:"Мукамбетжанов Аскар Жумартович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат ЗКО", bio:"", children:[]},
           {id:"zkaz_az2", name:"Гумаров Жалгас Ахатович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат ЗКО", bio:"", children:[]},
         ]},
       ]},

      // КАРАГАНДИНСКАЯ
      {id:"ak_kar", name:"Булекпаев Ермаганбет Кабдулович", title:"Аким Карагандинской области", since:"2022", birthday:"1971", level:2, org:"Акимат Карагандинской обл.",
       bio:"Аким Карагандинской области с декабря 2022 г. Ранее — аким г. Карагандa.",
       children:[
         {id:"kar_z1", name:"Тайжанов Азамат Айтбаевич", title:"Первый зам. акима — энергетика, ЖКХ, строительство, транспорт", since:"", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"", children:[]},
         {id:"kar_z2", name:"Алпысов Ермек Амантаевич", title:"Зам. акима — финансы, МСБ, промышленность, инвестиции", since:"", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"", children:[]},
         {id:"kar_z3", name:"Таурбеков Ораз Кайсаевич", title:"Зам. акима — охрана труда, соцзащита, здравоохранение", since:"2024", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"Назначен в сентябре 2024 г. Ранее — аким г. Темиртау.", children:[]},
         {id:"kar_z4", name:"Алденей Алибек Усенулы", title:"Зам. акима — образование, внутренняя политика, культура, спорт", since:"", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"", children:[]},
         {id:"kar_z5", name:"Кенжебеков Руслан Айтыкенович", title:"Зам. акима — АПК, ветеринария, природопользование", since:"2025", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"Назначен в 2025 г.", children:[]},
         {id:"kar_app", name:"Галиев Ерлан Сагындыкович", title:"Руководитель аппарата акима Карагандинской области", since:"", birthday:"", level:3, org:"Акимат Карагандинской обл.", bio:"", children:[]},
       ]},

      // КОСТАНАЙСКАЯ
      {id:"ak_kost", name:"Аксакалов Кумар Иргибаевич", title:"Аким Костанайской области", since:"2023", birthday:"1968", level:2, org:"Акимат Костанайской обл.",
       bio:"Аким Костанайской области с 2023 г.",
       children:[
         {id:"kost_z1", name:"Абенов Арман Таргынович", title:"Заместитель акима Костанайской области", since:"", birthday:"", level:3, org:"Акимат Костанайской обл.", bio:"", children:[]},
         {id:"kost_z2", name:"Нарымбетов Бакытжан Хаберович", title:"Заместитель акима Костанайской области", since:"", birthday:"", level:3, org:"Акимат Костанайской обл.", bio:"", children:[]},
         {id:"kost_z3", name:"Танжариков Берик Куанышевич", title:"Заместитель акима Костанайской области", since:"", birthday:"", level:3, org:"Акимат Костанайской обл.", bio:"", children:[]},
         {id:"kost_app", name:"Сандыбаев Мурат Миртаевич", title:"Руководитель аппарата", since:"", birthday:"", level:3, org:"Акимат Костанайской обл.", bio:"", children:[]},
       ]},

      // КЫЗЫЛОРДИНСКАЯ
      {id:"ak_kyz", name:"Налибаев Нурлыбек Машбекович", title:"Аким Кызылординской области", since:"2022", birthday:"1974", level:2, org:"Акимат Кызылординской обл.",
       bio:"Аким Кызылординской области с 2022 г.",
       children:[
         {id:"kyz_z1", name:"Жаналинов Данияр Еренгалиевич", title:"Первый заместитель акима Кызылординской области", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         {id:"kyz_z2", name:"Жаханов Бахыт Дуйсенович", title:"Заместитель акима Кызылординской области", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         {id:"kyz_z3", name:"Зебешев Ардак Темирханович", title:"Заместитель акима Кызылординской области", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         {id:"kyz_z4", name:"Нуртай Кайрат Ырзакулович", title:"Зам. акима — Спецпредставитель Президента на Байконуре", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         {id:"kyz_z5", name:"Шермаганбет Мейрамбек Зинабдинулы", title:"Заместитель акима Кызылординской области", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         {id:"kyz_app", name:"Мухамедьяров Адильхан Мерекеевич", title:"Руководитель аппарата акима Кызылординской области", since:"", birthday:"", level:3, org:"Акимат Кызылординской обл.", bio:"", children:[
           {id:"kyz_az1", name:"Бакиров Ерлан Амирханович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Кызылординской обл.", bio:"", children:[]},
           {id:"kyz_az2", name:"Сыздыков Семсер Зулпыхарович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Кызылординской обл.", bio:"", children:[]},
           {id:"kyz_az3", name:"Ермеков Динмухамед Жандарбекович", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат Кызылординской обл.", bio:"", children:[]},
           {id:"kyz_press", name:"Шаханова Салтанат Касымовна", title:"Пресс-секретарь акима Кызылординской области", since:"", birthday:"", female:true, level:4, org:"Акимат Кызылординской обл.", bio:"", children:[]},
         ]},
       ]},

      // МАНГИСТАУСКАЯ
      {id:"ak_mang", name:"Килыбай Нурдаулет Игиликович", title:"Аким Мангистауской области", since:"2024", birthday:"1979", level:2, org:"Акимат Мангистауской обл.",
       bio:"Аким Мангистауской области с 2024 г.",
       children:[
         {id:"mang_z1", name:"Оралов Асхат Раздыкович", title:"Первый заместитель акима Мангистауской области", since:"", birthday:"", level:3, org:"Акимат Мангистауской обл.", bio:"", children:[]},
         {id:"mang_z2", name:"Урисбаев Аббат Жангирханович", title:"Заместитель акима Мангистауской области", since:"", birthday:"", level:3, org:"Акимат Мангистауской обл.", bio:"", children:[]},
         {id:"mang_z3", name:"Абдыкадиров Малик Сейлханович", title:"Заместитель акима Мангистауской области", since:"", birthday:"", level:3, org:"Акимат Мангистауской обл.", bio:"", children:[]},
         {id:"mang_z4", name:"Избергенов Ербол Курентаевич", title:"Заместитель акима Мангистауской области", since:"", birthday:"", level:3, org:"Акимат Мангистауской обл.", bio:"", children:[]},
         {id:"mang_z5", name:"Жеткизгенулы Тилек", title:"Заместитель акима Мангистауской области", since:"", birthday:"", level:3, org:"Акимат Мангистауской обл.", bio:"", children:[]},
       ]},

      // ПАВЛОДАРСКАЯ
      {id:"ak_pvl", name:"Байханов Асаин Куандыкович", title:"Аким Павлодарской области", since:"2022", birthday:"1970", level:2, org:"Акимат Павлодарской обл.",
       bio:"Аким Павлодарской области с 7 декабря 2022 г.",
       children:[
         {id:"pvl_z1", name:"Батыргужинов Серик Барлыбаевич", title:"Первый заместитель акима области", since:"", birthday:"", level:3, org:"Акимат Павлодарской обл.", bio:"", children:[]},
         {id:"pvl_z2", name:"Маликова Айгуль Каиртасовна", title:"Заместитель акима области", since:"", birthday:"", female:true, level:3, org:"Акимат Павлодарской обл.", bio:"", children:[]},
         {id:"pvl_z3", name:"Кабылтаева Айгерим Жанбиртаевна", title:"Заместитель акима области", since:"", birthday:"", female:true, level:3, org:"Акимат Павлодарской обл.", bio:"", children:[]},
         {id:"pvl_app", name:"Нефедова Наталья Владимировна", title:"И.о. руководителя аппарата акима области", since:"", birthday:"", female:true, level:3, org:"Акимат Павлодарской обл.", bio:"", children:[]},
       ]},

      // СКО
      {id:"ak_sko", name:"Нурмухамбетов Гауез Торсанович", title:"Аким Северо-Казахстанской области", since:"2022", birthday:"1975", level:2, org:"Акимат СКО",
       bio:"Аким СКО с 2022 г.",
       children:[
         {id:"sko_z1", name:"Тасмаганбетов Марат Иманбаевич", title:"Первый заместитель акима СКО", since:"", birthday:"", level:3, org:"Акимат СКО", bio:"", children:[]},
         {id:"sko_z2", name:"Дузелбаев Канат Малгаждарович", title:"Заместитель акима СКО", since:"", birthday:"", level:3, org:"Акимат СКО", bio:"", children:[]},
         {id:"sko_z3", name:"Кенесов Нурлан Маратулы", title:"Заместитель акима СКО", since:"", birthday:"", level:3, org:"Акимат СКО", bio:"", children:[]},
         {id:"sko_z4", name:"Жумагулов Жусуп Рахатович", title:"Заместитель акима СКО", since:"", birthday:"", level:3, org:"Акимат СКО", bio:"", children:[]},
         {id:"sko_app", name:"Алишев Руслан Канатханович", title:"Руководитель аппарата акима СКО", since:"", birthday:"", level:3, org:"Акимат СКО", bio:"", children:[
           {id:"sko_az1", name:"Нариман Азамат Нурканатулы", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат СКО", bio:"", children:[]},
           {id:"sko_az2", name:"Жусупова Куаныш Таласовна", title:"Заместитель руководителя аппарата", since:"", birthday:"", female:true, level:4, org:"Акимат СКО", bio:"", children:[]},
           {id:"sko_az3", name:"Тарахтун Анатолий Анатольевич", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат СКО", bio:"", children:[]},
           {id:"sko_az4", name:"Бухаров Нуржан Шалобаевич", title:"Заместитель руководителя аппарата", since:"", birthday:"", level:4, org:"Акимат СКО", bio:"", children:[]},
         ]},
       ]},

      // ТУРКЕСТАНСКАЯ
      {id:"ak_turk", name:"Кушеров Нуралхан Оралбаевич", title:"Аким Туркестанской области", since:"2025", birthday:"1972", level:2, org:"Акимат Туркестанской обл.",
       bio:"Аким Туркестанской области с января 2025 г.",
       children:[
         {id:"turk_z1", name:"Жолдасов Зулфухар Сансызбаевич", title:"Первый заместитель акима", since:"", birthday:"", level:3, org:"Акимат Туркестанской обл.", bio:"", children:[]},
         {id:"turk_z2", name:"Кайыпбек Канат Абдиразакулы", title:"Заместитель акима Туркестанской области", since:"", birthday:"", level:3, org:"Акимат Туркестанской обл.", bio:"", children:[]},
         {id:"turk_z3", name:"Еркебулан Дауылбаев Абилханович", title:"Заместитель акима Туркестанской области", since:"", birthday:"", level:3, org:"Акимат Туркестанской обл.", bio:"", children:[]},
         {id:"turk_z4", name:"Алтаев Ертай Кенжебекович", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Туркестанской обл.", bio:"", children:[]},
         {id:"turk_z5", name:"Турашбеков Нурбол Абдисаттарович", title:"Заместитель акима", since:"", birthday:"", level:3, org:"Акимат Туркестанской обл.", bio:"", children:[]},
       ]},

      // УЛЫТАУСКАЯ
      {id:"ak_ulyt", name:"Рыспеков Дастан Адаевич", title:"Аким области Улытау", since:"2024", birthday:"1980", level:2, org:"Акимат Улытауской обл.",
       bio:"Аким Улытауской области с 2024 г.",
       children:[
         {id:"ulyt_z1", name:"Идырысов Алмаз Серикболович", title:"Заместитель акима области Улытау", since:"", birthday:"", level:3, org:"Акимат Улытауской обл.", bio:"", children:[]},
         {id:"ulyt_z2", name:"Карипбаев Нуртас Галымович", title:"Заместитель акима области Улытау", since:"", birthday:"", level:3, org:"Акимат Улытауской обл.", bio:"", children:[]},
         {id:"ulyt_z3", name:"Акилбекова Зина Жуманазаровна", title:"Заместитель акима области Улытау", since:"", birthday:"", female:true, level:3, org:"Акимат Улытауской обл.", bio:"", children:[]},
         {id:"ulyt_app", name:"Смагулов Кенгирбай Конирович", title:"Руководитель аппарата акима области Улытау", since:"", birthday:"", level:3, org:"Акимат Улытауской обл.", bio:"", children:[]},
       ]},

      // ══════════════════════════════════════════
      // АГЕНТСТВА
      // ══════════════════════════════════════════
      {id:"ardfm", name:"Абылкасымова Мадина Ерасыловна", title:"Председатель АРРФР (финансовый регулятор)", since:"2021", birthday:"1974", female:true, level:2, org:"АРРФР",
       bio:"Председатель Агентства по регулированию и развитию финансового рынка. Регулирует банки, страховые компании, рынок ценных бумаг.",
       children:[
         {id:"ardfm_1", name:"Абилкасымов Тимур Бокейханович", title:"Первый Заместитель Председателя АРРФР", since:"", birthday:"", level:3, org:"АРРФР", bio:"", children:[]},
         {id:"ardfm_2", name:"Кизатов Олжас Толегенович", title:"Заместитель Председателя АРРФР", since:"", birthday:"", level:3, org:"АРРФР", bio:"", children:[]},
         {id:"ardfm_3", name:"Салимбаев Даурен Ниязбекович", title:"Заместитель Председателя АРРФР", since:"", birthday:"", level:3, org:"АРРФР", bio:"", children:[]},
         {id:"ardfm_4", name:"Турсунханов Нуржан Аскарович", title:"Заместитель Председателя АРРФР", since:"", birthday:"", level:3, org:"АРРФР", bio:"", children:[]},
         {id:"ardfm_app", name:"Исмагулова Жазира Жомартовна", title:"Руководитель Аппарата АРРФР", since:"", birthday:"", female:true, level:3, org:"АРРФР", bio:"", children:[]},
       ]},

      {id:"azrk", name:"Омаров Марат Талгатович", title:"Председатель Агентства по защите и развитию конкуренции", since:"2022", birthday:"1972", level:2, org:"АЗРК",
       bio:"Председатель АЗРК РК.",
       children:[
         {id:"azrk_1", name:"Ахметов Рустам Нурланович", title:"Первый заместитель Председателя АЗРК", since:"", birthday:"", level:3, org:"АЗРК", bio:"", children:[]},
         {id:"azrk_2", name:"Самбетов Болат Куанышбекович", title:"Заместитель Председателя АЗРК", since:"", birthday:"", level:3, org:"АЗРК", bio:"", children:[]},
         {id:"azrk_3", name:"Альжан Ерлан Ибрагимулы", title:"Заместитель Председателя АЗРК", since:"", birthday:"", level:3, org:"АЗРК", bio:"", children:[]},
         {id:"azrk_app", name:"Дарибаев Мурат Аманкельдиевич", title:"Руководитель Аппарата АЗРК", since:"", birthday:"", level:3, org:"АЗРК", bio:"", children:[]},
       ]},

      {id:"aspr", name:"Иргалиев Асет Арманович", title:"Председатель Агентства по стратегическому планированию и реформам", since:"2020", birthday:"1979", level:2, org:"АСПР",
       bio:"Председатель АСПР РК. Разрабатывает стратегические планы и реформы государственного управления.",
       children:[
         {id:"aspr_1", name:"Шаимова Айгуль Амантаевна", title:"Заместитель Председателя АСПР", since:"", birthday:"", female:true, level:3, org:"АСПР", bio:"", children:[]},
         {id:"aspr_2", name:"Тулеуов Олжас Аязбиевич", title:"Заместитель Председателя АСПР", since:"", birthday:"", level:3, org:"АСПР", bio:"", children:[]},
         {id:"aspr_3", name:"Каскеев Сырымбет Ерденович", title:"Заместитель Председателя АСПР", since:"", birthday:"", level:3, org:"АСПР", bio:"", children:[]},
         {id:"aspr_app", name:"Абдильдин Батырбек Султанович", title:"Руководитель аппарата АСПР", since:"", birthday:"", level:3, org:"АСПР", bio:"", children:[]},
       ]},

      {id:"afm", name:"Элиманов Жанат Калдыбекович", title:"Председатель Агентства по финансовому мониторингу", since:"2021", birthday:"1970", level:2, org:"АФМ",
       bio:"Председатель Агентства РК по финансовому мониторингу. Противодействие отмыванию денег и финансированию терроризма.",
       children:[
         {id:"afm_1", name:"Раисов Улан Ермуханович", title:"Первый заместитель Председателя АФМ", since:"", birthday:"", level:3, org:"АФМ", bio:"", children:[]},
         {id:"afm_2", name:"Бижанов Кайрат Жакиянович", title:"Заместитель Председателя АФМ", since:"", birthday:"", level:3, org:"АФМ", bio:"", children:[]},
         {id:"afm_3", name:"Елемесов Женис Фарахатович", title:"Заместитель Председателя АФМ", since:"", birthday:"", level:3, org:"АФМ", bio:"", children:[]},
         {id:"afm_app", name:"Сагындыков Амир Абаевич", title:"Руководитель Аппарата АФМ", since:"", birthday:"", level:3, org:"АФМ", bio:"", children:[]},
       ]},

      {id:"atom", name:"Саткалиев Алмасадам Майданович", title:"Председатель Агентства по атомной энергии РК", since:"2023", birthday:"1972", level:2, org:"Атомное агентство",
       bio:"Председатель Агентства РК по атомной энергии с 2023 г. Ранее — министр энергетики.",
       children:[
         {id:"atom_app", name:"Асылов Куаныш Жумабекович", title:"Руководитель аппарата Агентства", since:"", birthday:"", level:3, org:"Атомное агентство", bio:"", children:[]},
         {id:"atom_1", name:"Жантикин Тимур Мифтахович", title:"Заместитель председателя Агентства по атомной энергии", since:"", birthday:"", level:3, org:"Атомное агентство", bio:"", children:[]},
         {id:"atom_2", name:"Лавренов Василий Сергеевич", title:"Заместитель председателя Агентства по атомной энергии", since:"", birthday:"", level:3, org:"Атомное агентство", bio:"", children:[]},
         {id:"atom_3", name:"Сергазин Гумар Екпинович", title:"Заместитель председателя Агентства по атомной энергии", since:"", birthday:"", level:3, org:"Атомное агентство", bio:"", children:[]},
         {id:"atom_4", name:"Махамбетов Асет Кенесбекович", title:"Заместитель председателя Агентства по атомной энергии", since:"", birthday:"", level:3, org:"Атомное агентство", bio:"", children:[]},
       ]},

      {id:"qyzmet", name:"Жазыкбай Дархан Медегалиулы", title:"Председатель Агентства по делам государственной службы", since:"2022", birthday:"1980", level:2, org:"Агентство по делам госслужбы",
       bio:"Председатель Агентства РК по делам государственной службы.",
       children:[
         {id:"qyz_1", name:"Муксимов Салауат Силибаевич", title:"Заместитель Председателя", since:"", birthday:"", level:3, org:"Агентство по делам госслужбы", bio:"", children:[]},
         {id:"qyz_2", name:"Ахмедьяр Алибек Газизулы", title:"Заместитель Председателя", since:"", birthday:"", level:3, org:"Агентство по делам госслужбы", bio:"", children:[]},
         {id:"qyz_3", name:"Бекиш Улан Абдилкаилулы", title:"Заместитель Председателя", since:"", birthday:"", level:3, org:"Агентство по делам госслужбы", bio:"", children:[]},
         {id:"qyz_app", name:"Имашев Данияр Муратович", title:"Руководитель аппарата Агентства", since:"", birthday:"", level:3, org:"Агентство по делам госслужбы", bio:"", children:[]},
       ]},

     ]}, // end pm.children
  ]
};

// ─── FLATTEN ──────────────────────────────────────────────────────────────────
function flatten(node, acc=[]) {
  acc.push(node);
  node.children?.forEach(c => flatten(c, acc));
  return acc;
}
const ALL_NODES = flatten(TREE);

// ─── COLORS ───────────────────────────────────────────────────────────────────
const LC = ["#d4af37","#60a5fa","#a78bfa","#34d399","#f97316","#94a3b8"];
const lc = l => LC[Math.min(l, LC.length-1)];

function getNodeLevel(id, node, lvl=0) {
  if (node.id===id) return lvl;
  for (const c of (node.children||[])) { const r=getNodeLevel(id,c,lvl+1); if(r>=0) return r; }
  return -1;
}

// ─── TREE NODE COMPONENT ──────────────────────────────────────────────────────
function TreeNode({ node, level, expandedSet, onToggle, onSelect, selectedId }) {
  const isExpanded = expandedSet.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children?.length > 0;
  const { alert } = getAlerts(node);
  const sinceYear = parseYear(node.since);
  const yearsIn = sinceYear ? new Date().getFullYear() - sinceYear : null;

  return (
    <div style={{ marginLeft: level * 14 }}>
      <div onClick={() => { onSelect(node); if(hasChildren) onToggle(node.id); }}
        style={{ display:"flex", alignItems:"center", gap:6,
          padding:"6px 10px", marginBottom:2, borderRadius:6, cursor:"pointer",
          background: isSelected ? `${lc(level)}12` : alert?.type?.includes('over') ? "#dc262606" : "transparent",
          border:`1px solid ${isSelected ? lc(level) : alert ? (alert.type.includes('over') ? "#dc262630" : "#d9780630") : "transparent"}`,
          transition:"all 0.1s" }}>
        <span style={{ width:12, fontSize:9, color:"#4b5563", textAlign:"center", flexShrink:0 }}>
          {hasChildren ? (isExpanded?"▼":"▶") : "·"}
        </span>
        <span style={{ width:6, height:6, borderRadius:"50%", background:lc(level), flexShrink:0, display:"inline-block" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:isSelected?lc(level):"#e5e7eb",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {node.name}
          </div>
          <div style={{ fontSize:9, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {node.title}
          </div>
        </div>
        {yearsIn !== null && (
          <span style={{ fontSize:9, color: yearsIn >= 3 ? "#f97316" : "#4b5563", flexShrink:0 }}>
            {yearsIn}л
          </span>
        )}
        <AlertBadge node={node} />
      </div>

      {hasChildren && isExpanded && (
        <div style={{ borderLeft:`1px solid ${lc(level)}20`, marginLeft:10, paddingLeft:4 }}>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level+1}
              expandedSet={expandedSet} onToggle={onToggle}
              onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [expanded, setExpanded] = useState(new Set(["president","pm"]));
  const [selected, setSelected] = useState(TREE);
  const [query, setQuery] = useState("");

  const toggle = useCallback(id => {
    setExpanded(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_NODES.filter(n =>
      n.name.toLowerCase().includes(q) ||
      n.title.toLowerCase().includes(q) ||
      (n.org||"").toLowerCase().includes(q)
    ).slice(0,30);
  }, [query]);

  const level = selected ? getNodeLevel(selected.id, TREE) : 0;
  const { rot, pen } = selected ? getAlerts(selected) : {};
  const currentYear = new Date().getFullYear();
  const sinceYear = parseYear(selected?.since);
  const birthYear = parseBirthYear(selected?.birthday);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh",
      background:"#080808", color:"#f3f4f6", fontFamily:"'Segoe UI',sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0f0a1a,#0a1628)",
        borderBottom:"1px solid #1a2a3a", padding:"12px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <span style={{ fontSize:26 }}>🇰🇿</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Georgia',serif", fontSize:16, color:"#d4af37" }}>GovTree Казахстан</div>
            <div style={{ fontSize:10, color:"#4b5563" }}>
              {ALL_NODES.length} чиновников · Данные gov.kz 2025 · Оранжевый = 3+ лет в должности · Красная рамка = ротация/пенсия
            </div>
          </div>
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={()=>setExpanded(new Set(ALL_NODES.map(n=>n.id)))} style={btnS}>+</button>
            <button onClick={()=>setExpanded(new Set(["president"]))} style={btnS}>−</button>
          </div>
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="🔍  Поиск по ФИО, должности, ведомству..."
          style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.05)",
            border:"1px solid #1e3a5f", borderRadius:8, padding:"8px 14px",
            color:"#f3f4f6", fontSize:13, outline:"none" }} />
      </div>

      {/* SEARCH DROPDOWN */}
      {query && searchResults.length > 0 && (
        <div style={{ background:"#0d1117", border:"1px solid #1e3a5f", borderTop:"none",
          maxHeight:220, overflowY:"auto", flexShrink:0, zIndex:100 }}>
          {searchResults.map(n => (
            <div key={n.id} onClick={()=>{ setSelected(n); setQuery(""); }}
              style={{ padding:"8px 16px", cursor:"pointer", borderBottom:"1px solid #111",
                display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:"#e5e7eb", fontWeight:600 }}>{n.name}</div>
                <div style={{ fontSize:10, color:"#6b7280" }}>{n.title} · {n.org}</div>
              </div>
              <AlertBadge node={n} />
            </div>
          ))}
        </div>
      )}

      {/* MAIN SPLIT */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* LEFT TREE */}
        <div style={{ width:"52%", overflowY:"auto", padding:"10px 8px 10px 12px", borderRight:"1px solid #111" }}>
          <TreeNode node={TREE} level={0} expandedSet={expanded} onToggle={toggle}
            onSelect={setSelected} selectedId={selected?.id} />
        </div>

        {/* RIGHT PROFILE */}
        <div style={{ width:"48%", overflowY:"auto", padding:16 }}>
          {selected && (
            <>
              {/* Avatar + name */}
              <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                <div style={{ width:50, height:50, borderRadius:"50%", flexShrink:0,
                  background:`${lc(level)}20`, border:`2px solid ${lc(level)}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:700, color:lc(level), fontFamily:"'Georgia',serif" }}>
                  {selected.name.split(" ").slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"?"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Georgia',serif", fontSize:14, fontWeight:700, color:lc(level), lineHeight:1.3, marginBottom:4 }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{selected.title}</div>
                  {selected.org && <div style={{ fontSize:10, color:"#4b5563", marginTop:2 }}>{selected.org}</div>}
                </div>
              </div>

              {/* Meta grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
                {[
                  ["📅 Назначен", selected.since || "—"],
                  ["⏱ Лет в должности", sinceYear ? `${currentYear - sinceYear} лет` : "—"],
                  ["🎂 Год рождения", birthYear ? `${birthYear} (${currentYear-birthYear} лет)` : "—"],
                  ["📊 Уровень иерархии", level >= 0 ? `${level} уровень` : "—"],
                ].map(([l,v]) => (
                  <div key={l} style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:7, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, color:"#4b5563", marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:11, color:"#d1d5db", fontWeight:600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ALERTS PANEL */}
              {(rot && sinceYear || pen && birthYear) && (
                <div style={{ background:"#0a0a0a", border:"1px solid #1f1f1f", borderRadius:10, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:10, color:"#d4af37", marginBottom:10, fontWeight:700 }}>⚠️ КАДРОВЫЕ РИСКИ</div>

                  {rot && sinceYear && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:"#9ca3af" }}>🔄 Ротация (лимит {rot.rotLimit} г.)</span>
                        <span style={{ fontSize:11, fontWeight:700, color: rot.overdue?"#f87171":rot.yearsLeft<=1?"#fbbf24":"#4ade80" }}>
                          {rot.overdue ? `Просрочена на ${-rot.yearsLeft}г.` : rot.yearsLeft===0 ? "В этом году" : `Через ${rot.yearsLeft}г.`}
                        </span>
                      </div>
                      <div style={{ height:5, background:"#1a1a1a", borderRadius:3 }}>
                        <div style={{ height:"100%", borderRadius:3, transition:"width 0.3s",
                          background: rot.overdue?"#dc2626":rot.yearsLeft<=1?"#d97706":"#16a34a",
                          width:`${Math.min(100,(rot.yearsIn/rot.rotLimit)*100)}%` }} />
                      </div>
                      <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>
                        В должности {rot.yearsIn} из {rot.rotLimit} лет
                      </div>
                    </div>
                  )}

                  {pen && birthYear && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:"#9ca3af" }}>👴 Пенсия (возраст {pen.pensionAge} лет)</span>
                        <span style={{ fontSize:11, fontWeight:700, color: pen.overdue?"#a78bfa":pen.yearsLeft<=3?"#60a5fa":"#9ca3af" }}>
                          {pen.overdue ? "Пенс. возраст достигнут" : pen.yearsLeft<=0 ? "В этом году" : `Через ${pen.yearsLeft}г.`}
                        </span>
                      </div>
                      <div style={{ height:5, background:"#1a1a1a", borderRadius:3 }}>
                        <div style={{ height:"100%", borderRadius:3,
                          background: pen.overdue?"#7c3aed":pen.yearsLeft<=3?"#2563eb":"#374151",
                          width:`${Math.min(100,(pen.age/pen.pensionAge)*100)}%` }} />
                      </div>
                      <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>
                        Сейчас {pen.age} лет · пенсия в {pen.pensionAge}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BIO */}
              {selected.bio && (
                <div style={{ background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:10, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:10, color:"#60a5fa", marginBottom:8, fontWeight:700 }}>📋 БИОГРАФИЯ / НАПРАВЛЕНИЯ</div>
                  <div style={{ fontSize:12, color:"#c9d1db", lineHeight:1.8 }}>{selected.bio}</div>
                </div>
              )}

              {/* SUBORDINATES */}
              {selected.children?.length > 0 && (
                <div style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:10, color:"#d4af37", marginBottom:10, fontWeight:700 }}>
                    👥 ПОДЧИНЁННЫЕ ({selected.children.length})
                  </div>
                  {selected.children.map(child => {
                    const { alert:ca } = getAlerts(child);
                    return (
                      <div key={child.id} onClick={()=>setSelected(child)}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                          borderRadius:7, cursor:"pointer", marginBottom:3,
                          background: ca?.type?.includes('over') ? "#dc262606" : "#111",
                          border:`1px solid ${ca ? (ca.type.includes('over')?"#dc262628":"#d9780628") : "#1a1a1a"}` }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:lc(level+1), flexShrink:0, display:"inline-block" }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, color:"#e5e7eb", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {child.name}
                          </div>
                          <div style={{ fontSize:9, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {child.title}
                          </div>
                        </div>
                        <AlertBadge node={child} />
                        {child.children?.length > 0 && (
                          <span style={{ fontSize:9, color:"#374151" }}>{child.children.length}▶</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const btnS = {
  background:"#0d1f3c", border:"1px solid #1e3a5f", borderRadius:6,
  color:"#60a5fa", padding:"5px 10px", cursor:"pointer", fontSize:14
};
