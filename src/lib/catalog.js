import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  artworks as staticArtworks,
  collections as staticCollections,
} from "../data/artworks";

// Map a DB row into the shape the UI components already expect.
const mapArtwork = (row) => ({
  id: row.id,
  title: row.title,
  medium: row.medium,
  dimensions: row.dimensions,
  price: row.price,
  year: row.year,
  statement: row.statement,
  img: row.image_url,
  collection: row.collection?.slug ?? null,
  isFeatured: row.is_featured,
});

const ALL = { id: "all", label: "All Works" };

// Fetch the live catalog, falling back to static data on any failure or
// before the DB has been seeded — so the public site is never empty/broken.
export async function getCatalog() {
  if (!supabase) {
    return { artworks: staticArtworks, collections: staticCollections, source: "static" };
  }
  try {
    const [colsRes, artsRes] = await Promise.all([
      supabase.from("collections").select("*").order("sort_order"),
      supabase
        .from("artworks")
        .select("*, collection:collections(slug)")
        .order("sort_order")
        .order("created_at"),
    ]);

    if (artsRes.error || colsRes.error || !artsRes.data?.length) {
      return {
        artworks: staticArtworks,
        collections: staticCollections,
        source: "static-fallback",
      };
    }

    const collections = [
      ALL,
      ...colsRes.data.map((c) => ({ id: c.slug, label: c.label })),
    ];
    return {
      artworks: artsRes.data.map(mapArtwork),
      collections,
      source: "supabase",
    };
  } catch {
    return {
      artworks: staticArtworks,
      collections: staticCollections,
      source: "error-fallback",
    };
  }
}

// Hook for components — starts on static data, swaps to live data when ready.
export function useCatalog() {
  const [state, setState] = useState({
    artworks: staticArtworks,
    collections: staticCollections,
    loading: true,
    source: "static",
  });

  useEffect(() => {
    let active = true;
    const load = () =>
      getCatalog().then((res) => {
        if (active) setState({ ...res, loading: false });
      });
    load();
    // Refetch when returning to the tab so admin edits appear without a refresh.
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

  return state;
}
