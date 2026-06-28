/* eslint-disable react-refresh/only-export-components -- provider + hook colocated by design */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { artist, about, studio, contact, marqueePhrases } from "../data/site";

// Static defaults — used until/unless the admin overrides a section in the DB.
export const DEFAULT_CONTENT = {
  artist,
  about,
  studio,
  contact,
  marquee: marqueePhrases,
};

// The editable section keys (also used by the admin editor).
export const CONTENT_KEYS = ["artist", "about", "studio", "contact", "marquee"];

const SiteContext = createContext(DEFAULT_CONTENT);

const isUrl = (v) => typeof v === "string" && /^https?:\/\//.test(v);

function merge(rows) {
  const byKey = Object.fromEntries((rows || []).map((r) => [r.key, r.value]));
  const a = byKey.artist || {};
  return {
    artist: {
      ...artist,
      ...a,
      // Images only override when a real uploaded URL is stored; otherwise the
      // bundled default is used (avoids persisting fragile dev/build paths).
      banner: isUrl(a.banner) ? a.banner : artist.banner,
      portrait: isUrl(a.portrait) ? a.portrait : artist.portrait,
    },
    about: { ...about, ...(byKey.about || {}) },
    studio: { ...studio, ...(byKey.studio || {}) },
    contact: { ...contact, ...(byKey.contact || {}) },
    marquee: Array.isArray(byKey.marquee) ? byKey.marquee : marqueePhrases,
  };
}

export function SiteProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const load = () =>
      supabase
        .from("site_settings")
        .select("key, value")
        .then(({ data, error }) => {
          if (active && !error) setContent(merge(data));
        });
    load();
    // Refetch when the visitor returns to the tab, so admin edits show up
    // without a manual refresh.
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

// Fetch merged content once (for the admin editor to pre-fill forms).
export async function fetchContent() {
  if (!supabase) return DEFAULT_CONTENT;
  const { data } = await supabase.from("site_settings").select("key, value");
  return merge(data);
}
