import Resurgence from "../assets/Resurgence.jpg";
import Magnanimous from "../assets/Magnanimous.jpg";
import Tranquil from "../assets/Tranquil.jpg";
import Aspire from "../assets/Aspire.jpg";
import Relentless from "../assets/Relentless.jpg";
import EchoesofAwakening from "../assets/EchoesofAwakening.jpg";
import EtherealElegance from "../assets/EtherealEleganceShadowsinCelestialMist.jpg";
import Untittled1 from "../assets/Untittled1.jpg";
import Untittled2 from "../assets/Untittled2.jpg";
import Untittled3 from "../assets/Untittled3.jpg";
import Untittled4 from "../assets/Untittled4.jpg";
import Untittled5 from "../assets/Untittled5.jpg";

// Collections drive the gallery filter tabs.
export const collections = [
  { id: "all", label: "All Works" },
  { id: "masterpiece", label: "The Masterpiece Collection" },
  { id: "limited", label: "Limited Edition Luxe" },
  { id: "modern", label: "Modern Elegance" },
];

// Single source of truth for every piece. Add a new object here and it
// flows into the gallery, filters and lightbox automatically.
export const artworks = [
  {
    id: "resurgence",
    title: "Resurgence",
    medium: "Oil on Canvas",
    dimensions: "30 × 40 in",
    price: "$5,000,000",
    year: "2024",
    img: Resurgence,
    collection: "masterpiece",
    statement:
      "A bold meditation on rebirth — layered cracturism textures rising from darkness into gilded light.",
  },
  {
    id: "magnanimous",
    title: "Magnanimous",
    medium: "Oil on Canvas",
    dimensions: "15 × 23 in",
    price: "$1,000,000",
    year: "2024",
    img: Magnanimous,
    collection: "masterpiece",
    statement:
      "Generous gestures of gold across a contemplative black field — abundance rendered in restraint.",
  },
  {
    id: "tranquil",
    title: "Tranquil",
    medium: "Oil on Canvas",
    dimensions: "15 × 23 in",
    price: "$500,000",
    year: "2023",
    img: Tranquil,
    collection: "masterpiece",
    statement:
      "Floating dotism in its calmest form — a quiet, balanced rhythm that settles the room.",
  },
  {
    id: "aspire",
    title: "Aspire",
    medium: "Oil on Canvas",
    dimensions: "24 × 36 in",
    price: "$250,000",
    year: "2024",
    img: Aspire,
    collection: "masterpiece",
    statement:
      "Upward movement captured in texture and line — an ode to ambition and elevation.",
  },
  {
    id: "echoes-of-awakening",
    title: "Echoes of Awakening",
    medium: "Oil on Canvas",
    dimensions: "24 × 24 in",
    price: "$80,000",
    year: "2023",
    img: EchoesofAwakening,
    collection: "limited",
    statement:
      "The first stirrings of consciousness, echoing outward through celestial layers of pigment.",
  },
  {
    id: "ethereal-elegance",
    title: "Ethereal Elegance: Shadows in Celestial Mist",
    medium: "Oil on Canvas",
    dimensions: "26 × 28 in",
    price: "$75,000",
    year: "2023",
    img: EtherealElegance,
    collection: "limited",
    statement:
      "Shadow and shimmer suspended in mist — delicate, luminous and endlessly refined.",
  },
  {
    id: "relentless",
    title: "Relentless",
    medium: "Oil on Canvas",
    dimensions: "30 × 40 in",
    price: "$120,000",
    year: "2024",
    img: Relentless,
    collection: "limited",
    statement:
      "An unyielding energy driven through bold contrasts — momentum made visible.",
  },
  {
    id: "untitled-iii",
    title: "Untitled III",
    medium: "Oil on Canvas",
    dimensions: "12 × 12 in",
    price: "$100,000",
    year: "2023",
    img: Untittled3,
    collection: "masterpiece",
    statement: "A study in intimate scale and maximal texture.",
  },
  {
    id: "untitled-iv",
    title: "Untitled IV",
    medium: "Oil on Canvas",
    dimensions: "12 × 12 in",
    price: "$100,000",
    year: "2023",
    img: Untittled4,
    collection: "masterpiece",
    statement: "Cracturism explored within a perfect square.",
  },
  {
    id: "untitled-v",
    title: "Untitled V",
    medium: "Oil on Canvas",
    dimensions: "12 × 12 in",
    price: "$100,000",
    year: "2023",
    img: Untittled5,
    collection: "masterpiece",
    statement: "Quiet gold tracings over a deep, brooding ground.",
  },
  {
    id: "untitled-i",
    title: "Untitled I",
    medium: "Acrylic on Canvas",
    dimensions: "12 × 12 in",
    price: "$1,000",
    year: "2022",
    img: Untittled1,
    collection: "modern",
    statement: "An accessible entry into the artist's modern vocabulary.",
  },
  {
    id: "untitled-ii",
    title: "Untitled II",
    medium: "Acrylic on Canvas",
    dimensions: "12 × 12 in",
    price: "$1,000",
    year: "2022",
    img: Untittled2,
    collection: "modern",
    statement: "Playful, contemporary and full of movement.",
  },
];
