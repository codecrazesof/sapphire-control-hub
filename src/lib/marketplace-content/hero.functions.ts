import { supabase } from "@/integrations/supabase/client";

export type HeroSlide = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
  cta_link: string;
  gradient: string;
  icon_name: string;
  accent: string;
  position: number;
  visible: boolean;
  published_at: string | null;
  unpublish_at: string | null;
};

/** Default slides used when no hero_slides content is available. */
export const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    slug: "marketplace",
    kicker: "Software Vala — The Name of Trust",
    title: "147 Software Solutions, One Marketplace",
    subtitle:
      "20 master categories, live demos, full source code, 1 year free support and lifetime access.",
    cta_primary: "Browse Products",
    cta_secondary: "Watch Live Demo",
    cta_link: "/demos/public",
    gradient: "from-[#0b1a30] via-[#12325c] to-[#0a1526]",
    icon_name: "Boxes",
    accent: "text-cyan-300",
    position: 0,
    visible: true,
    published_at: null,
    unpublish_at: null,
  },
  {
    id: "fallback-2",
    slug: "enterprise",
    kicker: "Enterprise Ready",
    title: "POS, HRM, CRM & ERP — Ready to Deploy",
    subtitle: "Production-grade systems delivered in 2 hours with complete source code.",
    cta_primary: "Explore Suites",
    cta_secondary: "Talk to Sales",
    cta_link: "/demos/public",
    gradient: "from-[#1a1030] via-[#3b1f6b] to-[#0e0a1e]",
    icon_name: "Crown",
    accent: "text-violet-300",
    position: 1,
    visible: true,
    published_at: null,
    unpublish_at: null,
  },
  {
    id: "fallback-3",
    slug: "partners",
    kicker: "Partner Program",
    title: "Resell, Franchise & Earn With Us",
    subtitle: "Join 100+ partners selling Software Vala products across India and beyond.",
    cta_primary: "Apply Now",
    cta_secondary: "Learn More",
    cta_link: "/apply",
    gradient: "from-[#0a2019] via-[#12523c] to-[#07130f]",
    icon_name: "Rocket",
    accent: "text-emerald-300",
    position: 2,
    visible: true,
    published_at: null,
    unpublish_at: null,
  },
];

/** Public hero slides for the homepage carousel (falls back to defaults). */
export async function listHeroSlidesPublic(): Promise<HeroSlide[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("hero_slides")
      .select("*")
      .order("position", { ascending: true });
    if (error) return FALLBACK_HERO_SLIDES;
    const rows = (data ?? []) as HeroSlide[];
    return rows.length ? rows : FALLBACK_HERO_SLIDES;
  } catch {
    return FALLBACK_HERO_SLIDES;
  }
}
