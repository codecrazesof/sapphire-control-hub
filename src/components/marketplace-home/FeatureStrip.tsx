import { Boxes, Tags, Cloud, Landmark } from "lucide-react";

const ITEMS = [
  { icon: Boxes, label: "12,000+ Software", color: "text-cyan-300" },
  { icon: Tags, label: "White Label Ready", color: "text-violet-300" },
  { icon: Cloud, label: "SaaS Ready", color: "text-emerald-300" },
  { icon: Landmark, label: "Government Contracts", color: "text-amber-300" },
];

const FeatureStrip = () => (
  <div className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-4 sm:px-6 lg:px-10 py-2">
    <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/80">
      {ITEMS.map(({ icon: Icon, label, color }, i) => (
        <span key={label} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <span className="mr-3 text-white/25">•</span>}
          <Icon className={`h-3.5 w-3.5 ${color} drop-shadow`} />
          <span className="font-semibold">{label}</span>
        </span>
      ))}
    </div>
  </div>
);

export default FeatureStrip;
