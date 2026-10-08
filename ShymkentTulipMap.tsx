import { useState } from "react";

type District = {
  name: string;
  tulip: string;
  scientificName: string;
  description: string;
  baseFill: string;
  activeFill: string;
  labelX: number;
  labelY: number;
  number: string;
};

const districts: District[] = [
  {
    name: "Әл-Фараби ауданы",
    tulip: "Грейг қызғалдағы",
    scientificName: "Tulipa greigii",
    description:
      "Қаланың орталығы мен мәдени жүрегіне тән отты қызыл қызғалдақ.",
    baseFill: "#dcfce7",
    activeFill: "#ef4444",
    labelX: 410,
    labelY: 393,
    number: "01",
  },
  {
    name: "Қаратау ауданы",
    tulip: "Қаратау қызғалдағы",
    scientificName: "Tulipa karatavica",
    description:
      "Қаратау жоталарының эндемигі, таулы табиғат пен таза ауа символы.",
    baseFill: "#fef3c7",
    activeFill: "#7e22ce",
    labelX: 550,
    labelY: 231,
    number: "02",
  },
  {
    name: "Абай ауданы",
    tulip: "Шренк қызғалдағы",
    scientificName: "Tulipa schrenkii",
    description:
      "Түстері алуан түрлі, өнер мен поэзияға шабыт беретін әсем гүл.",
    baseFill: "#fce7f3",
    activeFill: "#db2777",
    labelX: 234,
    labelY: 242,
    number: "03",
  },
  {
    name: "Еңбекші ауданы",
    tulip: "Альберт қызғалдағы",
    scientificName: "Tulipa alberti",
    description:
      "Тасты далада өсуге бейім, еңбекші халықтың төзімділігін бейнелейтін қызғалдақ.",
    baseFill: "#ffedd5",
    activeFill: "#ea580c",
    labelX: 554,
    labelY: 532,
    number: "04",
  },
  {
    name: "Тұран ауданы",
    tulip: "Түркістан қызғалдағы",
    scientificName: "Tulipa turkestanica",
    description:
      "Жаңа ауданның қарқынды өсіп-өркендеуін бейнелейтін көпгүлді қызғалдақ.",
    baseFill: "#dbeafe",
    activeFill: "#2563eb",
    labelX: 214,
    labelY: 517,
    number: "05",
  },
];

const districtPaths = [
  "M360 300 L400 190 L480 300 L570 340 L540 450 L440 480 L350 440 L260 460 L260 340 Z",
  "M330 105 L480 130 L610 100 L710 195 L688 325 L570 340 L480 300 L400 190 Z",
  "M205 155 L330 105 L400 190 L360 300 L260 340 L120 350 L85 240 Z",
  "M570 340 L688 325 L735 430 L680 570 L580 665 L420 700 L290 665 L390 550 L350 440 L440 480 L540 450 Z",
  "M120 350 L260 340 L260 460 L350 440 L390 550 L290 665 L160 620 L95 500 Z",
];

export default function ShymkentTulipMap() {
  const [activeDistrict, setActiveDistrict] = useState("Әл-Фараби ауданы");
  const selected =
    districts.find((district) => district.name === activeDistrict) ?? districts[0];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
          Шымкент · қызғалдақтар картасы
        </p>
        <h1 className="text-balance text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl lg:text-5xl">
          Қызғалдақ және Ұлы дала: табиғаттан мәдени символға дейін
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">
          Қала аудандарын таңдап, әрқайсысына тән қызғалдақтың тарихымен
          танысыңыз.
        </p>
      </header>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-12">
        <div className="rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-6">
          <div className="mb-2 flex items-center justify-between px-2 pt-2">
            <span className="text-sm font-semibold text-stone-700">
              Шымкент қаласының аудандары
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              5 аудан
            </span>
          </div>
          <svg
            viewBox="0 0 800 800"
            className="w-full h-auto"
            role="img"
            aria-label="Шымкент қаласының бес ауданының интерактивті картасы"
          >
            <style>{`
              path[role="button"]:focus { outline: none; }
              path[role="button"]:focus-visible {
                stroke: #14532d;
                stroke-width: 10px;
              }
            `}</style>
            <defs>
              <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="12"
                  floodColor="#14532d"
                  floodOpacity="0.12"
                />
              </filter>
            </defs>
            <g filter="url(#map-shadow)">
              {districts.map((district, index) => (
                <path
                  key={district.name}
                  d={districtPaths[index]}
                  fill={
                    activeDistrict === district.name
                      ? district.activeFill
                      : district.baseFill
                  }
                  className="cursor-pointer transition-all duration-300 hover:fill-opacity-80 focus-visible:outline-none"
                  stroke="white"
                  strokeWidth="7"
                  strokeLinejoin="round"
                  style={{ outline: "none" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${district.name}: ${district.tulip}`}
                  aria-pressed={activeDistrict === district.name}
                  onClick={() => setActiveDistrict(district.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveDistrict(district.name);
                    }
                  }}
                />
              ))}
            </g>

            {districts.map((district) => (
              <g
                key={`${district.name}-label`}
                className="pointer-events-none select-none"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                <rect
                  x={district.labelX - 64}
                  y={district.labelY - 25}
                  width="128"
                  height="50"
                  rx="14"
                  fill="white"
                  fillOpacity="0.96"
                  stroke={
                    activeDistrict === district.name
                      ? district.activeFill
                      : "#d6e3d8"
                  }
                  strokeWidth={activeDistrict === district.name ? "2.5" : "1"}
                />
                <text
                  x={district.labelX}
                  y={district.labelY - 2}
                  textAnchor="middle"
                  className="fill-emerald-950 text-[14px] font-bold"
                >
                  {district.name.replace(" ауданы", "")}
                </text>
                <text
                  x={district.labelX}
                  y={district.labelY + 14}
                  textAnchor="middle"
                  className="fill-emerald-800/70 text-[10px] font-medium"
                >
                  ауданы
                </text>
              </g>
            ))}
          </svg>
          <p className="px-3 pt-1 text-center text-xs text-stone-500">
            Ауданды таңдау үшін картадан немесе төмендегі батырмадан басыңыз
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {districts.map((district) => (
              <button
                key={`${district.name}-selector`}
                type="button"
                aria-pressed={activeDistrict === district.name}
                onClick={() => setActiveDistrict(district.name)}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  activeDistrict === district.name
                    ? "border-emerald-800 bg-emerald-900 text-white shadow-md shadow-emerald-900/15"
                    : "border-stone-200 bg-white/80 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${
                    activeDistrict === district.name
                      ? "bg-white/15 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {district.number}
                </span>
                <span>{district.name}</span>
              </button>
            ))}
          </div>
        </div>

        <aside
          aria-live="polite"
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-xl shadow-emerald-950/5 backdrop-blur transition-all duration-300 sm:p-9"
        >
          <div
            className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10 blur-2xl transition-colors duration-500"
            style={{ backgroundColor: selected.activeFill }}
            aria-hidden="true"
          />
          <div className="relative">
            <div className="mb-7 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: selected.activeFill }}
                />
                Таңдалған аудан
              </span>
              <span className="font-serif text-4xl font-semibold text-emerald-900/15">
                {selected.number}
              </span>
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Шымкент қаласы
            </p>
            <h2 className="text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl">
              {selected.name}
            </h2>

            <div className="my-7 h-px bg-gradient-to-r from-emerald-200 via-stone-200 to-transparent" />

            <div className="rounded-2xl bg-stone-50 p-5 sm:p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                Ауданның қызғалдағы
              </p>
              <h3 className="text-xl font-bold text-emerald-900">
                {selected.tulip}
              </h3>
              <p className="mt-1 font-serif text-lg italic text-emerald-700">
                {selected.scientificName}
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                {selected.description}
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8m0 3c-4 0-6-2.5-6-6 3.5 0 6 2 6 6Zm0-3c0-4 2.5-6 6-6 0 3.5-2 6-6 6Zm0-5c-2.5-1.5-3-3.5-3-5.5 2.5 1 3.5 2.5 3 5.5Zm0 0c2.5-1.5 3-3.5 3-5.5-2.5 1-3.5 2.5-3 5.5Z"
                />
              </svg>
              <p className="text-sm leading-6 text-emerald-900/80">
                Әр гүл — туған өлкенің табиғаты мен мінезін баяндайтын тірі
                символ.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
