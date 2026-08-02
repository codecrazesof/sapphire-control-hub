import { useRef, useState, useEffect, useCallback } from "react";
import {
  Sparkles, GraduationCap, Stethoscope, Utensils, Hotel, Home, Car, Plane,
  CreditCard, Factory, Users, Truck, Building, Megaphone, Wallet, Briefcase,
  ShoppingBag, Scale, Shield, Server, Headphones, Building2, ChevronLeft, ChevronRight
} from "lucide-react";

const CATEGORIES = [
  { icon: Sparkles, name: "All", color: "from-cyan-400 to-blue-600", link: "/#all" },
  { icon: GraduationCap, name: "Education", color: "from-blue-500 to-indigo-600", link: "/#Education" },
  { icon: Stethoscope, name: "Healthcare", color: "from-pink-500 to-rose-600", link: "/#Healthcare" },
  { icon: Utensils, name: "Restaurant & POS", color: "from-orange-500 to-red-500", link: "/#Retail%20%26%20POS" },
  { icon: ShoppingBag, name: "Retail & POS", color: "from-amber-500 to-orange-600", link: "/#Retail%20%26%20POS" },
  { icon: Hotel, name: "Hotel & Hospitality", color: "from-fuchsia-500 to-pink-600" , link: "/#Hospitality" },
  { icon: Home, name: "Real Estate", color: "from-amber-500 to-yellow-600", link: "/#Real%20Estate" },
  { icon: Car, name: "Automotive", color: "from-slate-500 to-zinc-700", link: "/#Automotive" },
  { icon: Plane, name: "Travel", color: "from-sky-500 to-cyan-600", link: "/#Travel" },
  { icon: CreditCard, name: "Finance", color: "from-emerald-500 to-teal-600", link: "/#Finance" },
  { icon: Wallet, name: "Accounting", color: "from-lime-500 to-green-600", link: "/#Accounting" },
  { icon: Megaphone, name: "Marketing", color: "from-rose-500 to-red-600", link: "/#Marketing" },
  { icon: Users, name: "Sales & CRM", color: "from-violet-500 to-purple-600", link: "/#Sales%20%26%20CRM" },
  { icon: Briefcase, name: "HR", color: "from-indigo-500 to-blue-600", link: "/#HR" },
  { icon: Truck, name: "Logistics", color: "from-cyan-500 to-teal-600", link: "/#Logistics" },
  { icon: Factory, name: "Manufacturing", color: "from-stone-500 to-neutral-700", link: "/#Manufacturing" },
  { icon: Building, name: "Enterprise", color: "from-blue-600 to-indigo-800", link: "/#Enterprise" },
  { icon: Building2, name: "Government", color: "from-emerald-600 to-green-800", link: "/#Government" },
  { icon: Scale, name: "Legal", color: "from-yellow-600 to-amber-800", link: "/#Legal" },
  { icon: Shield, name: "Security", color: "from-red-600 to-rose-800", link: "/#Security" },
  { icon: Server, name: "IT & SaaS", color: "from-gray-500 to-slate-700", link: "/#IT" },
  { icon: Headphones, name: "Support", color: "from-teal-500 to-cyan-700", link: "/#Support" },
];

// Duplicate the list so the auto-scroll can loop seamlessly.
const LOOP = [...CATEGORIES, ...CATEGORIES];

const CategorySlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0, moved: false });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  // Silky smooth auto-scroll using rAF (sub-pixel movement, no jitter).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 26; // px per second — professional, calm pace
    const halfWidth = () => el.scrollWidth / 2;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && !draggingRef.current) {
        el.scrollLeft += SPEED * dt;
        // Seamless loop: when past the first copy, jump back by its width.
        if (el.scrollLeft >= halfWidth()) {
          el.scrollLeft -= halfWidth();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  // Pointer drag (unified mouse + touch)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    draggingRef.current = true;
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) dragStart.current.moved = true;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    scrollRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <section
      className="relative py-3 bg-gradient-to-b from-[#0a1628] via-[#0d1e36]/70 to-transparent"

      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="max-w-7xl mx-auto px-4 relative">
        {canScrollLeft && (
          <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl border border-white/20">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl border border-white/20">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-10 py-3 select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            scrollBehavior: "auto",
          }}
        >
          {LOOP.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={`${cat.name}-${i}`}
                href={cat.link}
                onClick={(e) => { if (dragStart.current.moved) e.preventDefault(); }}
                draggable={false}
                className={`group relative flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white text-sm font-bold whitespace-nowrap shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] border border-white/25 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]`}
              >
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
                <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/25 backdrop-blur-sm shadow-inner border border-white/30">
                  <Icon className="w-4 h-4 drop-shadow-lg" />
                </span>
                <span className="relative drop-shadow">{cat.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
