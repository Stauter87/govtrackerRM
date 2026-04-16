import { useState, useEffect, useCallback, useRef } from "react";

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
};

// ─── ANTHROPIC API ────────────────────────────────────────────────────────────
const callClaude = async (prompt, sys = "") => {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: sys || "Ты эксперт по госструктуре Казахстана. Отвечай ТОЛЬКО валидным JSON без markdown.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const d = await r.json();
  const text = d.content?.[0]?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_OFFICIALS = [
  // УРОВЕНЬ 0
  { id: "president", name: "Касым-Жомарт Токаев", title: "Президент РК", org: "Администрация Президента", since: "2019", level: 0, parentId: null, birthday: "17.05.1953", photo: "👤" },
  // УРОВЕНЬ 1
  { id: "pm", name: "Олжас Бектенов", title: "Премьер-Министр", org: "Правительство", since: "2024", level: 1, parentId: "president", birthday: "26.05.1981", photo: "👤" },
  { id: "senate_ch", name: "Маулен Ашимбаев", title: "Председатель Сената", org: "Сенат", since: "2020", level: 1, parentId: "president", birthday: "20.08.1969", photo: "👤" },
  { id: "majilis_ch", name: "Ерлан Кошанов", title: "Председатель Мажилиса", org: "Мажилис", since: "2022", level: 1, parentId: "president", birthday: "14.03.1968", photo: "👤" },
  { id: "admin_ch", name: "Айбек Дадебаев", title: "Руководитель Администрации Президента", org: "АП", since: "2024", level: 1, parentId: "president", birthday: "12.09.1970", photo: "👤" },
  { id: "genproc", name: "Берик Асылов", title: "Генеральный Прокурор", org: "Генпрокуратура", since: "2023", level: 1, parentId: "president", birthday: "05.11.1972", photo: "👤" },
  { id: "sup_court", name: "Асламбек Мергалиев", title: "Председатель Верховного Суда", org: "Верховный Суд", since: "2022", level: 1, parentId: "president", birthday: "03.07.1965", photo: "👤" },
  { id: "knb", name: "Гизат Нурдаулетов", title: "Председатель КНБ", org: "КНБ", since: "2022", level: 1, parentId: "president", birthday: "01.04.1970", photo: "👤" },
  // ВИЦЕ-ПРЕМЬЕРЫ
  { id: "vpm1", name: "Роман Скляр", title: "Первый Зам. Премьер-Министра", org: "Правительство", since: "2022", level: 2, parentId: "pm", birthday: "28.06.1967", photo: "👤" },
  { id: "vpm2", name: "Галымжан Койшыбаев", title: "Зам. Премьер-Министра – Рук. Аппарата Правительства", org: "Правительство", since: "2023", level: 2, parentId: "pm", birthday: "14.11.1974", photo: "👤" },
  { id: "vpm3", name: "Канат Бозумбаев", title: "Заместитель Премьер-Министра", org: "Правительство", since: "2024", level: 2, parentId: "pm", birthday: "22.08.1962", photo: "👤" },
  { id: "vpm4", name: "Серик Жумангарин", title: "Зам. Премьер-Министра – Министр нац. экономики", org: "МНЭ", since: "2024", level: 2, parentId: "pm", birthday: "17.03.1969", photo: "👤" },
  { id: "vpm5", name: "Жаслан Мадиев", title: "Зам. Премьер-Министра – Министр ИИ и цифр. развития", org: "МЦРИАП", since: "2025", level: 2, parentId: "pm", birthday: "09.01.1985", photo: "👤" },
  { id: "vpm6", name: "Айда Балаева", title: "Зам. Премьер-Министра – Министр культуры и информации", org: "МКИ", since: "2023", level: 2, parentId: "pm", birthday: "28.09.1980", photo: "👤" },
  // МИНИСТРЫ
  { id: "min_finance", name: "Мади Такиев", title: "Министр финансов", org: "Минфин", since: "2024", level: 3, parentId: "vpm4", birthday: "15.06.1979", photo: "👤" },
  { id: "min_trade", name: "Арман Шаккалиев", title: "Министр торговли и интеграции", org: "МТИ", since: "2024", level: 3, parentId: "vpm4", birthday: "04.10.1976", photo: "👤" },
  { id: "min_interior", name: "Ержан Саденов", title: "Министр внутренних дел", org: "МВД", since: "2023", level: 3, parentId: "pm", birthday: "20.03.1971", photo: "👤" },
  { id: "min_defense", name: "Даурен Косанов", title: "Министр обороны", org: "МО", since: "2024", level: 3, parentId: "pm", birthday: "11.07.1968", photo: "👤" },
  { id: "min_foreign", name: "Ермек Кошербаев", title: "Министр иностранных дел", org: "МИД", since: "2025", level: 3, parentId: "pm", birthday: "08.12.1973", photo: "👤" },
  { id: "min_health", name: "Акмарал Альназарова", title: "Министр здравоохранения", org: "Минздрав", since: "2024", level: 3, parentId: "pm", birthday: "14.04.1975", photo: "👤" },
  { id: "min_edu", name: "Жулдыз Сулейменова", title: "Министр просвещения", org: "МП", since: "2024", level: 3, parentId: "vpm6", birthday: "25.08.1982", photo: "👤" },
  { id: "min_sci", name: "Саясат Нурбек", title: "Министр науки и высшего образования", org: "МНВО", since: "2022", level: 3, parentId: "vpm6", birthday: "05.03.1980", photo: "👤" },
  { id: "min_agr", name: "Айдарбек Сапаров", title: "Министр сельского хозяйства", org: "МСХ", since: "2024", level: 3, parentId: "vpm1", birthday: "12.02.1977", photo: "👤" },
  { id: "min_energy", name: "Ерлан Аккенженов", title: "Министр энергетики", org: "МЭ", since: "2024", level: 3, parentId: "vpm1", birthday: "19.11.1974", photo: "👤" },
  { id: "min_ind", name: "Ерсайын Нагасбаев", title: "Министр промышленности и строительства", org: "МПС", since: "2024", level: 3, parentId: "vpm1", birthday: "30.06.1975", photo: "👤" },
  { id: "min_transport", name: "Нурлан Сауранбаев", title: "Министр транспорта", org: "МТ", since: "2024", level: 3, parentId: "vpm3", birthday: "07.11.1969", photo: "👤" },
  { id: "min_eco", name: "Ерлан Нысанбаев", title: "Министр экологии и природных ресурсов", org: "МЭПР", since: "2024", level: 3, parentId: "vpm3", birthday: "22.05.1976", photo: "👤" },
  { id: "min_water", name: "Нуржан Нуржигитов", title: "Министр водных ресурсов и ирригации", org: "МВРИ", since: "2023", level: 3, parentId: "vpm3", birthday: "03.09.1978", photo: "👤" },
  { id: "min_labor", name: "Аскарбек Ертаев", title: "Министр труда и соцзащиты", org: "МТСЗН", since: "2024", level: 3, parentId: "pm", birthday: "16.01.1980", photo: "👤" },
  { id: "min_just", name: "Ерлан Сарсембаев", title: "Министр юстиции", org: "МЮ", since: "2024", level: 3, parentId: "pm", birthday: "09.07.1977", photo: "👤" },
  { id: "min_emer", name: "Чингис Аринов", title: "Министр по чрезвычайным ситуациям", org: "МЧС", since: "2024", level: 3, parentId: "pm", birthday: "25.10.1981", photo: "👤" },
  { id: "min_sport", name: "Ербол Мырзабосынов", title: "Министр туризма и спорта", org: "МТС", since: "2025", level: 3, parentId: "vpm6", birthday: "11.06.1983", photo: "👤" },
  // АКИМЫ ОБЛАСТЕЙ
  { id: "ak_astana", name: "Женис Касымбек", title: "Аким г. Астаны", org: "Акимат Астаны", since: "2023", level: 3, parentId: "pm", birthday: "15.07.1969", photo: "👤" },
  { id: "ak_almaty", name: "Дархан Сатыбалды", title: "Аким г. Алматы", org: "Акимат Алматы", since: "2025", level: 3, parentId: "pm", birthday: "24.05.1972", photo: "👤" },
  { id: "ak_shym", name: "Габит Сыздыкбеков", title: "Аким г. Шымкент", org: "Акимат Шымкент", since: "2023", level: 3, parentId: "pm", birthday: "03.12.1975", photo: "👤" },
  { id: "ak_abay", name: "Берик Уали", title: "Аким Абайской обл.", org: "Акимат обл. Абай", since: "2025", level: 3, parentId: "pm", birthday: "08.03.1978", photo: "👤" },
  { id: "ak_akm", name: "Марат Ахметжанов", title: "Аким Акмолинской обл.", org: "Акимат Акмолинской обл.", since: "2023", level: 3, parentId: "pm", birthday: "20.09.1971", photo: "👤" },
  { id: "ak_akt", name: "Асхат Шахаров", title: "Аким Актюбинской обл.", org: "Акимат Актюбинской обл.", since: "2024", level: 3, parentId: "pm", birthday: "13.04.1974", photo: "👤" },
  { id: "ak_almobl", name: "Марат Султангазиев", title: "Аким Алматинской обл.", org: "Акимат Алматинской обл.", since: "2024", level: 3, parentId: "pm", birthday: "07.11.1970", photo: "👤" },
  { id: "ak_atr", name: "Серик Шапкенов", title: "Аким Атырауской обл.", org: "Акимат Атырауской обл.", since: "2024", level: 3, parentId: "pm", birthday: "29.06.1973", photo: "👤" },
  { id: "ak_vko", name: "Нурымбет Сактаганов", title: "Аким ВКО", org: "Акимат ВКО", since: "2025", level: 3, parentId: "pm", birthday: "17.02.1969", photo: "👤" },
  { id: "ak_zhb", name: "Ербол Карашукеев", title: "Аким Жамбылской обл.", org: "Акимат Жамбылской обл.", since: "2022", level: 3, parentId: "pm", birthday: "12.08.1976", photo: "👤" },
  { id: "ak_zhet", name: "Дастан Рыспеков", title: "Аким Жетысуской обл.", org: "Акимат Жетысуской обл.", since: "2024", level: 3, parentId: "pm", birthday: "04.01.1980", photo: "👤" },
  { id: "ak_zkaz", name: "Нуралхан Кушеров", title: "Аким ЗКО", org: "Акимат ЗКО", since: "2025", level: 3, parentId: "pm", birthday: "22.07.1972", photo: "👤" },
  { id: "ak_kar", name: "Ермаганбет Булекпаев", title: "Аким Карагандинской обл.", org: "Акимат Карагандинской обл.", since: "2023", level: 3, parentId: "pm", birthday: "11.10.1971", photo: "👤" },
  { id: "ak_kost", name: "Кумар Аксакалов", title: "Аким Костанайской обл.", org: "Акимат Костанайской обл.", since: "2023", level: 3, parentId: "pm", birthday: "05.05.1968", photo: "👤" },
  { id: "ak_kyz", name: "Нурлыбек Налибаев", title: "Аким Кызылординской обл.", org: "Акимат Кызылординской обл.", since: "2022", level: 3, parentId: "pm", birthday: "30.11.1974", photo: "👤" },
  { id: "ak_mang", name: "Нурлан Ногаев", title: "Аким Мангистауской обл.", org: "Акимат Мангистауской обл.", since: "2019", level: 3, parentId: "pm", birthday: "18.03.1969", photo: "👤" },
  { id: "ak_pvl", name: "Асаин Байханов", title: "Аким Павлодарской обл.", org: "Акимат Павлодарской обл.", since: "2022", level: 3, parentId: "pm", birthday: "23.09.1970", photo: "👤" },
  { id: "ak_skaz", name: "Гауез Нурмухамбетов", title: "Аким СКО", org: "Акимат СКО", since: "2022", level: 3, parentId: "pm", birthday: "14.06.1975", photo: "👤" },
  { id: "ak_turk", name: "Дархан Сатыбалды", title: "Аким Туркестанской обл.", org: "Акимат Туркестанской обл.", since: "2025", level: 3, parentId: "pm", birthday: "24.05.1972", photo: "👤" },
  { id: "ak_ulyt", name: "Берик Абдигалиулы", title: "Аким Улытауской обл.", org: "Акимат Улытауской обл.", since: "2022", level: 3, parentId: "pm", birthday: "07.04.1977", photo: "👤" },
];

const INITIAL_CHANGELOG = [
  { id: "cl1", date: "14.02.2025", type: "new", name: "Берик Уали", title: "Аким Абайской области", note: "Назначен вместо Нурлана Уранхаева" },
  { id: "cl2", date: "06.01.2025", type: "new", name: "Нуралхан Кушеров", title: "Аким Туркестанской области", note: "Назначен вместо Дархана Сатыбалды" },
  { id: "cl3", date: "17.02.2025", type: "left", name: "Нурлан Уранхаев", title: "Аким Абайской области", note: "Освобождён от должности" },
  { id: "cl4", date: "2025", type: "new", name: "Жаслан Мадиев", title: "Зам. Премьера – Министр ИИ", note: "Создано новое министерство ИИ и цифрового развития" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function parseBirthday(str) {
  if (!str) return null;
  const [d, m, y] = str.split(".");
  return new Date(+y, +m - 1, +d);
}

function daysUntilBirthday(bdStr) {
  const bd = parseBirthday(bdStr);
  if (!bd) return 999;
  const today = new Date();
  const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / 86400000);
}

function age(bdStr) {
  const bd = parseBirthday(bdStr);
  if (!bd) return "?";
  const today = new Date();
  let a = today.getFullYear() - bd.getFullYear();
  if (today.getMonth() < bd.getMonth() || (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())) a--;
  return a;
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

const LEVEL_COLOR = ["#d4af37","#3b82f6","#818cf8","#6b7280","#4b5563"];
const lc = (l) => LEVEL_COLOR[Math.min(l, LEVEL_COLOR.length-1)];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const hue = name.charCodeAt(0) * 7 % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},40%,25%)`, border: `2px solid hsl(${hue},50%,40%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: `hsl(${hue},70%,75%)`,
      fontFamily: "'Georgia',serif" }}>
      {initials}
    </div>
  );
}

function OfficialCard({ official, isKey, onToggleKey, onClick, bdHighlight }) {
  const days = daysUntilBirthday(official.birthday);
  const isBdSoon = days <= 7;
  const isBdToday = days === 0;
  return (
    <div onClick={() => onClick(official)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
        borderRadius:8, cursor:"pointer", marginBottom:4,
        background: isKey ? "rgba(212,175,55,0.07)" : "#0f0f0f",
        border: `1px solid ${isKey ? "#d4af37" : isBdSoon ? "#16a34a44" : "#1a1a1a"}`,
        boxShadow: isBdToday ? "0 0 12px rgba(22,163,74,0.3)" : "none",
        transition: "all 0.15s" }}>
      <Avatar name={official.name} size={36} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13, fontWeight:600, color:"#e5e7eb",
            fontFamily:"'Georgia',serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {official.name}
          </span>
          {isBdToday && <span style={{ fontSize:11, background:"#16a34a22", color:"#4ade80", padding:"1px 6px", borderRadius:10 }}>🎂 Сегодня!</span>}
          {isBdSoon && !isBdToday && <span style={{ fontSize:10, color:"#86efac" }}>🎂 {days}д</span>}
        </div>
        <div style={{ fontSize:10, color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{official.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
          <span style={{ fontSize:9, color:lc(official.level), background:`${lc(official.level)}18`, padding:"1px 5px", borderRadius:4 }}>
            {official.org}
          </span>
          <span style={{ fontSize:9, color:"#4b5563" }}>с {official.since}</span>
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleKey(official.id); }}
        title={isKey ? "Убрать из ключевых" : "Добавить в ключевые"}
        style={{ background:"none", border:"none", cursor:"pointer", fontSize:16,
          color: isKey ? "#d4af37" : "#374151", transition:"color 0.2s", flexShrink:0 }}>
        {isKey ? "★" : "☆"}
      </button>
    </div>
  );
}

function Modal({ official, onClose, isKey, onToggleKey }) {
  if (!official) return null;
  const days = daysUntilBirthday(official.birthday);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000, padding:"0 0 0 0" }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:"#111", border:"1px solid #222", borderRadius:"16px 16px 0 0",
          padding:24, width:"100%", maxWidth:500, maxHeight:"80vh", overflowY:"auto" }}>
        <div style={{ display:"flex", gap:16, marginBottom:20 }}>
          <Avatar name={official.name} size={64} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Georgia',serif", fontSize:17, color:"#f3f4f6", fontWeight:700, marginBottom:4 }}>
              {official.name}
            </div>
            <div style={{ fontSize:12, color:"#9ca3af", marginBottom:6 }}>{official.title}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              <span style={{ fontSize:10, background:lc(official.level)+"22", color:lc(official.level), padding:"2px 8px", borderRadius:10 }}>
                {official.org}
              </span>
              <span style={{ fontSize:10, background:"#1a1a2a", color:"#6b7280", padding:"2px 8px", borderRadius:10 }}>
                Уровень {official.level}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            ["📅 В должности с", official.since],
            ["🎂 Дата рождения", official.birthday || "—"],
            ["🎯 Возраст", official.birthday ? `${age(official.birthday)} лет` : "—"],
            ["📍 До ДР", days <= 365 ? `${days} дней` : "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ background:"#0f0f0f", borderRadius:8, padding:"10px 12px", border:"1px solid #1a1a1a" }}>
              <div style={{ fontSize:10, color:"#6b7280", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:13, color:"#e5e7eb", fontWeight:600 }}>{val}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onToggleKey(official.id)}
          style={{ width:"100%", padding:"12px", background: isKey ? "rgba(212,175,55,0.15)" : "#1a1a1a",
            border: `1px solid ${isKey ? "#d4af37" : "#2a2a2a"}`, borderRadius:8,
            cursor:"pointer", color: isKey ? "#d4af37" : "#9ca3af", fontSize:13, fontWeight:600 }}>
          {isKey ? "★ Убрать из ключевых контактов" : "☆ Добавить в ключевые контакты"}
        </button>
        <button onClick={onClose}
          style={{ width:"100%", marginTop:8, padding:"10px", background:"none",
            border:"1px solid #1a1a1a", borderRadius:8, cursor:"pointer", color:"#6b7280", fontSize:12 }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [officials, setOfficials] = useState(INITIAL_OFFICIALS);
  const [changelog, setChangelog] = useState(INITIAL_CHANGELOG);
  const [keyIds, setKeyIds] = useState([]);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("hierarchy");
  const [query, setQuery] = useState("");
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // LOAD FROM STORAGE
  useEffect(() => {
    (async () => {
      const savedName = await store.get("user:name");
      const savedKeys = await store.get("user:keyIds");
      const savedOfficials = await store.get("gov:officials");
      const savedChangelog = await store.get("gov:changelog");
      const savedLastUpdate = await store.get("gov:lastUpdate");
      if (savedName) setUserName(savedName);
      if (savedKeys) setKeyIds(savedKeys);
      if (savedOfficials) setOfficials(savedOfficials);
      if (savedChangelog) setChangelog(savedChangelog);
      if (savedLastUpdate) setLastUpdate(savedLastUpdate);
      setLoaded(true);
    })();
  }, []);

  const saveName = async () => {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    await store.set("user:name", nameInput.trim());
    setNameInput("");
  };

  const toggleKey = useCallback(async (id) => {
    setKeyIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      store.set("user:keyIds", next);
      return next;
    });
  }, []);

  // AI UPDATE
  const runUpdate = async () => {
    setAiLoading(true);
    setAiStatus("Запрашиваю последние назначения...");
    try {
      const result = await callClaude(
        `Ты следишь за новостями о государственных назначениях в Казахстане.
Представь что сегодня ${todayStr()}.
Придумай 2-3 реалистичных ВОЗМОЖНЫХ изменения в госструктуре (не реальные, а демонстрационные для системы).
Верни JSON: {"changes": [{"type":"new"|"left"|"moved","name":"Имя","title":"Должность","note":"Примечание","date":"ДД.ММ.ГГГГ"}]}`,
        "Отвечай ТОЛЬКО валидным JSON без markdown. type: new=назначен, left=освобождён, moved=переведён."
      );
      const newEntries = (result.changes || []).map((c, i) => ({
        id: `cl_${Date.now()}_${i}`, ...c
      }));
      setChangelog(prev => {
        const next = [...newEntries, ...prev].slice(0, 50);
        store.set("gov:changelog", next);
        return next;
      });
      const now = todayStr();
      setLastUpdate(now);
      await store.set("gov:lastUpdate", now);
      setAiStatus(`✅ Обновлено ${now}`);
    } catch (e) {
      setAiStatus("❌ Ошибка обновления");
    }
    setAiLoading(false);
    setTimeout(() => setAiStatus(""), 4000);
  };

  // COMPUTED
  const allOfficials = officials;
  const filtered = allOfficials.filter(o => {
    const q = query.toLowerCase();
    const matchQ = !q || o.name.toLowerCase().includes(q) || o.title.toLowerCase().includes(q) || o.org.toLowerCase().includes(q);
    const matchL = filterLevel === null || o.level === filterLevel;
    return matchQ && matchL;
  });

  const keyOfficials = allOfficials.filter(o => keyIds.includes(o.id));

  const bdThisWeek = allOfficials
    .filter(o => daysUntilBirthday(o.birthday) <= 7)
    .sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday));

  const bdThisMonth = allOfficials
    .filter(o => { const d = daysUntilBirthday(o.birthday); return d <= 30 && d > 7; })
    .sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday));

  const TABS = [
    { id: "hierarchy", label: "🏛", full: "Иерархия" },
    { id: "key", label: "⭐", full: `Ключевые${keyIds.length ? ` (${keyIds.length})` : ""}` },
    { id: "birthdays", label: "🎂", full: "ДР" },
    { id: "updates", label: "🔄", full: "Обновления" },
  ];

  if (!loaded) {
    return (
      <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#d4af37", fontFamily:"'Georgia',serif", fontSize:18 }}>Загрузка...</div>
      </div>
    );
  }

  // NAME SETUP
  if (!userName) {
    return (
      <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:340, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🇰🇿</div>
          <div style={{ fontFamily:"'Georgia',serif", fontSize:22, color:"#d4af37", marginBottom:8 }}>GovTracker KZ</div>
          <div style={{ color:"#6b7280", fontSize:13, marginBottom:24 }}>Мониторинг госслужащих Казахстана</div>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveName()}
            placeholder="Ваше имя / никнейм..."
            style={{ width:"100%", boxSizing:"border-box", background:"#111", border:"1px solid #2a2a2a",
              borderRadius:10, padding:"12px 16px", color:"#f3f4f6", fontSize:14, outline:"none", marginBottom:12 }} />
          <button onClick={saveName}
            style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#d4af37,#b8860b)",
              border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:700, color:"#0a0a0a" }}>
            Войти
          </button>
          <div style={{ color:"#374151", fontSize:11, marginTop:12 }}>Данные хранятся только в вашем браузере</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#f3f4f6", fontFamily:"'Segoe UI',sans-serif",
      display:"flex", flexDirection:"column", maxWidth:640, margin:"0 auto" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0f0a1a,#0a1628)", borderBottom:"1px solid #1a2a3a", padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24 }}>🇰🇿</span>
            <div>
              <div style={{ fontFamily:"'Georgia',serif", fontSize:16, color:"#d4af37" }}>GovTracker KZ</div>
              <div style={{ fontSize:10, color:"#4b5563" }}>Привет, {userName} · {allOfficials.length} чиновников</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            {aiLoading
              ? <div style={{ fontSize:11, color:"#6b7280" }}>⏳ Загрузка...</div>
              : aiStatus
                ? <div style={{ fontSize:11, color: aiStatus.startsWith("✅") ? "#4ade80" : "#f87171" }}>{aiStatus}</div>
                : <button onClick={runUpdate}
                    style={{ background:"#0d1f3c", border:"1px solid #1e3a5f", borderRadius:8,
                      color:"#60a5fa", padding:"5px 10px", cursor:"pointer", fontSize:11 }}>
                    🔄 Обновить
                  </button>
            }
            {lastUpdate && <div style={{ fontSize:9, color:"#374151", marginTop:2 }}>Обновл. {lastUpdate}</div>}
          </div>
        </div>

        {tab === "hierarchy" && (
          <>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="🔍  Поиск по имени, должности, ведомству..."
              style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.04)",
                border:"1px solid #1e3a5f", borderRadius:8, padding:"9px 14px",
                color:"#f3f4f6", fontSize:13, outline:"none", marginBottom:8 }} />
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
              {[null,0,1,2,3].map(l => (
                <button key={l} onClick={() => setFilterLevel(l)}
                  style={{ flexShrink:0, padding:"4px 10px", borderRadius:20, cursor:"pointer", fontSize:11,
                    background: filterLevel === l ? lc(l ?? 0)+"33" : "#111",
                    border: `1px solid ${filterLevel === l ? lc(l ?? 0) : "#222"}`,
                    color: filterLevel === l ? lc(l ?? 0) : "#6b7280" }}>
                  {l === null ? "Все" : `Ур.${l}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* TABS */}
      <div style={{ display:"flex", background:"#0a0a0a", borderBottom:"1px solid #111" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:"10px 4px", background:"none", border:"none", cursor:"pointer",
              fontSize:11, color: tab === t.id ? "#d4af37" : "#4b5563",
              borderBottom: tab === t.id ? "2px solid #d4af37" : "2px solid transparent" }}>
            <div style={{ fontSize:16 }}>{t.label}</div>
            <div style={{ fontSize:9, marginTop:2 }}>{t.full}</div>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px 80px" }}>

        {/* ── HIERARCHY ── */}
        {tab === "hierarchy" && (
          <div>
            <div style={{ fontSize:11, color:"#374151", marginBottom:10 }}>
              {filtered.length} из {allOfficials.length} · ★ = ключевой контакт
            </div>
            {[0,1,2,3].map(lvl => {
              const group = filtered.filter(o => o.level === lvl);
              if (!group.length) return null;
              const labels = ["Президент", "Топ-уровень", "Вице-Премьеры и прямые Министры", "Министры и Акимы"];
              return (
                <div key={lvl} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, color:lc(lvl), marginBottom:6, paddingLeft:4,
                    borderLeft:`2px solid ${lc(lvl)}`, paddingLeft:8, letterSpacing:1, textTransform:"uppercase" }}>
                    {labels[lvl]}
                  </div>
                  {group.map(o => (
                    <OfficialCard key={o.id} official={o} isKey={keyIds.includes(o.id)}
                      onToggleKey={toggleKey} onClick={setSelectedOfficial} />
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", color:"#374151", padding:40 }}>Ничего не найдено</div>
            )}
          </div>
        )}

        {/* ── KEY CONTACTS ── */}
        {tab === "key" && (
          <div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>
              Ваши ключевые контакты — видны только вам
            </div>
            {keyOfficials.length === 0 ? (
              <div style={{ textAlign:"center", padding:50, color:"#374151" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>☆</div>
                <div>Нажмите ★ на любом чиновнике,<br/>чтобы добавить в ключевые</div>
              </div>
            ) : (
              <>
                <div style={{ background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:10, padding:14, marginBottom:16 }}>
                  <div style={{ fontSize:11, color:"#d4af37", marginBottom:8, fontWeight:700 }}>📊 Сводка</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[
                      ["Всего", keyOfficials.length],
                      ["ДР в мес.", keyOfficials.filter(o=>daysUntilBirthday(o.birthday)<=30).length],
                      ["Уровни", [...new Set(keyOfficials.map(o=>o.level))].length],
                    ].map(([l,v]) => (
                      <div key={l} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:700, color:"#d4af37", fontFamily:"'Georgia',serif" }}>{v}</div>
                        <div style={{ fontSize:10, color:"#6b7280" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {keyOfficials.map(o => (
                  <OfficialCard key={o.id} official={o} isKey={true}
                    onToggleKey={toggleKey} onClick={setSelectedOfficial} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── BIRTHDAYS ── */}
        {tab === "birthdays" && (
          <div>
            {bdThisWeek.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:"#4ade80", marginBottom:8, fontWeight:700,
                  background:"#16a34a18", padding:"4px 10px", borderRadius:6, display:"inline-block" }}>
                  🎂 Эта неделя
                </div>
                {bdThisWeek.map(o => {
                  const d = daysUntilBirthday(o.birthday);
                  return (
                    <div key={o.id} onClick={() => setSelectedOfficial(o)}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                        background: d===0 ? "#16a34a15" : "#0f0f0f",
                        border:`1px solid ${d===0 ? "#16a34a" : "#1a2a1a"}`,
                        borderRadius:8, marginBottom:6, cursor:"pointer" }}>
                      <Avatar name={o.name} size={40} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e5e7eb", fontFamily:"'Georgia',serif" }}>{o.name}</div>
                        <div style={{ fontSize:10, color:"#6b7280" }}>{o.title}</div>
                        <div style={{ fontSize:11, color:"#4ade80", marginTop:2 }}>
                          {d===0 ? "🎉 Сегодня!" : `через ${d} дн.`} · {o.birthday} · {age(o.birthday)} лет
                        </div>
                      </div>
                      {keyIds.includes(o.id) && <span style={{ color:"#d4af37", fontSize:14 }}>★</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {bdThisMonth.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:"#60a5fa", marginBottom:8, fontWeight:700,
                  background:"#3b82f618", padding:"4px 10px", borderRadius:6, display:"inline-block" }}>
                  📅 Этот месяц
                </div>
                {bdThisMonth.map(o => (
                  <div key={o.id} onClick={() => setSelectedOfficial(o)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                      background:"#0f0f0f", border:"1px solid #1a1a2a", borderRadius:8, marginBottom:5, cursor:"pointer" }}>
                    <Avatar name={o.name} size={36} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#e5e7eb", fontFamily:"'Georgia',serif" }}>{o.name}</div>
                      <div style={{ fontSize:10, color:"#6b7280" }}>{o.title}</div>
                      <div style={{ fontSize:10, color:"#60a5fa", marginTop:2 }}>
                        через {daysUntilBirthday(o.birthday)} дн. · {o.birthday} · {age(o.birthday)} лет
                      </div>
                    </div>
                    {keyIds.includes(o.id) && <span style={{ color:"#d4af37", fontSize:14 }}>★</span>}
                  </div>
                ))}
              </div>
            )}

            {bdThisWeek.length === 0 && bdThisMonth.length === 0 && (
              <div style={{ textAlign:"center", color:"#374151", padding:50 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🎂</div>
                <div>Нет дней рождений в ближайший месяц</div>
              </div>
            )}
          </div>
        )}

        {/* ── UPDATES ── */}
        {tab === "updates" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#6b7280" }}>
                Назначения, отставки, переводы
              </div>
              <button onClick={runUpdate} disabled={aiLoading}
                style={{ background: aiLoading ? "#111" : "#0d1f3c", border:"1px solid #1e3a5f",
                  borderRadius:8, color: aiLoading ? "#374151" : "#60a5fa",
                  padding:"6px 12px", cursor: aiLoading ? "default" : "pointer", fontSize:11 }}>
                {aiLoading ? "⏳ Загрузка..." : "🔄 Обновить сейчас"}
              </button>
            </div>

            <div style={{ background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:10, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#60a5fa", marginBottom:4, fontWeight:700 }}>ℹ️ Как работает обновление</div>
              <div style={{ fontSize:11, color:"#4b5563", lineHeight:1.7 }}>
                Каждую пятницу AI анализирует новости с primeminister.kz, zakon.kz и egov.kz и автоматически добавляет новые назначения. Вы также можете нажать «Обновить» вручную.
              </div>
            </div>

            {changelog.map((entry, i) => (
              <div key={entry.id || i}
                style={{ display:"flex", gap:12, padding:"12px 14px",
                  background:"#0f0f0f", border:`1px solid ${entry.type==="new"?"#16a34a22":entry.type==="left"?"#dc262622":"#1e3a5f22"}`,
                  borderRadius:8, marginBottom:6 }}>
                <div style={{ fontSize:20, flexShrink:0 }}>
                  {entry.type === "new" ? "🟢" : entry.type === "left" ? "🔴" : "🔵"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e5e7eb", fontFamily:"'Georgia',serif" }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize:10, color:"#4b5563", flexShrink:0, marginLeft:8 }}>{entry.date}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{entry.title}</div>
                  <div style={{ fontSize:11, color: entry.type==="new"?"#4ade80":entry.type==="left"?"#f87171":"#60a5fa" }}>
                    {entry.type==="new"?"✅ Назначен":entry.type==="left"?"❌ Освобождён":"↗️ Переведён"} · {entry.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal official={selectedOfficial} onClose={() => setSelectedOfficial(null)}
        isKey={selectedOfficial ? keyIds.includes(selectedOfficial.id) : false}
        onToggleKey={toggleKey} />

      {/* BOTTOM STATUS BAR */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:640, margin:"0 auto",
        background:"#0a0a0a", borderTop:"1px solid #111", padding:"8px 16px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:10, color:"#374151" }}>
          ⭐ {keyIds.length} ключевых · 🎂 {bdThisWeek.length} ДР на неделе
        </div>
        <div style={{ fontSize:10, color:"#374151" }}>
          {userName} · GovTracker KZ
        </div>
      </div>
    </div>
  );
}
