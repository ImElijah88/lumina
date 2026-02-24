import React from 'react';
import { Heart, CloudRain, Frown, Zap, Coffee, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

interface MoodSelectorProps {
  onSelectMood: (mood: string) => void;
  disabled?: boolean;
}

const MOODS = [
  { label: "Anxious", query: "Anxiety and worry", Icon: Zap, color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-900/50" },
  { label: "Depressed", query: "Depression and hopelessness", Icon: CloudRain, color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-900/50" },
  { label: "Lonely", query: "Loneliness and isolation", Icon: Frown, color: "text-indigo-400", bg: "bg-indigo-900/20", border: "border-indigo-900/50" },
  { label: "Angry", query: "Anger and forgiveness", Icon: AlertCircle, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-900/50" },
  { label: "Tired", query: "Weariness and rest", Icon: Coffee, color: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-900/50" },
  { label: "Afraid", query: "Fear and courage", Icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-900/50" },
  { label: "Confused", query: "Confusion and guidance", Icon: HelpCircle, color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-900/50" },
  { label: "Grateful", query: "Gratitude and thanksgiving", Icon: Heart, color: "text-pink-400", bg: "bg-pink-900/20", border: "border-pink-900/50" },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood, disabled }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">How are you feeling?</h3>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.label}
            onClick={() => onSelectMood(mood.query)}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              ${mood.bg} ${mood.border} hover:bg-opacity-40 group`}
          >
            <mood.Icon className={`w-3.5 h-3.5 ${mood.color}`} />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};