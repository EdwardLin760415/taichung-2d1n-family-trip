import React, { useMemo, useState } from "react";
import membersImg from "./assets/members.png";

type Stop = {
  id: string;
  time: string;
  title: string;
  kind: "eat" | "cafe" | "activity" | "market" | "stay" | "shop";
  subtitle?: string;
  address?: string;
  note?: string;
};

type DayPlan = {
  key: "day1" | "day2";
  label: string;
  date: string;
  mapUrl: string;
  stops: Stop[];
};

function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const KIND_META = {
  eat: { label: "用餐", emoji: "🍽️" },
  cafe: { label: "咖啡", emoji: "☕" },
  activity: { label: "活動", emoji: "🎆" },
  market: { label: "夜市", emoji: "🧋" },
  stay: { label: "住宿", emoji: "🏨" },
  shop: { label: "購物", emoji: "🛍️" },
} as const;

const PLANS: DayPlan[] = [
  {
    key: "day1",
    label: "DAY 1",
    date: "2/28（第一天）",
    mapUrl: "https://maps.app.goo.gl/HAWCgPr5YR1gAqob7",
    stops: [
      {
        id: "d1-1",
        time: "14:00",
        title: "想窩11餐旅館",
        kind: "eat",
        subtitle: "（原始備註：6大3小）",
        address: "臺中市沙鹿區東晉一街11號",
      },
      {
        id: "d1-2",
        time: "15:30",
        title: "陳允寶泉 自由總店",
        kind: "shop",
        address: "臺中市中區自由路二段36號",
      },
      {
        id: "d1-3",
        time: "傍晚～晚上",
        title: "台中燈會（中央公園）",
        kind: "activity",
        address: "臺中市西屯區中科路2966號",
        note: "人潮多；小孩體力注意",
      },
      {
        id: "d1-4",
        time: "晚上",
        title: "逢甲夜市",
        kind: "market",
        address: "臺中市西屯區文華路",
        note: "建議吃完就走，避免太晚",
      },
      {
        id: "d1-5",
        time: "入住",
        title: "逢甲 Hygge 住宿",
        kind: "stay",
        address: "臺中市西屯區至善路101巷23號",
      },
    ],
  },
  {
    key: "day2",
    label: "DAY 2",
    date: "2/29（第二天）",
    mapUrl: "https://maps.app.goo.gl/KZNQ4VpRrLe7Thhs8",
    stops: [
      {
        id: "d2-1",
        time: "白天",
        title: "蜜糖角落 Honey Corner",
        kind: "cafe",
        address: "臺中市沙鹿區平等十二街1號",
      },
      {
        id: "d2-2",
        time: "下午～傍晚",
        title: "MITSUI OUTLET PARK 台中港",
        kind: "shop",
        address: "臺中市梧棲區臺灣大道十段168號",
      },
    ],
  },
];

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="cb" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}


function Button({
  children,
  onClick,
  variant = "primary",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline";
  title?: string;
}) {
  return (
    <button className={cn("btn", variant)} onClick={onClick} title={title} type="button">
      {children}
    </button>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="progressWrap">
      <div className="progressTop">
        <div className="muted">已完成 {done}/{total}（{pct}%）</div>
      </div>
      <div className="progressTrack" aria-label="progress">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StopCard({
  stop,
  checked,
  onToggle,
}: {
  stop: Stop;
  checked: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  const meta = KIND_META[stop.kind];

  return (
    <div className={cn("card", "stopCard", `k-${stop.kind}`, checked && "dim")}>
      <div className="row">
        <Checkbox checked={checked} onChange={(v) => onToggle(stop.id, v)} label={`完成：${stop.title}`} />
        <div className="col">
          <div className="row between gap wrap">
            <div className="row gap wrap">
              <Badge>{stop.time}</Badge>
              <span className={cn("kind", stop.kind)}>
                {meta.emoji} {meta.label}
              </span>
              <div className="title">{stop.title}</div>
            </div>
            {stop.address ? (
              <Button
                variant="outline"
                onClick={() =>
                  openUrl(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.title + " " + stop.address)}`
                  )
                }
                title="用 Google Maps 搜尋這個地點"
              >
                地點
              </Button>
            ) : null}
          </div>

          {stop.subtitle ? <div className="muted small">{stop.subtitle}</div> : null}
          {stop.address ? <div className="muted small">{stop.address}</div> : null}
          {stop.note ? (
            <div className="small">
              <span className="strong">備註：</span>
              <span className="muted">{stop.note}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DayView({
  plan,
  checkedMap,
  onToggle,
  q,
}: {
  plan: DayPlan;
  checkedMap: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  q: string;
}) {
  const needle = q.trim().toLowerCase();
  const stops = useMemo(() => {
    if (!needle) return plan.stops;
    return plan.stops.filter((s) => {
      return (
        s.title.toLowerCase().includes(needle) ||
        (s.address || "").toLowerCase().includes(needle) ||
        (s.note || "").toLowerCase().includes(needle)
      );
    });
  }, [plan.stops, needle]);

  return (
    <div className="stack">
      <div className="card">
        <div className="row between gap wrap">
          <div className="col" style={{ minWidth: 240 }}>
            <div className="muted small">Google Maps（一天一個）</div>
            <div className="mono small break">{plan.mapUrl}</div>
          </div>
          <div className="row gap wrap">
            <Button variant="outline" onClick={() => openUrl(plan.mapUrl)}>
              開啟
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const ok = await copyText(plan.mapUrl);
                alert(ok ? "已複製地圖連結" : "複製失敗（瀏覽器限制）");
              }}
            >
              複製
            </Button>
          </div>
        </div>
      </div>

      <div className="stack">
        {stops.map((s) => (
          <StopCard key={s.id} stop={s} checked={Boolean(checkedMap[s.id])} onToggle={onToggle} />
        ))}
        {stops.length === 0 ? <div className="empty">找不到符合的地點（清空搜尋再試）</div> : null}
      </div>

      <div className="card">
        <div className="strong">親子小提醒</div>
        <ul className="muted small list">
          <li>集合點先講好：誰顧小孩、誰顧阿嬤。</li>
          <li>燈會／夜市人多：小女孩先約好走散集合點。</li>
          <li>Day 2 行程較鬆：Outlet 可視天氣延長/縮短。</li>
        </ul>
      </div>
    </div>
  );
}

export default function TaichungTrip() {
  const [active, setActive] = useState<"day1" | "day2">("day1");
  const [q, setQ] = useState("");

  const storageKey = "taichung_trip_checks_v2";
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const plan = useMemo(() => PLANS.find((p) => p.key === active)!, [active]);
  const done = useMemo(
    () => plan.stops.reduce((acc, s) => acc + (checkedMap[s.id] ? 1 : 0), 0),
    [plan.stops, checkedMap]
  );

  const toggle = (id: string, value: boolean) => {
    setCheckedMap((prev) => {
      const next = { ...prev, [id]: value };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearDay = () => {
    setCheckedMap((prev) => {
      const next = { ...prev };
      for (const s of plan.stops) delete next[s.id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const shareText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`台中2天1夜｜${plan.date}`);
    lines.push(`地圖：${plan.mapUrl}`);
    lines.push("行程：");
    for (const s of plan.stops) {
      lines.push(`- ${s.time} ${KIND_META[s.kind].emoji} ${s.title}${s.address ? `（${s.address}）` : ""}`);
    }
    return lines.join("");
  }, [plan]);

  const copyShare = async () => {
    const ok = await copyText(shareText);
    alert(ok ? "已複製分享文字" : "複製失敗（瀏覽器限制）");
  };

  return (
    <div className={`page ${active}`}>
      <style>{css}</style>

      <div className="container">
        <header className="header">
          <div className="row between gap wrap">
            <div>
              <div className="h1">台中 2天1夜 互動行程（親子版）</div>
              <div className="row gap wrap" style={{ marginTop: 8 }}>
                <span className="muted small">成員：</span>
                <img
  src={membersImg}
  alt="成員：阿嬤x1、媽媽x2、爸爸x2、大阿姨x1、小女孩x3"
  className="membersImage"
/>
              </div>
            </div>
            <div className="row gap wrap">
              <Button variant="outline" onClick={() => openUrl(plan.mapUrl)}>
                開啟 {plan.label} 地圖
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const ok = await copyText(plan.mapUrl);
                  alert(ok ? "已複製地圖連結" : "複製失敗（瀏覽器限制）");
                }}
              >
                複製地圖
              </Button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="row between gap wrap">
              <div>
                <div className="muted small">目前查看</div>
                <div className="strong">{plan.label} · {plan.date}</div>
              </div>
              <div className="row gap wrap">
                <Button variant="outline" onClick={copyShare}>
                  複製整天行程文字
                </Button>
                <Button variant="outline" onClick={clearDay}>
                  清除此天勾選
                </Button>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <ProgressBar done={done} total={plan.stops.length} />
            </div>
          </div>

          <div className="row between gap wrap" style={{ marginTop: 14 }}>
            <div className="tabs">
              <button
                className={cn("tab", active === "day1" && "active")}
                onClick={() => setActive("day1")}
              >
                DAY 1
              </button>
              <button
                className={cn("tab", active === "day2" && "active")}
                onClick={() => setActive("day2")}
              >
                DAY 2
              </button>
            </div>

            <div className="search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜尋地點/地址/備註"
              />
            </div>
          </div>
        </header>

        <main style={{ marginTop: 16 }}>
          {active === "day1" ? (
            <DayView plan={PLANS[0]} checkedMap={checkedMap} onToggle={toggle} q={q} />
          ) : (
            <DayView plan={PLANS[1]} checkedMap={checkedMap} onToggle={toggle} q={q} />
          )}
        </main>

        <footer className="footer">勾選狀態會存在你的瀏覽器（localStorage）。</footer>
      </div>
    </div>
  );
}

const css = `
  :root{
    --bg1:#fff7ed;
    --bg2:#eff6ff;
    --card:#ffffff;
    --text:#0f172a;
    --muted:#475569;
    --bd:#e2e8f0;
    --shadow: 0 14px 30px rgba(2,6,23,.08);

    --accent:#f97316;      /* Day1 橘 */
    --accent2:#fb7185;     /* 粉 */
    --badge-bg:#fff1e6;
    --badge-bd:#fed7aa;
  }

  *{box-sizing:border-box}
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans TC",Arial}
  .membersImage{
    height: 64px;          /* 手機也剛好 */
    max-width: 100%;
    object-fit: contain;
  }
  .page{
    min-height:100vh;
    background:
      radial-gradient(1200px 500px at 10% 0%, #ffe4c7 0%, transparent 55%),
      radial-gradient(1200px 500px at 90% 10%, #dbeafe 0%, transparent 55%),
      linear-gradient(180deg,var(--bg1), #ffffff 40%, var(--bg2));
    color:var(--text);
  }

  /* Day2 主色改藍綠 */
  .page.day2{
    --accent:#2563eb;
    --accent2:#22c55e;
    --badge-bg:#eaf2ff;
    --badge-bd:#bfdbfe;
  }

  .container{max-width:980px;margin:0 auto;padding:18px}
  .h1{
    font-size:28px;font-weight:900;letter-spacing:-0.02em;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip:text;background-clip:text;color:transparent;
  }

  .header{padding-top:6px}

  .card{
    background:rgba(255,255,255,.92);
    border:1px solid var(--bd);
    border-radius:18px;
    padding:14px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
  }

  /* 站點卡片：左側彩色條 */
  .stopCard{position:relative;overflow:hidden}
  .stopCard:before{
    content:"";
    position:absolute;left:0;top:0;bottom:0;width:10px;
    background: linear-gradient(180deg, var(--accent), var(--accent2));
  }

  /* 每種類型不同色（更親子） */
  .k-eat:before{background:linear-gradient(180deg,#fb923c,#f97316)}
  .k-cafe:before{background:linear-gradient(180deg,#fb7185,#ec4899)}
  .k-activity:before{background:linear-gradient(180deg,#fbbf24,#f59e0b)}
  .k-market:before{background:linear-gradient(180deg,#22d3ee,#06b6d4)}
  .k-stay:before{background:linear-gradient(180deg,#818cf8,#6366f1)}
  .k-shop:before{background:linear-gradient(180deg,#4ade80,#22c55e)}

  .row{display:flex;align-items:flex-start}
  .between{justify-content:space-between}
  .gap{gap:10px}
  .wrap{flex-wrap:wrap}
  .col{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1;padding-left:6px}
  .muted{color:var(--muted)}
  .small{font-size:13px;line-height:1.45}
  .strong{font-weight:900}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New"}
  .break{word-break:break-all}

  .btn{
    border-radius:14px;padding:10px 12px;border:1px solid transparent;
    background: linear-gradient(180deg, #ffffff, #fff7);
    color:var(--text);
    cursor:pointer;
    font-weight:900;
    box-shadow: 0 6px 16px rgba(2,6,23,.08);
  }
  .btn:hover{transform:translateY(-1px)}
  .btn:active{transform:translateY(0)}
  .btn.outline{background:#ffffff;border-color: var(--bd)}
  .btn.primary{background: linear-gradient(90deg, var(--accent), var(--accent2));color:#ffffff;border-color: transparent}

  .badge{
    display:inline-flex;align-items:center;
    border:1px solid var(--badge-bd);
    background: var(--badge-bg);
    border-radius:999px;
    padding:4px 10px;
    font-size:12px;
    font-weight:900;
    color: color-mix(in srgb, var(--accent) 75%, #111 25%);
  }

  .kind{
    display:inline-flex;align-items:center;gap:6px;
    padding:4px 10px;
    border-radius:999px;
    font-size:12px;
    font-weight:900;
    border:1px solid var(--bd);
    background:#fff;
    box-shadow: 0 8px 18px rgba(2,6,23,.06);
  }
  .kind.eat{      background:#fff7ed; border-color:#fed7aa; color:#c2410c; }
  .kind.cafe{     background:#fdf2f8; border-color:#fbcfe8; color:#9d174d; }
  .kind.activity{ background:#fef9c3; border-color:#fde68a; color:#854d0e; }
  .kind.market{   background:#ecfeff; border-color:#a5f3fc; color:#155e75; }
  .kind.stay{     background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
  .kind.shop{     background:#f0fdf4; border-color:#bbf7d0; color:#166534; }

  .memberPill{
    display:inline-flex;align-items:center;gap:8px;
    border:1px solid var(--bd);
    background:#ffffff;
    border-radius:999px;
    padding:6px 10px;
    font-size:12px;
    color:var(--text);
    font-weight:900;
    box-shadow: 0 8px 18px rgba(2,6,23,.06);
  }
  .memberEmoji{font-size:16px;line-height:1}
  .memberLabel{letter-spacing:.02em}
  .memberCount{
    display:inline-flex;align-items:center;justify-content:center;
    padding:2px 8px;
    border-radius:999px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    color:#fff;
    font-weight:1000;
  }

  .tabs{
    display:flex;background:#ffffffc7;border:1px solid var(--bd);
    border-radius:16px;padding:4px;
    box-shadow: 0 10px 20px rgba(2,6,23,.06);
  }
  .tab{border:0;background:transparent;color:var(--muted);padding:10px 14px;border-radius:12px;cursor:pointer;font-weight:900}
  .tab.active{background: linear-gradient(90deg, var(--accent), var(--accent2));color:#fff}

  .search input{
    width:min(360px, 92vw);
    padding:11px 12px;
    border-radius:16px;
    border:1px solid var(--bd);
    background:#ffffff;
    color:var(--text);
    outline:none;
    box-shadow: 0 10px 20px rgba(2,6,23,.06);
  }
  .search input::placeholder{color:#94a3b8}

  .stack{display:grid;gap:12px}
  .title{font-weight:1000}
  .dim{opacity:.78}

  .empty{
    border:2px dashed color-mix(in srgb, var(--accent) 35%, var(--bd) 65%);
    border-radius:18px;
    padding:22px;
    text-align:center;
    color:var(--muted);
    background:#ffffffb8;
  }

  .cb{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
  .cb input{position:absolute;opacity:0;pointer-events:none}
  .cb span{
    width:20px;height:20px;border-radius:6px;border:1px solid var(--bd);
    background:#fff;display:inline-block;position:relative;
    box-shadow: 0 6px 14px rgba(2,6,23,.08);
  }
  .cb input:checked + span{background: linear-gradient(90deg, var(--accent), var(--accent2));border-color: transparent}
  .cb input:checked + span:after{content:"";position:absolute;left:6px;top:2px;width:6px;height:12px;border:3px solid #fff;border-left:0;border-top:0;transform:rotate(45deg)}

  .progressWrap{display:grid;gap:8px}
  .progressTrack{height:10px;border-radius:999px;background:#ffffff;overflow:hidden;border:1px solid var(--bd)}
  .progressFill{height:100%;background: linear-gradient(90deg, var(--accent), var(--accent2))}

  .list{margin:8px 0 0 0;padding-left:18px;display:grid;gap:6px}
  .footer{margin:22px 0 10px;text-align:center;color:var(--muted);font-size:12px}
`;
