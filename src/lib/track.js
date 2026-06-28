import { supabase } from "./supabase";

// Stable-ish per-browser id so the dashboard can estimate unique visitors.
function getSessionId() {
  try {
    let id = localStorage.getItem("rb_sid");
    if (!id) {
      id =
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      localStorage.setItem("rb_sid", id);
    }
    return id;
  } catch {
    return null;
  }
}

function deviceType() {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

// Derive a human channel from UTM or referrer.
function deriveSource(params, referrer) {
  const utm = params.get("utm_source");
  if (utm) return utm.toLowerCase();
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === location.hostname) return "direct";
    if (/whatsapp|wa\.me/.test(host)) return "whatsapp";
    if (/instagram/.test(host)) return "instagram";
    if (/facebook|fb\./.test(host)) return "facebook";
    if (/google/.test(host)) return "google";
    if (/t\.co|twitter|x\.com/.test(host)) return "twitter";
    if (/linkedin/.test(host)) return "linkedin";
    if (/youtube|youtu\.be/.test(host)) return "youtube";
    return host;
  } catch {
    return "direct";
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let visitLogged = false;

export async function trackVisit(path = location.pathname) {
  if (!supabase || visitLogged) return;
  visitLogged = true; // once per page load
  const params = new URLSearchParams(location.search);
  const referrer = document.referrer || "";
  try {
    await supabase.from("visits").insert({
      path,
      referrer,
      source: deriveSource(params, referrer),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      device: deviceType(),
      session_id: getSessionId(),
    });
  } catch {
    /* analytics must never break the page */
  }
}

// Log a lightweight interest event (a CTA click) with its source.
export async function trackLead({ artwork, type = "whatsapp_inquiry", source }) {
  if (!supabase) return;
  const params = new URLSearchParams(location.search);
  try {
    await supabase.from("leads").insert({
      type,
      source,
      artwork_id: artwork && UUID_RE.test(String(artwork.id)) ? artwork.id : null,
      artwork_title: artwork?.title ?? null,
      price: artwork?.price ?? null,
      referrer: document.referrer || "",
      utm_source: params.get("utm_source"),
      session_id: getSessionId(),
    });
  } catch {
    /* never block the WhatsApp redirect */
  }
}

// Submit a full inquiry (name/email/phone/message) from the contact / artwork
// forms. Returns the Supabase result so the caller can show success/failure.
export async function submitLead({
  artwork,
  type = "whatsapp_inquiry",
  source,
  name,
  email,
  phone,
  message,
}) {
  if (!supabase) return { error: null };
  const params = new URLSearchParams(location.search);
  return supabase.from("leads").insert({
    type,
    source,
    name: name || null,
    email: email || null,
    phone: phone || null,
    message: message || null,
    contact: [email, phone].filter(Boolean).join(" · ") || null,
    artwork_id: artwork && UUID_RE.test(String(artwork.id)) ? artwork.id : null,
    artwork_title: artwork?.title ?? null,
    price: artwork?.price ?? null,
    referrer: document.referrer || "",
    utm_source: params.get("utm_source"),
    session_id: getSessionId(),
  });
}
