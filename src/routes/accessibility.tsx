import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Accessibility, Volume2, AlertOctagon, Type, Contrast, Route as RouteIcon, Zap, Users, MapPin, Smartphone } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/accessibility")({
  head: () => ({ meta: [{ title: "Accessibility Mode — StadiumAI" }, { name: "description", content: "Step-free routes, live captions, and emergency assistance." }] }),
  component: A11yPage,
});

const sampleCaptions = [
  "Welcome to Estadio Azteca. Kickoff in 12 minutes.",
  "Wheelchair-accessible entrance is Gate D, ramp 3.",
  "Section 112 elevator is currently operational.",
  "Medical station is located near Concourse 2, west wing.",
  "Live captions now available in 8 languages.",
];

const announcements = [
  { time: "14:02", text: "Gate D ramp reopened for wheelchair access." },
  { time: "13:55", text: "Live captions now available in 7 languages." },
  { time: "13:40", text: "Companion assistance available at Info Desk B." },
  { time: "13:25", text: "Accessible restroom facilities updated on Level 2." },
];

function A11yPage() {
  const { t } = useT();
  const [settings, setSettings] = useState({
    largeText: true,
    highContrast: true,
    liveCaptions: true,
    screenReader: false,
    hapticFeedback: true,
  });

  const [emergencyShowing, setEmergencyShowing] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const requestAssistance = () => {
    setAssistanceRequested(true);
    setTimeout(() => setAssistanceRequested(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-3 py-1 text-xs font-semibold text-[#00d4ff]">
          <Accessibility className="h-3.5 w-3.5" /> Accessibility Mode Active
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Designed for Everyone.</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">Personalized accessibility features, step-free wayfinding, live captions in multiple languages, and instant support.</p>
      </div>

      {/* Accessibility Settings Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ToggleControl 
          icon={Type} 
          label="Larger Text" 
          checked={settings.largeText}
          onChange={() => toggleSetting('largeText')}
          description="18px minimum"
        />
        <ToggleControl 
          icon={Contrast} 
          label="High Contrast" 
          checked={settings.highContrast}
          onChange={() => toggleSetting('highContrast')}
          description="Enhanced colors"
        />
        <ToggleControl 
          icon={Volume2} 
          label="Live Captions" 
          checked={settings.liveCaptions}
          onChange={() => toggleSetting('liveCaptions')}
          description="Real-time text"
        />
        <ToggleControl 
          icon={Smartphone} 
          label="Screen Reader" 
          checked={settings.screenReader}
          onChange={() => toggleSetting('screenReader')}
          description="NVDA, JAWS"
        />
        <ToggleControl 
          icon={Zap} 
          label="Haptic Feedback" 
          checked={settings.hapticFeedback}
          onChange={() => toggleSetting('hapticFeedback')}
          description="Vibrations"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Wayfinding & Navigation */}
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <RouteIcon className="h-4 w-4 text-[#00d4ff]" /> Step-Free Path Visualization
          </div>
          <div className="aspect-[16/10] rounded-2xl border border-white/8 bg-white/[0.02] p-3 mb-4">
            <StepFreePathSvg />
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            {[
              { k: "Entrance", v: "Gate D", icon: "🚪" },
              { k: "Elevator", v: "E-2 (Op)", icon: "🛗" },
              { k: "Seat", v: "Sec 112", icon: "💺" }
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</div>
                <div className="mt-1 text-lg font-bold text-[#00d4ff]">{s.v}</div>
              </div>
            ))}
          </div>

          <button className="w-full rounded-xl border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-4 py-3 text-sm font-semibold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" /> Request Navigation Help
          </button>
        </div>

        {/* Live Services */}
        <div className="space-y-4">
          {/* Live Captions */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Volume2 className="h-4 w-4 text-[#00d4ff]" /> Live Captions
              <span className="ml-auto pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sampleCaptions.map((c, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }} 
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-sm leading-relaxed"
                >
                  {c}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Users className="h-4 w-4 text-[#00d4ff]" /> Live Announcements
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {announcements.map((a) => (
                <div key={a.time} className="flex gap-3 text-sm border-l-2 border-[#00d4ff]/30 pl-3 py-1">
                  <span className="text-[#00d4ff] font-mono text-xs shrink-0 font-bold">{a.time}</span>
                  <span className="text-muted-foreground">{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency & Support */}
          <motion.button
            onClick={requestAssistance}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full rounded-2xl py-5 text-lg font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${
              assistanceRequested 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/40'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/40 hover:shadow-rose-500/60'
            }`}
          >
            {assistanceRequested ? (
              <>✓ Request Sent</>
            ) : (
              <>
                <AlertOctagon className="h-5 w-5" /> Emergency Assistance
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Accessibility Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard 
          title="Audio Description"
          description="Match events narrated in detail"
          available={true}
        />
        <InfoCard 
          title="Service Animals"
          description="Designated relief areas available"
          available={true}
        />
        <InfoCard 
          title="Companion Passes"
          description="Free admission for caregivers"
          available={true}
        />
      </div>
    </div>
  );
}

// Toggle Control Component with description
function ToggleControl({ 
  icon: Icon, 
  label, 
  checked, 
  onChange,
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  checked?: boolean;
  onChange: () => void;
  description?: string;
}) {
  return (
    <button
      onClick={onChange}
      className={`glass rounded-2xl p-3 flex flex-col items-start justify-between gap-2 transition ${checked ? "glow-ring border-[#00d4ff]/60 bg-[#00d4ff]/10" : "border-white/10 hover:border-white/20"}`}
    >
      <div className="flex items-center gap-2 w-full">
        <Icon className="h-4 w-4 text-[#00d4ff] shrink-0" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {description && (
        <span className="text-[10px] text-muted-foreground">{description}</span>
      )}
      <span className={`relative h-5 w-8 rounded-full self-end ${checked ? "gradient-brand" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "start-3.5" : "start-0.5"}`} />
      </span>
    </button>
  );
}

// Info Card Component
function InfoCard({ title, description, available }: { title: string; description: string; available: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-4 border border-white/8"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-muted/30 text-muted-foreground'}`}>
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Step-Free Path SVG
function StepFreePathSvg() {
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full">
      <defs>
        <linearGradient id="pg" x1="0" x2="1"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
      </defs>
      
      {/* Path background */}
      <rect width="400" height="250" fill="rgba(255,255,255,0.02)" rx="8" />
      
      {/* Main accessible path */}
      <path d="M 40 200 Q 100 200 140 160 Q 180 120 240 120 Q 300 120 360 60" stroke="url(#pg)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M 40 200 Q 100 200 140 160 Q 180 120 240 120 Q 300 120 360 60" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="10 5" />
      
      {/* Start point */}
      <circle cx="40" cy="200" r="12" fill="#00d4ff" />
      <text x="40" y="230" textAnchor="middle" className="fill-white/70" fontSize="11" fontWeight="bold">START</text>
      
      {/* Elevator waypoint */}
      <circle cx="200" cy="140" r="8" fill="#facc15" />
      <rect x="185" y="155" width="30" height="18" fill="rgba(250, 204, 21, 0.2)" rx="3" />
      <text x="200" y="167" textAnchor="middle" className="fill-yellow-300" fontSize="9" fontWeight="bold">LIFT</text>
      
      {/* Restroom waypoint */}
      <circle cx="260" cy="100" r="7" fill="#60a5fa" />
      <text x="260" y="80" textAnchor="middle" className="fill-blue-300" fontSize="8">WC</text>
      
      {/* Destination */}
      <circle cx="360" cy="60" r="12" fill="#7c3aed" className="pulse-dot" />
      <text x="360" y="35" textAnchor="middle" className="fill-purple-300" fontSize="11" fontWeight="bold">SEAT</text>
    </svg>
  );
}