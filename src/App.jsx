import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { registerPlugin, Capacitor } from "@capacitor/core";
const Apps = registerPlugin("Apps");

/* ===== YevGallery — leshugan.yg ===== палитра/стиль YevFiles (шоколад) */

const BG = "var(--bg)", BAR = "var(--bar)", ROW2 = "var(--row2)", ACC = "var(--acc)";
const RED = "var(--red)", TXT = "var(--txt)", SUB = "var(--sub)", LINE = "var(--line)";
const THEMES = {
  dark:  { "--bg": "#1C140C", "--bar": "#2A2017", "--row2": "#2E251C", "--acc": "#EF6C00", "--accbg": "rgba(239,108,0,.18)", "--gold": "#F5A623", "--red": "#E05252", "--txt": "#F2EAE0", "--ink": "#E0D5C8", "--sub": "#B0A498", "--line": "#4A3A2A" },
  light: { "--bg": "#EEF1F4", "--bar": "#FFFFFF", "--row2": "#E4E8EC", "--acc": "#2F80ED", "--accbg": "rgba(47,128,237,.14)", "--gold": "#2F80ED", "--red": "#D14343", "--txt": "#1E2329", "--ink": "#3D4754", "--sub": "#6B7280", "--line": "#D3D8DE" },
};
const THEMEKEY = "yg_theme_v1", TRASHMETA = "yg_trashmeta_v1", SPECKEY = "yg_specials_v1", MEDIAKEY = "yg_media_v1";
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const loadMap = (k) => { try { return JSON.parse(ls.get(k)) || {}; } catch { return {}; } };
const saveMap = (k, m) => ls.set(k, JSON.stringify(m));
const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
const baseName = (p) => { p = String(p).replace(/^file:\/\//, ""); return p.includes("/") ? p.slice(p.lastIndexOf("/") + 1) : p; };
const parentOf = (p) => { p = String(p).replace(/^file:\/\//, ""); return p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : ""; };
const VID_EXT = new Set(["mp4", "mkv", "avi", "mov", "webm", "3gp", "m4v", "ts"]);
const isVidName = (n) => VID_EXT.has((n.split(".").pop() || "").toLowerCase());

const I = {
  back: <path d="M15 18l-6-6 6-6" />,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  check: <path d="M5 12l4 4 10-11" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  img: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  video: <><rect x="2" y="5" width="14" height="14" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></>,
  play: <><circle cx="12" cy="12" r="10" /><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" /></>,
  albums: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  grid: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.2 3.9M6.2 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.1-.5" /></>,
  wall: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 13l5-4 4 3 3-2 6 4" /><circle cx="16" cy="8.5" r="1.4" /><path d="M9 21h6M12 17v4" /></>,
  restore: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /></>,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>,
  moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>,
  selectAll: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
};
const Svg = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

/* ===== ленивые превью с кэшем и ограничением параллелизма ===== */
const tq = []; let tActive = 0; const T_MAX = 6;
const tPump = () => { while (tActive < T_MAX && tq.length) { const j = tq.shift(); tActive++; j().finally(() => { tActive--; tPump(); }); } };
const tEnqueue = (j) => { tq.push(j); tPump(); };
const thumbCache = new Map();

function Thumb({ uri, video }) {
  const [src, setSrc] = useState(() => thumbCache.get(uri) || "");
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (src) return;
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((ents) => { ents.forEach((e) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }); }, { rootMargin: "400px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!vis || src) return; let live = true;
    tEnqueue(() => Apps.thumb({ uri }).then((r) => { const v = r && r.thumb ? r.thumb : "x"; thumbCache.set(uri, v); if (live) setSrc(v); }).catch(() => { if (live) setSrc("x"); }));
    return () => { live = false; };
  }, [vis, uri]);
  return (
    <div ref={ref} style={{ width: "100%", aspectRatio: "1", background: ROW2, borderRadius: "inherit", overflow: "hidden", position: "relative" }}>
      {src && src !== "x" && <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      {src === "x" && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: SUB }}><Svg d={video ? I.video : I.img} size={30} /></div>}
      {video && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ display: "flex", color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,.7))" }}><Svg d={I.play} size={34} /></span></div>}
    </div>
  );
}

/* ===== классификация спец-альбомов ===== */
function classify(p, n) {
  p = (p || "").toLowerCase(); n = n || "";
  if (p.includes("whatsapp") && p.includes("image")) return { key: "whatsapp", name: "WhatsApp" };
  if (p.includes("telegram")) return { key: "telegram", name: "Telegram" };
  if (n.toLowerCase() === "screenshots" || p.includes("/screenshots")) return { key: "screenshots", name: "Скриншоты" };
  if (p.includes("/dcim/camera") || n === "Camera") return { key: "camera", name: "Камера" };
  if (n === "Pictures") return { key: "pictures", name: "Pictures" };
  return null;
}
const SPEC_ORDER = ["screenshots", "camera", "pictures", "whatsapp", "telegram"]; // [0] = правый нижний угол
const SPEC_NAME = { screenshots: "Скриншоты", camera: "Камера", pictures: "Pictures", whatsapp: "WhatsApp", telegram: "Telegram" };

function buildAlbums(items, isHidden) {
  const map = new Map();
  for (const it of items) {
    const sp = isHidden ? null : classify(it.bucketPath, it.bucketName);
    const key = sp ? sp.key : it.bucketPath;
    const name = sp ? sp.name : (it.bucketName || baseName(it.bucketPath));
    let a = map.get(key);
    if (!a) { a = { key, name, special: !!sp, paths: new Set(), items: [] }; map.set(key, a); }
    a.paths.add(it.bucketPath); a.items.push(it);
  }
  for (const a of map.values()) a.items.sort((x, y) => y.mtime - x.mtime);
  if (isHidden) return [...map.values()].sort((x, y) => x.items[0].mtime - y.items[0].mtime);
  const seen = loadMap(SPECKEY);
  for (const k of SPEC_ORDER) { const a = map.get(k); if (a) seen[k] = [...a.paths]; }
  saveMap(SPECKEY, seen);
  const others = [...map.values()].filter((a) => !a.special).sort((x, y) => x.items[0].mtime - y.items[0].mtime);
  const specials = [];
  for (const k of SPEC_ORDER) {
    let a = map.get(k);
    if (!a && seen[k] && seen[k].length) a = { key: k, name: SPEC_NAME[k], special: true, paths: new Set(seen[k]), items: [] };
    if (a) specials.push(a);
  }
  return [...specials, ...others];
}

// привязка к правому нижнему углу
function brCells(seq, cols) {
  const rows = Math.max(1, Math.ceil(seq.length / cols));
  const total = rows * cols;
  const cells = new Array(total).fill(null);
  for (let i = 0; i < seq.length; i++) cells[total - 1 - i] = seq[i];
  return cells;
}

const initCache = (() => { try { return JSON.parse(ls.get(MEDIAKEY)) || {}; } catch { return {}; } })();

export default function App() {
  const [theme, setTheme] = useState(() => ls.get(THEMEKEY) || "dark");
  const T = THEMES[theme] || THEMES.dark;
  const [allFiles, setAllFiles] = useState(true);
  const [root, setRoot] = useState(initCache.root || "/storage/emulated/0");
  const TRASH = root + "/.YevGalleryTrash";

  const [media, setMedia] = useState(initCache.media || []);
  const [hiddenItems, setHiddenItems] = useState(initCache.hidden || []);
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(!(initCache.media && initCache.media.length));

  const [section, setSection] = useState("albums");
  const [albumKey, setAlbumKey] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [bar, setBar] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [selMode, setSelMode] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null);

  const cfs = (u) => { try { return Capacitor.convertFileSrc(u); } catch { return u; } };
  const scrollRef = useRef(null);
  const vTouch = useRef(null);
  const lastScan = useRef(0);

  const albums = useMemo(() => buildAlbums(media, false), [media]);
  const hiddenAlbums = useMemo(() => buildAlbums(hiddenItems, true), [hiddenItems]);
  const allPhotos = useMemo(() => media.filter((m) => !m.video).sort((a, b) => b.mtime - a.mtime), [media]);
  const allVideos = useMemo(() => media.filter((m) => m.video).sort((a, b) => b.mtime - a.mtime), [media]);
  const albumPool = section === "hidden" ? hiddenAlbums : albums;
  const album = albumKey ? albumPool.find((a) => a.key === albumKey) : null;

  /* ---- доступ + сканирование (с кэшем, без слепого пересканирования) ---- */
  const checkAccess = useCallback(async () => { try { const r = await Apps.hasAllFiles(); setAllFiles(!!r.granted); return !!r.granted; } catch { setAllFiles(true); return true; } }, []);
  const scan = useCallback(async (bg) => {
    if (!bg) setLoading(true);
    try {
      const r = await Apps.scanMedia();
      if (r.root) setRoot(r.root);
      setMedia(r.items || []);
      setHiddenItems(r.hidden || []);
      lastScan.current = Date.now();
    } catch {}
    setLoading(false);
  }, []);
  const loadTrash = useCallback(async () => {
    const meta = loadMap(TRASHMETA);
    try {
      const r = await Apps.list({ uri: "file://" + TRASH });
      const files = (r.files || []).map((f) => { const m = meta[baseName(f.uri)]; return { ...f, name: m ? m.name : f.name }; });
      files.sort((a, b) => b.mtime - a.mtime);
      setTrashItems(files);
    } catch { setTrashItems([]); }
  }, [TRASH]);

  // первый запуск: показываем кэш мгновенно, досканируем в фоне
  useEffect(() => { (async () => { await checkAccess(); await scan(!!(initCache.media && initCache.media.length)); })(); }, []);
  // кэш в localStorage держим в актуальном виде (мгновенный старт в след. раз)
  useEffect(() => { ls.set(MEDIAKEY, JSON.stringify({ media, hidden: hiddenItems, root })); }, [media, hiddenItems, root]);
  useEffect(() => { Apps.setBars({ color: T["--bg"], light: theme === "light" }).catch(() => {}); ls.set(THEMEKEY, theme); }, [theme]);
  // возврат в приложение: фоновое обновление, без экрана загрузки и не чаще раза в 20с
  useEffect(() => {
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => { if (isActive) checkAccess().then((ok) => { if (ok && Date.now() - lastScan.current > 20000) scan(true); }); });
    return () => { sub.then((s) => s.remove()).catch(() => {}); };
  }, [checkAccess, scan]);

  useEffect(() => { if (albumKey && !album) setAlbumKey(null); }, [albumKey, album]);

  useLayoutEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (section === "albums" || section === "hidden" || albumKey) el.scrollTop = el.scrollHeight;
  }, [section, albumKey, albums, hiddenAlbums, media]);

  useEffect(() => {
    const sub = CapApp.addListener("backButton", () => {
      if (confirm) { setConfirm(null); return; }
      if (viewer) { setViewer(null); return; }
      if (selMode) { exitSel(); return; }
      if (albumKey) { setAlbumKey(null); return; }
      if (section !== "albums") { setSection("albums"); return; }
      CapApp.exitApp();
    });
    return () => { sub.then((s) => s.remove()).catch(() => {}); };
  });

  /* ---- выделение ---- */
  const exitSel = () => { setSelMode(null); setSel(new Set()); };
  const toggleSel = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const startSel = (mode, id) => { buzz(15); setSelMode(mode); setSel(new Set([id])); };

  /* ---- локальные мутации (без пересканирования) ---- */
  const removeUris = (uris) => { setMedia((ms) => ms.filter((m) => !uris.has(m.uri))); setHiddenItems((hs) => hs.filter((m) => !uris.has(m.uri))); };
  const moveToTrash = async (items) => {
    const meta = loadMap(TRASHMETA); const newT = []; const uris = new Set();
    for (const it of items) {
      const tname = Date.now() + "_" + Math.random().toString(36).slice(2, 7) + "__" + baseName(it.uri);
      try { await Apps.move({ from: it.uri, to: "file://" + TRASH + "/" + tname }); meta[tname] = { orig: it.uri, name: baseName(it.uri), mtime: it.mtime }; newT.push({ uri: "file://" + TRASH + "/" + tname, name: baseName(it.uri), mtime: it.mtime, video: !!it.video }); uris.add(it.uri); } catch {}
    }
    saveMap(TRASHMETA, meta); removeUris(uris); setTrashItems((ts) => [...newT, ...ts]);
  };
  const restoreTrash = async (items) => {
    const meta = loadMap(TRASHMETA); const back = []; const done = new Set();
    for (const it of items) {
      const k = baseName(it.uri); const m = meta[k]; if (!m) continue;
      try { await Apps.move({ from: it.uri, to: m.orig }); delete meta[k]; const pp = parentOf(m.orig); back.push({ uri: m.orig, name: m.name, mtime: m.mtime || Date.now(), size: it.size, video: isVidName(m.name), bucketPath: pp, bucketName: baseName(pp) }); done.add(it.uri); } catch {}
    }
    saveMap(TRASHMETA, meta); setTrashItems((ts) => ts.filter((t) => !done.has(t.uri))); setMedia((ms) => [...back, ...ms]);
  };
  const deleteForever = async (items) => {
    const meta = loadMap(TRASHMETA); const done = new Set();
    for (const it of items) { try { await Apps.delete({ uri: it.uri }); delete meta[baseName(it.uri)]; done.add(it.uri); } catch {} }
    saveMap(TRASHMETA, meta); setTrashItems((ts) => ts.filter((t) => !done.has(t.uri)));
  };

  /* ---- подтверждение (инлайн, рядом с кнопкой удалить) + действия ---- */
  const ask = (text, onYes) => setConfirm({ text, onYes: async () => { setConfirm(null); await onYes(); } });
  const photoPool = () => album ? album.items : section === "all" ? allPhotos : section === "video" ? allVideos : section === "trash" ? trashItems : [];

  const doDeletePhotos = () => { const items = photoPool().filter((m) => sel.has(m.uri)); if (!items.length) return; ask(items.length > 1 ? "Удалить " + items.length + "?" : "Удалить файл?", async () => { exitSel(); await moveToTrash(items); }); };
  const doSharePhotos = () => { const items = photoPool().filter((m) => sel.has(m.uri)); if (items[0]) Apps.share({ uri: items[0].uri, mime: items[0].video ? "video/*" : "image/*" }).catch(() => {}); exitSel(); };
  const doRestore = async () => { const items = trashItems.filter((m) => sel.has(m.uri)); exitSel(); await restoreTrash(items); };
  const doDeleteForever = () => { const items = trashItems.filter((m) => sel.has(m.uri)); if (!items.length) return; ask("Удалить навсегда?", async () => { exitSel(); await deleteForever(items); }); };
  const doHideAlbums = async () => {
    const list = albums.filter((a) => sel.has(a.key)); exitSel();
    const uris = new Set(); const moved = [];
    for (const a of list) { for (const p of a.paths) { try { await Apps.setNomedia({ path: "file://" + p, on: true }); } catch {} } for (const it of a.items) { uris.add(it.uri); moved.push(it); } }
    setMedia((ms) => ms.filter((m) => !uris.has(m.uri))); setHiddenItems((hs) => [...moved, ...hs]);
  };
  const doShowAlbums = async () => {
    const list = hiddenAlbums.filter((a) => sel.has(a.key)); exitSel();
    const uris = new Set(); const moved = [];
    for (const a of list) { for (const p of a.paths) { try { await Apps.setNomedia({ path: "file://" + p, on: false }); } catch {} } for (const it of a.items) { uris.add(it.uri); moved.push(it); } }
    setHiddenItems((hs) => hs.filter((m) => !uris.has(m.uri))); setMedia((ms) => [...moved, ...ms]);
  };
  const doDeleteAlbums = () => {
    const pool = section === "hidden" ? hiddenAlbums : albums;
    const list = pool.filter((a) => sel.has(a.key)); if (!list.length) return;
    let all = []; for (const a of list) all = all.concat(a.items);
    ask("Удалить альбомы в корзину?", async () => { exitSel(); await moveToTrash(all); });
  };

  /* ---- вьювер ---- */
  const openViewer = (items, idx, trash) => { setViewer({ items, idx, trash: !!trash }); setBar(true); setDragX(0); };
  const viewerGo = (d) => setViewer((v) => { if (!v) return v; const ni = v.idx + d; if (ni < 0 || ni >= v.items.length) return v; return { ...v, idx: ni }; });
  const vCur = viewer && viewer.items[viewer.idx];
  const removeFromViewer = () => setViewer((v) => { const items = v.items.filter((_, i) => i !== v.idx); if (!items.length) return null; return { ...v, items, idx: Math.min(v.idx, items.length - 1) }; });
  const viewerDeleteOne = () => { if (!vCur) return; const cur = vCur, isTrash = viewer.trash; ask("Удалить файл?", async () => { if (isTrash) await deleteForever([cur]); else await moveToTrash([cur]); removeFromViewer(); }); };
  const viewerRestoreOne = async () => { if (!vCur) return; const cur = vCur; await restoreTrash([cur]); removeFromViewer(); };

  /* ---- секции ---- */
  const trashTapRef = useRef(0);
  const goSection = (s) => {
    if (s === "trash") {
      const now = Date.now();
      if (now - trashTapRef.current < 350) { trashTapRef.current = 0; ask("Очистить корзину?", async () => { await deleteForever(trashItems); }); return; }
      trashTapRef.current = now; loadTrash();
    }
    exitSel(); setAlbumKey(null); setSection(s);
  };
  const enterHidden = () => { buzz(20); exitSel(); setAlbumKey(null); setSection("hidden"); };

  /* ================= РЕНДЕР ================= */
  const headerTitle = album ? album.name : section === "albums" ? "Альбомы" : section === "all" ? "Все" : section === "video" ? "Видео" : section === "trash" ? "Корзина" : "Скрытые";
  const SECS = [
    { id: "trash", icon: I.trash, label: "Корзина" },
    { id: "video", icon: I.video, label: "Видео" },
    { id: "all", icon: I.grid, label: "Все" },
    { id: "albums", icon: I.albums, label: "Альбомы" },
  ];
  const showNav = !selMode && !album && section !== "hidden";

  return (
    <div style={{ ...T, position: "fixed", inset: 0, background: BG, color: TXT, fontFamily: "system-ui, Roboto, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`html,body{margin:0;background:${T["--bg"]}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}`}</style>

      {/* ===== header (полностью закруглённая панель) ===== */}
      <div style={{ paddingTop: "env(safe-area-inset-top)", flexShrink: 0 }}>
        <div style={{ height: 52, margin: "8px 8px 6px", borderRadius: 26, background: BAR, display: "flex", alignItems: "center", gap: 8, padding: "0 6px 0 16px", boxShadow: "0 1px 0 rgba(255,255,255,.05) inset, 0 4px 16px -6px rgba(0,0,0,.4)" }}>
          {selMode ? (
            <>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 700 }}>{sel.size}</span>
              <button onClick={() => { if (selMode === "album") setSel(new Set(albumPool.map((a) => a.key))); else setSel(new Set(photoPool().map((m) => m.uri))); }} style={btnIcon}><Svg d={I.selectAll} size={22} /></button>
              <button onClick={exitSel} style={btnIcon}><Svg d={I.x} size={22} /></button>
            </>
          ) : (
            <>
              {(album || section === "hidden") && <button onClick={() => { if (album) setAlbumKey(null); else setSection("albums"); }} style={{ ...btnIcon, marginLeft: -8 }}><Svg d={I.back} size={24} /></button>}
              <span style={{ flex: 1, fontSize: 19, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{headerTitle}</span>
              <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} style={btnIcon}><Svg d={theme === "dark" ? I.sun : I.moon} size={22} /></button>
            </>
          )}
        </div>
      </div>

      {!allFiles && (
        <div style={{ background: T["--accbg"], padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ flex: 1, fontSize: 13, color: TXT }}>Нужен доступ ко всем файлам, чтобы видеть фото</span>
          <button onClick={() => Apps.requestAllFiles().catch(() => {})} style={{ background: ACC, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600 }}>Дать доступ</button>
        </div>
      )}

      {/* ===== контент ===== */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
        {loading && !media.length ? (
          <div style={{ padding: 40, textAlign: "center", color: SUB, fontSize: 14 }}>Сканирование…</div>
        ) : album ? (
          <PhotoGrid items={album.items} br {...{ selMode, sel, toggleSel, startSel, openViewer, trash: false }} empty="Альбом пуст" />
        ) : section === "albums" ? (
          <AlbumsView albums={albums} {...{ selMode, sel, toggleSel, startSel, setAlbumKey }} />
        ) : section === "hidden" ? (
          <AlbumsView albums={hiddenAlbums} hidden {...{ selMode, sel, toggleSel, startSel, setAlbumKey }} />
        ) : section === "all" ? (
          <PhotoGrid items={allPhotos} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: false }} empty="Нет фотографий" />
        ) : section === "video" ? (
          <PhotoGrid items={allVideos} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: false }} empty="Нет видео" />
        ) : (
          <PhotoGrid items={trashItems} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: true }} empty="Корзина пуста" />
        )}
      </div>

      {/* ===== нижняя зона фиксированной высоты ===== */}
      <div style={{ height: 64, paddingBottom: "env(safe-area-inset-bottom)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selMode === "album" ? (
          <Toolbar items={section === "hidden"
            ? [[I.eye, "Показать", doShowAlbums, false], [I.trash, "Удалить", doDeleteAlbums, true]]
            : [[I.eyeOff, "Скрыть", doHideAlbums, false], [I.trash, "Удалить", doDeleteAlbums, true]]} disabled={sel.size === 0} />
        ) : selMode === "photo" ? (
          <Toolbar items={section === "trash"
            ? [[I.restore, "Восстановить", doRestore, false], [I.trash, "Удалить", doDeleteForever, true]]
            : [[I.share, "Поделиться", doSharePhotos, false], [I.trash, "Удалить", doDeletePhotos, true]]} disabled={sel.size === 0} />
        ) : showNav ? (
          <div style={{ display: "flex", background: BAR, border: "1px solid " + LINE, borderRadius: 30, padding: 5, gap: 2, boxShadow: "0 6px 20px rgba(0,0,0,.35)" }}>
            {SECS.map((s) => {
              const act = section === s.id;
              return (
                <button key={s.id}
                  onClick={() => { if (s.id === "albums" && holdRef.fired) { holdRef.fired = false; return; } goSection(s.id); }}
                  onContextMenu={(e) => { e.preventDefault(); if (s.id === "albums") enterHidden(); }}
                  onTouchStart={s.id === "albums" ? () => { holdRef.fired = false; holdRef.t = setTimeout(() => { holdRef.fired = true; enterHidden(); }, 550); } : undefined}
                  onTouchEnd={s.id === "albums" ? () => clearTimeout(holdRef.t) : undefined}
                  onTouchMove={s.id === "albums" ? () => clearTimeout(holdRef.t) : undefined}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: act ? ACC : "transparent", color: act ? "#fff" : SUB, borderRadius: 24, padding: "7px 14px", minWidth: 58, transition: "background .15s" }}>
                  <Svg d={s.icon} size={21} /><span style={{ fontSize: 10.5, fontWeight: act ? 700 : 500 }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ===== вьювер ===== */}
      {viewer && vCur && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "#000", touchAction: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            onTouchStart={(e) => { const t = e.touches[0]; vTouch.current = { x: t.clientX, y: t.clientY, t: Date.now() }; setDragging(true); }}
            onTouchMove={(e) => { if (!vTouch.current) return; const t = e.touches[0]; const dx = t.clientX - vTouch.current.x, dy = t.clientY - vTouch.current.y; if (Math.abs(dx) > Math.abs(dy)) setDragX(dx); }}
            onTouchEnd={(e) => {
              setDragging(false); const v = vTouch.current; vTouch.current = null; if (!v) { setDragX(0); return; }
              const t = e.changedTouches[0]; const dx = t.clientX - v.x, dy = t.clientY - v.y, dt = Date.now() - v.t;
              if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300) { setBar((b) => !b); setDragX(0); return; }
              const TH = Math.min(60, window.innerWidth * 0.12), flick = dt < 260 && Math.abs(dx) > 30;
              if ((dx < -TH || (flick && dx < 0)) && viewer.idx < viewer.items.length - 1) viewerGo(1);
              else if ((dx > TH || (flick && dx > 0)) && viewer.idx > 0) viewerGo(-1);
              setDragX(0);
            }}>
            {vCur.video ? (
              <video key={vCur.uri} src={cfs(vCur.uri)} controls autoPlay style={{ maxWidth: "100%", maxHeight: "100%" }} />
            ) : (
              <img key={vCur.uri} src={cfs(vCur.uri)} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: "translateX(" + dragX + "px)", transition: dragging ? "none" : "transform .2s ease", pointerEvents: "none", userSelect: "none" }} />
            )}
          </div>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: "env(safe-area-inset-top)", background: "linear-gradient(to bottom, rgba(0,0,0,.75), transparent)", transform: bar ? "translateY(0)" : "translateY(-110%)", transition: "transform .2s ease", pointerEvents: bar ? "auto" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 18px" }}>
              <span style={{ flex: 1, minWidth: 0, color: "#fff", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vCur.name}</span>
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>{viewer.idx + 1}/{viewer.items.length}</span>
              <span onClick={() => setViewer(null)} style={{ display: "flex", color: "#fff" }}><Svg d={I.x} size={24} /></span>
            </div>
          </div>

          {!vCur.video && !viewer.trash && (
            <div style={{ position: "absolute", left: 12, top: "calc(env(safe-area-inset-top) + 60px)", transform: bar ? "translateX(0)" : "translateX(-150%)", transition: "transform .2s ease", pointerEvents: bar ? "auto" : "none" }}>
              <span onClick={() => Apps.setWallpaper({ uri: vCur.uri }).catch(() => {})} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", borderRadius: 22, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}>
                <Svg d={I.wall} size={19} /> Обои
              </span>
            </div>
          )}

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: "env(safe-area-inset-bottom)", background: "linear-gradient(to top, rgba(0,0,0,.8), transparent)", transform: bar ? "translateY(0)" : "translateY(110%)", transition: "transform .2s ease", pointerEvents: bar ? "auto" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-around", padding: "18px 8px 16px" }}>
              {(viewer.trash
                ? [[I.restore, "Восстановить", viewerRestoreOne, false], [I.trash, "Удалить", viewerDeleteOne, true]]
                : [[I.share, "Поделиться", () => Apps.share({ uri: vCur.uri, mime: vCur.video ? "video/*" : "image/*" }).catch(() => {}), false], [I.edit, "Изменить", () => Apps.editImage({ uri: vCur.uri, mime: "image/*" }).catch(() => {}), false], [I.trash, "Удалить", viewerDeleteOne, true]]
              ).map(([ic, lbl, fn, red], i) => (
                <span key={i} onClick={fn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: red ? "#FF6B6B" : "#fff", minWidth: 60 }}>
                  <Svg d={ic} size={23} /><span style={{ fontSize: 11 }}>{lbl}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== подтверждение Да/Нет — рядом с кнопкой удаления (внизу) ===== */}
      {confirm && (
        <div style={{ position: "fixed", left: 8, right: 8, bottom: "calc(env(safe-area-inset-bottom) + 10px)", zIndex: 1600, display: "flex", alignItems: "center", gap: 10, background: BAR, border: "1px solid " + LINE, borderRadius: 18, padding: "10px 10px 10px 16px", boxShadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 8px 28px rgba(0,0,0,.55)" }}>
          <span style={{ flex: 1, minWidth: 0, color: TXT, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{confirm.text}</span>
          <button onClick={() => setConfirm(null)} style={{ background: ROW2, border: "1px solid " + LINE, borderRadius: 12, color: SUB, fontSize: 14, padding: "8px 18px" }}>Нет</button>
          <button onClick={confirm.onYes} style={{ background: RED, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, padding: "8px 20px" }}>Да</button>
        </div>
      )}
    </div>
  );
}

const holdRef = { t: null, fired: false };
const btnIcon = { display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, border: "none", background: "transparent", color: "var(--txt)", borderRadius: 20 };

/* ===== сетка фото ===== */
function PhotoGrid({ items, selMode, sel, toggleSel, startSel, openViewer, trash, empty, br }) {
  const hold = useRef({ t: null, fired: false });
  if (!items.length) return <div style={{ padding: 50, textAlign: "center", color: "var(--sub)", fontSize: 14 }}>{empty}</div>;
  const seq = items.map((m, i) => ({ m, i }));
  const cells = br ? brCells(seq, 3) : seq;
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: br ? "flex-end" : "flex-start" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, padding: 4, width: "100%" }}>
        {cells.map((c, ci) => {
          if (!c) return <div key={"e" + ci} style={{ aspectRatio: "1" }} />;
          const m = c.m, on = sel.has(m.uri);
          return (
            <div key={m.uri}
              onClick={() => { if (hold.current.fired) { hold.current.fired = false; return; } if (selMode) toggleSel(m.uri); else openViewer(items, c.i, trash); }}
              onContextMenu={(e) => { e.preventDefault(); if (!selMode) startSel("photo", m.uri); }}
              onTouchStart={() => { hold.current.fired = false; hold.current.t = setTimeout(() => { hold.current.fired = true; if (!selMode) startSel("photo", m.uri); }, 450); }}
              onTouchEnd={() => clearTimeout(hold.current.t)}
              onTouchMove={() => clearTimeout(hold.current.t)}
              style={{ position: "relative", minWidth: 0, borderRadius: 8, overflow: "hidden", outline: on ? "3px solid var(--acc)" : "none", outlineOffset: -3 }}>
              <Thumb uri={m.uri} video={m.video} />
              {selMode && (
                <span style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: 11, border: "2px solid #fff", background: on ? "var(--acc)" : "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{on && <Svg d={I.check} size={14} />}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== сетка альбомов (привязана к правому нижнему углу) ===== */
function AlbumsView({ albums, selMode, sel, toggleSel, startSel, setAlbumKey, hidden }) {
  const hold = useRef({ t: null, fired: false });
  if (!albums.length) return <div style={{ padding: 50, textAlign: "center", color: "var(--sub)", fontSize: 14 }}>{hidden ? "Нет скрытых альбомов" : "Альбомы не найдены"}</div>;
  const cells = brCells(albums, 3);
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 10, width: "100%" }}>
        {cells.map((a, ci) => {
          if (!a) return <div key={"e" + ci} aria-hidden style={{ visibility: "hidden" }}><div style={{ width: "100%", aspectRatio: "1" }} /><div style={{ height: 40 }} /></div>;
          const on = sel.has(a.key); const cover = a.items[0];
          return (
            <div key={a.key}
              onClick={() => { if (hold.current.fired) { hold.current.fired = false; return; } if (selMode === "album") toggleSel(a.key); else setAlbumKey(a.key); }}
              onContextMenu={(e) => { e.preventDefault(); startSel("album", a.key); }}
              onTouchStart={() => { hold.current.fired = false; hold.current.t = setTimeout(() => { hold.current.fired = true; startSel("album", a.key); }, 450); }}
              onTouchEnd={() => clearTimeout(hold.current.t)}
              onTouchMove={() => clearTimeout(hold.current.t)}
              style={{ minWidth: 0 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", outline: on ? "3px solid var(--acc)" : "none", outlineOffset: -3 }}>
                {cover ? <Thumb uri={cover.uri} video={cover.video} />
                  : <div style={{ width: "100%", aspectRatio: "1", background: "var(--row2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sub)" }}><Svg d={I.folder} size={34} /></div>}
                {hidden && <span style={{ position: "absolute", top: 6, left: 6, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.8))" }}><Svg d={I.eyeOff} size={16} /></span>}
                {selMode === "album" && (
                  <span style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, border: "2px solid #fff", background: on ? "var(--acc)" : "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{on && <Svg d={I.check} size={14} />}</span>
                )}
              </div>
              <div style={{ marginTop: 5, fontSize: 12.5, fontWeight: 600, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
              <div style={{ fontSize: 11, color: "var(--sub)" }}>{a.items.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== нижний тулбар выделения ===== */
function Toolbar({ items, disabled }) {
  return (
    <div style={{ display: "flex", background: "var(--bar)", border: "1px solid var(--line)", borderRadius: 30, padding: "6px 8px", gap: 4, boxShadow: "0 6px 20px rgba(0,0,0,.35)", opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {items.map(([ic, lbl, fn, red], i) => (
        <span key={i} onClick={fn} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: red ? "var(--red)" : "var(--txt)", minWidth: 84, padding: "2px 10px" }}>
          <Svg d={ic} size={22} /><span style={{ fontSize: 11 }}>{lbl}</span>
        </span>
      ))}
    </div>
  );
}
