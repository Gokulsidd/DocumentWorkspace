"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import useTemplateMappingStore from "@/store/useTemplateMappingStore";
import { 
  ChevronsUpDown, 
  Search, 
  X, 
  FileText, 
  Calendar,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

/**
 * TemplateSelector Component - Internal use only
 */
const TemplateSelector = ({ selectedTemplate, onSelectTemplate, templates }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [searchQuery, templates]);

  const handleSelect = (template) => {
    onSelectTemplate(template);
    setSearchQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectTemplate(null);
    setSearchQuery("");
  };

  return (
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
            "w-full cursor-pointer select-none rounded-xl border px-2 py-1",
            "flex items-center justify-between",
            "hover:border-blue-400 bg-white transition-all",
            selectedTemplate
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 text-gray-500"
          )}
        >
          <div className="flex items-center gap-3 truncate flex-1">
            {selectedTemplate ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="truncate font-medium text-gray-900">
                    {selectedTemplate.name}
                  </span>
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
                className="p-1 hover:bg-blue-100 rounded transition-colors"
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
        className="p-0 w-(--radix-popover-trigger-width) rounded-xl"
      >
        {/* Search input */}
        <div className="flex items-center border-b px-3 bg-gray-50 rounded-t-xl">
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
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  type="button"
                  className={cn(
                    "cursor-pointer w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex gap-3 items-start transition-colors border-b border-gray-100 last:border-none",
                    isSelected && "bg-blue-50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mt-1">
                      {template.name}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Standalone TemplateMapping Component
 * 
 * A plug-and-play component for template-based document metadata mapping.
 * Can be used independently across different projects.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.templates - Array of template objects [{id, name, description}]
 * @param {Array} props.clients - Array of client objects [{id, name, clientId}]
 * @param {Array} props.documentTypes - Array of document type options
 * @param {Array} props.documentSubTypes - Array of document sub type options
 * @param {Array} props.documentSubTypesII - Array of document sub type II options
 * @param {Array} props.tags - Array of tag options (optional)
 * @param {Function} props.onSubmit - Callback when upload/submit is clicked
 * @param {boolean} props.showUploadButton - Whether to show the upload button (default: true)
 * @param {boolean} props.showApplyToAll - Whether to show apply to all checkbox (default: true)
 * @param {string} props.uploadButtonText - Text for upload button (default: "Upload")
 * @param {string} props.className - Additional CSS classes
 */
export default function TemplateMapping({ 
  templates = [],
  clients = [],
  documentTypes = [],
  documentSubTypes = [],
  documentSubTypesII = [],
  tags = [],
  onSubmit = () => {},
  showUploadButton = true,
  showApplyToAll = true,
  uploadButtonText = "Save",
  className = "",
}) {
  const { 
    selectedTemplate,
    setSelectedTemplate,
    clientNameList,
    setClientNameList,
    clientId,
    setClientId,
    documentTitle,
    setDocumentTitle,
    documentDate,
    setDocumentDate,
    documentType,
    setDocumentType,
    documentSubType,
    setDocumentSubType,
    documentSubTypeII,
    setDocumentSubTypeII,
    tags: selectedTags,
    setTags,
    applyToAll,
    setApplyToAll,
    getFieldValues,
    validateFields,
  } = useTemplateMappingStore();

  // Local state for template object
  const [templateObject, setTemplateObject] = useState(null);

  const handleTemplateSelect = (template) => {
    setTemplateObject(template);
    setSelectedTemplate(template);
  };

  const handleClientChange = (value) => {
    setClientNameList(value);
    const client = clients.find(c => c.id === value);
    if (client) {
      setClientId(client.clientId);
    }
  };

  const handleSubmit = () => {
    const validation = validateFields();
    
    if (!validation.isValid) {
      // You can add toast notifications here if needed
      console.error('Validation errors:', validation.errors);
      return;
    }

    const fieldValues = getFieldValues();
    console.log(fieldValues)
    onSubmit(fieldValues);
  };
  
  return (
    <div className={cn(
      "w-full h-full flex flex-col overflow-hidden shadow-sm rounded-2xl p-4 bg-white",
      className
    )}>

      

      {/* Template Selector */}
      <div className="shrink-0 mb-4">
        <Card className="border-gray-200 rounded-2xl shadow-none">
          <CardContent>
            <TemplateSelector 
              selectedTemplate={templateObject}
              onSelectTemplate={handleTemplateSelect}
              templates={templates}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Fields - Only shown when template is selected */}
      {templateObject && (
        <Card className="border-gray-200 bg-gray-50 rounded-2xl shadow-none flex-1 max-h-[400px] min-h-0 flex flex-col overflow-hidden mb-4">
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5 max-h-[400px] overflow-y-auto">
            
            {/* Client Name List - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Client Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={clientNameList} onValueChange={handleClientChange}>
                <SelectTrigger className={cn(
                  "w-full rounded-xl h-11 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                  !clientNameList ? 'border-red-300' : 'border-gray-300'
                )}>
                  <SelectValue placeholder="Select Client Name" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="rounded-lg cursor-pointer">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client ID - Required (Auto-populated) */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Client ID<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={clientId}
                readOnly
                placeholder="Auto-populated from client selection"
                className={cn(
                  "w-full shadow-none bg-gray-100 rounded-xl h-11 transition-colors",
                  !clientId ? 'border-red-300' : 'border-gray-300'
                )}
              />
            </div>

            {/* Document Type - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Document Type<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className={cn(
                  "w-full rounded-xl h-11 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                  !documentType ? 'border-red-300' : 'border-gray-300'
                )}>
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="rounded-lg cursor-pointer">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Sub Type - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Document Sub Type<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={documentSubType} onValueChange={setDocumentSubType}>
                <SelectTrigger className={cn(
                  "w-full rounded-xl h-11 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                  !documentSubType ? 'border-red-300' : 'border-gray-300'
                )}>
                  <SelectValue placeholder="Select Document Sub Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {documentSubTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id} className="rounded-lg cursor-pointer">
                      {subType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Sub Type II - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Document Sub Type <span className="text-xs">II</span><span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={documentSubTypeII} onValueChange={setDocumentSubTypeII}>
                <SelectTrigger className={cn(
                  "w-full rounded-xl h-11 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                  !documentSubTypeII ? 'border-red-300' : 'border-gray-300'
                )}>
                  <SelectValue placeholder="Select Document Sub Type II" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {documentSubTypesII.map((subTypeII) => (
                    <SelectItem key={subTypeII.id} value={subTypeII.id} className="rounded-lg cursor-pointer">
                      {subTypeII.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Title - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Document Title<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                className={cn(
                  "w-full rounded-xl h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                  !documentTitle ? 'border-red-300' : 'border-gray-300'
                )}
              />
            </div>

            {/* Document Date - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Document Date<span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className={cn(
                    "w-full rounded-xl h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors",
                    !documentDate ? 'border-red-300' : 'border-gray-300'
                  )}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tags - Optional */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium">Tags</Label>
                <Select value={selectedTags} onValueChange={setTags}>
                  <SelectTrigger className="w-full rounded-xl border-gray-300 h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                    <SelectValue placeholder="Select Tags" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id} className="rounded-lg cursor-pointer">
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Empty State - Only shown when no template is selected */}
      {!templateObject && (
        <Card className="rounded-2xl shadow-none bg-white flex-1 mb-4">
          <CardContent className="py-8 md:py-16 text-center space-y-4 flex flex-col items-center justify-center h-full">
            <div className="mx-auto inline-flex rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm p-6">
              <FileText className="h-12 w-12 md:h-16 md:w-16 text-gray-600" />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                No Template Selected
              </h3>
              <p className="mt-2 text-xs md:text-sm text-gray-600 max-w-md mx-auto px-4">
                Select a template from the dropdown above to begin adding document metadata.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Actions */}
      {(showUploadButton || showApplyToAll) && (
        <div className="shrink-0 mb-2">
          <Card className="rounded-2xl bg-white shadow-none">
            <CardContent className={`flex flex-col sm:flex-row items-center ${(showUploadButton && showApplyToAll) ? 'justify-between':'justify-end' } gap-3`}>
    
              {/* Left Section */}
              {showApplyToAll && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyToAll}
                      onChange={(e) => setApplyToAll(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      Apply to all
                    </span>
                  </label>
    
                  {/* Info */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                    <span className="hidden sm:inline">Apply this template to all files</span>
                  </div>
                </div>
              )}
    
              {/* Right Section */}
              {showUploadButton && (
                <Button
                  onClick={handleSubmit}
                  className="bg-gray-900 text-white rounded-2xl px-6 hover:bg-gray-800 transition-colors w-full sm:w-auto"
                >
                  {uploadButtonText}
                </Button>
              )}
    
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}
