import RamBarkhaneProfilePhoto from "../assets/RamBarkhaneProfilePhoto.jpg";
import BannerOfWebsiteRam from "../assets/BannerOfWebsiteRam.jpg";

export const artist = {
  name: "Ram Barkhane",
  tagline: "Where Art Meets Luxury",
  role: "Contemporary Abstract Artist",
  subtitle: "Original Abstract Masterpieces by Ram Barkhane",
  titles: "Modern Visionary · Creator of Cracturism & Floating Dotism",
  portrait: RamBarkhaneProfilePhoto,
  banner: BannerOfWebsiteRam,
  whatsapp: "919200636667",
};

// WhatsApp deep-link builder used by the lightbox + hero CTAs.
export const buildWhatsAppLink = (art) => {
  const base = `https://wa.me/${artist.whatsapp}`;
  if (!art) {
    const greeting = `Hello Ram, I'd love to learn more about your available works.`;
    return `${base}?text=${encodeURIComponent(greeting)}`;
  }
  const message =
    `Hello Ram,\n\nI am interested in purchasing:\n` +
    `*Title:* ${art.title}\n` +
    `*Medium:* ${art.medium}\n` +
    `*Dimensions:* ${art.dimensions}\n` +
    `*Price:* ${art.price}\n\n` +
    `Please share more details.`;
  return `${base}?text=${encodeURIComponent(message)}`;
};

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "studio", label: "Studio" },
  { id: "contact", label: "Contact" },
];

export const about = {
  heading: "The Artist",
  lead: "Transforming emotions into timeless abstract masterpieces — bespoke art for the world's most refined homes, offices and private estates.",
  paragraphs: [
    "Hi, I am Ram Barkhane — a contemporary abstract artist whose work explores depth, texture and movement through innovative techniques. My signature styles, Cracturism and Floating Dotism, combine intricate linework with layered textures to create paintings that feel both timeless and modern.",
    "Fusing minimalism with expressive abstraction, my canvases feature powerful contrasts — black and gold compositions that radiate luxury and elegance. Each work is designed to complement refined interiors, making them sought after by collectors and luxury homeowners worldwide.",
    "Every painting is not only a visual experience but a meditation on balance, energy and emotion. With bold gestures and delicate details, my art bridges contemporary aesthetics with soulful expression — inviting viewers to find their own meaning within the abstract forms.",
  ],
  specialties: [
    "Contemporary Abstract Painting",
    "Textured Abstract Painting",
    "Luxury Wall Art",
    "Minimalist Abstract Art",
    "Abstract Expressionism",
    "Large Canvas Abstract Painting",
    "Black & Gold Abstract Art",
    "Abstract Art for Modern Homes",
  ],
  stats: [
    { value: "15+", label: "Years Painting" },
    { value: "2", label: "Original Styles" },
    { value: "200+", label: "Works Created" },
    { value: "Global", label: "Collector Base" },
  ],
};

// Scrolling marquee phrases under the hero.
export const marqueePhrases = [
  "Cracturism",
  "Floating Dotism",
  "Black & Gold",
  "Oil on Canvas",
  "Luxury Wall Art",
  "Abstract Expressionism",
  "Bespoke Commissions",
  "Timeless · Modern",
];

export const studio = {
  heading: "Inside the Studio",
  lead: "Where pigment, patience and philosophy meet the canvas.",
  paragraphs: [
    "Each piece begins long before the first stroke — in observation, in stillness, in the search for a feeling worth making permanent. The studio is a space of deliberate experimentation, where layers are built, broken and rebuilt until the surface holds tension and calm at once.",
    "Cracturism emerged from a fascination with the beauty of fracture — the gold that fills the cracks. Floating Dotism followed, a meditative rhythm of suspended points that lend the work weightless movement. Together they form a vocabulary that is unmistakably mine.",
  ],
  process: [
    {
      step: "01",
      title: "Concept",
      text: "An emotion or idea is distilled into composition, palette and gesture.",
    },
    {
      step: "02",
      title: "Layering",
      text: "Textures are built in oil and acrylic, then fractured to reveal depth.",
    },
    {
      step: "03",
      title: "Gilding",
      text: "Gold and contrast are introduced to bring luminosity and luxury.",
    },
    {
      step: "04",
      title: "Finish",
      text: "Each work is sealed, signed and prepared for refined interiors.",
    },
  ],
};

export const contact = {
  heading: "Acquire & Commission",
  lead: "Available for private acquisitions and bespoke commissions worldwide.",
  name: "Ram Barkhane",
  address: [
    "E6/95 Shalimar Homes, Flat No. 6",
    "Arera Colony, Bhopal",
    "Madhya Pradesh, India — 462016",
  ],
  email: "rambarkhane9371@gmail.com",
};
