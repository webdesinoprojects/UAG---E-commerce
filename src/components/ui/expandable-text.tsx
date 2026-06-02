"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
}

export function ExpandableText({ text, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');

  // If text is short enough, just render it normally
  if (text.length < 300 && paragraphs.length <= 2) {
    return (
      <div className={cn("space-y-4", className)}>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  // If collapsed, show only first paragraph or truncate first paragraph
  const collapsedText = paragraphs[0].length > 200 
    ? paragraphs[0].substring(0, 200) + "..." 
    : paragraphs[0] + "...";

  return (
    <div className={cn("space-y-4 relative", className)}>
      <div className="transition-all duration-300">
        {isExpanded ? (
          paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))
        ) : (
          <p>
            {collapsedText}
            <button 
              onClick={() => setIsExpanded(true)}
              className="ml-2 font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
            >
              more
            </button>
          </p>
        )}
      </div>

      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline mt-2 block"
        >
          Show less
        </button>
      )}
    </div>
  );
}
