'use client'

import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import useStore from '@/store/useStore';

const AiPromptBox = ({ startAiChat }) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef(null);

  const { aiPrompt, setAiPrompt } = useStore();

  // Define constants for sizing
  const MIN_HEIGHT = 45;
  const MAX_HEIGHT = 100;

  // Auto-resize logic
  const handlePromptChange = (e) => {
    console.log("VALUE:", e.target.value);
    setAiPrompt(e.target.value);
    
    if (!isExpanded) {
      e.target.style.height = 'auto';
      const newHeight = Math.min(e.target.scrollHeight, MAX_HEIGHT);
      e.target.style.height = `${newHeight}px`;
    }
  };

  // Toggle between max height and auto height
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (textareaRef.current) {
      if (!isExpanded) {
        // Expand to max height
        textareaRef.current.style.height = `${MAX_HEIGHT}px`;
      } else {
        // Collapse to content height
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, MAX_HEIGHT);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  // Copy to clipboard logic
  const handleCopy = useCallback(() => {
    if (aiPrompt) {
      navigator.clipboard.writeText(aiPrompt)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
    console.log(aiPrompt)
  }, [aiPrompt]);

  if (!startAiChat) return null;

  return (
    <div className="mt-2 relative">
      <textarea
        ref={textareaRef}
        placeholder="Enter your AI prompt..."
        value={aiPrompt}
        onChange={handlePromptChange}
        rows={1}
        className="w-full text-sm px-3 py-2 pr-20 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400 resize-none transition-all duration-300 ease-in-out overflow-y-auto"
        style={{ 
          minHeight: `${MIN_HEIGHT}px`,
          maxHeight: `${MAX_HEIGHT}px`,
          height: `${MIN_HEIGHT}px`
        }}
      />
      
      {/* Control Icons Container */}
      <div className="absolute right-2 bottom-2 flex gap-1">
        
        {/* Copy Icon */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Copy Prompt"
          disabled={!aiPrompt}
        >
          {isCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
        
        {/* Expand/Minimize Icon */}
        <button
          onClick={toggleExpand}
          className="p-1.5 text-gray-500 hover:text-blue-600 transition-all duration-200 rounded hover:bg-gray-100"
          title={isExpanded ? "Minimize Box" : "Expand Box"}
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AiPromptBox;