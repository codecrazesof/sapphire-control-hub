import { Link } from "@tanstack/react-router";
import { Handshake, Store, Share2, Building2, Search, Megaphone, Cpu, Crown } from "lucide-react";

type Opportunity = {
  role: string;
  title: string;
  text: string;
  icon: typeof Handshake;
  color: string;
};

const OPPORTUNITIES: Opportunity[] = [
  {
    role: "reseller",
    title: "RESELLER",
    text: "Students • Housewives • Freelancers — Start as a Reseller, Work From Home & Grow Into a Pro Partner",
    icon: Handshake,
    color: "text-emerald-300",
  },
  {
    role: "franchise",
    title: "FRANCHISE",
    text: "Investors • Entrepreneurs • Business Owners — Become a Franchise Partner, Invest in Technology & Build Your Own Territory",
    icon: Store,
    color: "text-rose-300",
  },
  {
    role: "affiliate",
    title: "AFFILIATE",
    text: "Creators • Marketers • Bloggers — Become an Affiliate Partner, Promote Software & Build a New Revenue Stream",
    icon: Share2,
    color: "text-amber-300",
  },
  {
    role: "vendor",
    title: "VENDOR",
    text: "Software Companies • Developers • Product Owners — Become a Vendor, List Your Software & Reach New Customers",
    icon: Building2,
    color: "text-cyan-300",
  },
  {
    role: "pro-user",
    title: "PRO USER",
    text: "Businesses • Professionals • Teams — Become a Pro User, Unlock More Software & Power Your Business",
    icon: Crown,
    color: "text-indigo-300",
  },
  {
    role: "influencer",
    title: "INFLUENCER",
    text: "Creators • Educators • Tech Influencers — Become an Influencer Partner, Showcase Software & Grow With Our Ecosystem",
    icon: Megaphone,
    color: "text-fuchsia-300",
  },
  {
    role: "seo-expert",
    title: "SEO EXPERT",
    text: "SEO Specialists • Agencies • Growth Experts — Become an SEO Partner, Grow Software Brands & Expand Your Client Opportunities",
    icon: Search,
    color: "text-lime-300",
  },
  {
    role: "technology-partner",
    title: "TECHNOLOGY PARTNER",
    text: "Developers • Agencies • Technology Companies — Become a Technology Partner, Build Solutions & Grow With Our Ecosystem",
    icon: Cpu,
    color: "text-sky-300",
  },
];

const TickerItem = ({ o }: { o: Opportunity }) => {
  const Icon = o.icon;
  return (
    <div className="flex flex-shrink-0 items-center gap-2.5 border-r border-white/10 px-5 py-1.5">
      <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${o.color}`} />
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white whitespace-nowrap">
        {o.title}
      </span>
      <span className="text-[11px] font-medium text-white/70 whitespace-nowrap">{o.text}</span>
      <Link
        to="/apply/$role"
        params={{ role: o.role }}
        className="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-3 py-[3px] text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 transition-colors hover:bg-cyan-400/30 hover:text-white whitespace-nowrap"
      >
        Join Us
      </Link>
    </div>
  );
};

const FestiveBanner = () => (
  <div className="sv-ticker relative w-full overflow-hidden border-y border-white/10 bg-[oklch(0.19_0.05_265)]">
    <div className="sv-ticker-track">
      {[0, 1].map((dup) => (
        <div key={dup} className="flex" aria-hidden={dup === 1}>
          {OPPORTUNITIES.map((o) => (
            <TickerItem key={`${dup}-${o.role}`} o={o} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default FestiveBanner;
