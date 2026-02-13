// components/metadata/template-selector.jsx
"use client";

import { useState, useMemo } from "react";
import { ChevronsUpDown, Search, X, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useMetadataStore from "@/store/useMetadataStore";

const TemplateSelector = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    templates = [],
    selectedTemplate,
    setSelectedTemplate,
    loading,
  } = useMetadataStore();

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.Name?.toLowerCase().includes(q) ||
        t.Description?.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setSearchQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedTemplate(null);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <Card className="border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="py-4 px-4 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            Loading templates...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 rounded-2xl shadow-none shadow-sm">
      <CardContent >
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                role="combobox"
                aria-expanded={open}
                tabIndex={0}
                onClick={() => setOpen(!open)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setOpen(!open);
                  }
                }}
                className={cn(
                  "w-full cursor-pointer select-none rounded-xl border px-4 py-3",
                  "flex items-center justify-between",
                  "hover:border-blue-300 bg-white transition-all",
                  selectedTemplate
                    ? "border-1 border-blue-500"
                    : "border-gray-200 text-gray-500"
                )}
              >
                <div className="flex items-center gap-3 truncate flex-1 ">
                  {selectedTemplate ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="truncate font-medium text-gray-900">
                          {selectedTemplate.Name}
                        </span>
                        {selectedTemplate.Fields && (
                          <span className="text-xs text-gray-500">
                            {selectedTemplate.Fields.length} fields
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <span>Search and select a template</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedTemplate && (
                    <button
                      onClick={handleClear}
                      type="button"
                      className="p-1 hover:bg-blue-200 rounded transition-colors"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                  <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="p-0 w-[var(--radix-popover-trigger-width)]"
            >
              {/* Search input */}
              <div className="flex items-center border-b px-3 bg-gray-50">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <input
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
                  placeholder="Type to search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      No templates found
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try adjusting your search
                    </p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const isSelected = selectedTemplate?.ID === template.ID;
                    return (
                      <button
                        key={template.ID ?? template.Name}
                        onClick={() => handleSelect(template)}
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex gap-3 items-start transition-colors border-b border-gray-100 last:border-none",
                          isSelected && "bg-blue-50"
                        )}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {template.Name}
                            {isSelected && (
                              <Badge className="text-xs bg-blue-600">
                                Selected
                              </Badge>
                            )}
                          </div>
                          {template.Description && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {template.Description}
                            </div>
                          )}
                          {template.Fields && (
                            <div className="text-xs text-gray-400 mt-1">
                              {template.Fields.length} fields
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
