import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  copyText?: string;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  icon, 
  children, 
  className = '',
  accentColor = 'border-gray-800',
  copyText
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className={`bg-[#0A0C10] border border-gray-800 rounded-xl p-6 ${className} hover:border-gray-700 transition-colors duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-400">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        </div>
        
        {copyText && (
          <button
            onClick={handleCopy}
            className="p-1.5 -mr-2 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-gray-800/50 transition-all"
            title="Copy content"
            aria-label="Copy content to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="text-gray-400 leading-relaxed text-sm md:text-base">
        {children}
      </div>
    </div>
  );
};