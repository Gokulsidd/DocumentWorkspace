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
import { Badge } from "@/components/ui/badge";
import useBulkUploadStore from "@/store/useBulkUploadStore";
import { 
  ChevronsUpDown, 
  Search, 
  X, 
  FileText, 
  CheckCircle,
  Calendar,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// Mock templates data - replace with actual data from your store
const TEMPLATES = [
  { 
    id: "client-document", 
    name: "Client Document", 
    description: "Standard client documentation template",
    fields: 6 
  },
  { 
    id: "vendor-document", 
    name: "Vendor Document", 
    description: "Vendor-related documents and invoices",
    fields: 6 
  },
  { 
    id: "internal-document", 
    name: "Internal Document", 
    description: "Internal company documents",
    fields: 6 
  },
  { 
    id: "financial-report", 
    name: "Financial Report", 
    description: "Financial statements and reports",
    fields: 6 
  },
  { 
    id: "legal-contract", 
    name: "Legal Contract", 
    description: "Legal agreements and contracts",
    fields: 6 
  },
];

// Mock client data - replace with actual data
const CLIENTS = [
  { id: "client1", name: "Acme Corporation", clientId: "CLI001" },
  { id: "client2", name: "TechStart Inc", clientId: "CLI002" },
  { id: "client3", name: "Global Industries", clientId: "CLI003" },
];

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return TEMPLATES;
    const q = searchQuery.toLowerCase();
    return TEMPLATES.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
            "w-full cursor-pointer select-none rounded-xl border px-4 py-3",
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

export default function TemplateMapping() {
  const { 
    selectedTemplate, 
    setSelectedTemplate,
    tags,
    setTags,
    clientNameList,
    setClientNameList,
    clientId,
    setClientId,
    documentType,
    setDocumentType,
    documentSubType,
    setDocumentSubType,
  } = useBulkUploadStore();

  // Local state for template object
  const [templateObject, setTemplateObject] = useState(null);
  
  // Local state for dynamic fields
  const [folderPath, setFolderPath] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDate, setDocumentDate] = useState("");

  const handleTemplateSelect = (template) => {
    setTemplateObject(template);
    setSelectedTemplate(template?.id || '');
    // Reset fields when template changes
    if (!template) {
      setClientNameList("");
      setClientId("");
      setFolderPath("");
      setDocumentTitle("");
      setDocumentDate("");
      setTags("");
      setDocumentType("");
      setDocumentSubType("");
    }
  };

  const handleClientChange = (value) => {
    setClientNameList(value);
    const client = CLIENTS.find(c => c.id === value);
    if (client) {
      setClientId(client.clientId);
    }
  };

  return (
    <div className="space-y-4 w-full h-[99.9%] flex flex-col overflow-hidden shadow-sm rounded-2xl p-4 bg-white">

      {/* Template Selector */}
      <div className="shrink-0">
        <Card className="border-gray-200 rounded-2xl shadow-none">
          <CardContent>
            <TemplateSelector 
              selectedTemplate={templateObject}
              onSelectTemplate={handleTemplateSelect}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Fields - Only shown when template is selected */}
      {templateObject && (
        <Card className="border-gray-200 bg-gray-50 rounded-2xl shadow-none flex-1 min-h-0 flex flex-col overflow-hidden">
          <CardContent className="p-6 space-y-5 overflow-y-auto">
            
            {/* Client Name List - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Client Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={clientNameList} onValueChange={handleClientChange} className='bg-white'>
                <SelectTrigger className={`w-full rounded-xl h-11 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors ${
                  !clientNameList ? 'border-red-300' : 'border-gray-300'
                }`}>
                  <SelectValue placeholder="Select Client Name" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CLIENTS.map((client) => (
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
                className={`w-full shadow-none bg-white rounded-xl h-11 transition-colors ${
                  !clientId ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>

            {/* Folder Path - Required */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">
                Folder Path<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="Enter folder path (e.g., /documents/2024)"
                className={`w-full rounded-xl h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors ${
                  !folderPath ? 'border-red-300' : 'border-gray-300'
                }`}
              />
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
                className={`w-full rounded-xl h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors ${
                  !documentTitle ? 'border-red-300' : 'border-gray-300'
                }`}
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
                  className={`w-full rounded-xl h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors ${
                    !documentDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Divider */}
            {/* <div className="border-t border-gray-300 pt-5">
              <p className="text-xs font-medium text-gray-600 mb-4">OPTIONAL FIELDS</p>
            </div> */}

            {/* Tags - Optional */}
            {/* <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">Tags</Label>
              <Select value={tags} onValueChange={setTags}>
                <SelectTrigger className="w-full rounded-xl border-gray-300 h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                  <SelectValue placeholder="Type and Select the Tags" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="tag1" className="rounded-lg">Tag 1</SelectItem>
                  <SelectItem value="tag2" className="rounded-lg">Tag 2</SelectItem>
                  <SelectItem value="tag3" className="rounded-lg">Tag 3</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Document Type - Optional */}
            {/* <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-full rounded-xl border-gray-300 h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="invoice" className="rounded-lg">Invoice</SelectItem>
                  <SelectItem value="receipt" className="rounded-lg">Receipt</SelectItem>
                  <SelectItem value="contract" className="rounded-lg">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Document Sub Type - Optional */}
            {/* <div className="space-y-2">
              <Label className="text-gray-700 text-sm font-medium">Document Sub Type</Label>
              <Select value={documentSubType} onValueChange={setDocumentSubType}>
                <SelectTrigger className="w-full rounded-xl border-gray-300 h-11 bg-white hover:border-blue-400 focus:border-blue-400 focus:ring-blue-400 transition-colors">
                  <SelectValue placeholder="Select Document Sub Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="subtype1" className="rounded-lg">Sub Type 1</SelectItem>
                  <SelectItem value="subtype2" className="rounded-lg">Sub Type 2</SelectItem>
                  <SelectItem value="subtype3" className="rounded-lg">Sub Type 3</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Mandatory Note */}
            {/* <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-red-500">*</span> Required fields must be filled
                </p>
              </div>
            </div> */}
          </CardContent>
        </Card>
      )}

      {/* Empty State - Only shown when no template is selected */}
      {!templateObject && (
        <Card className="rounded-2xl shadow-none bg-white flex-1">
          <CardContent className="py-16 text-center space-y-4 flex flex-col items-center justify-center h-full">
            <div className="mx-auto inline-flex rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 shadow-sm  p-6">
              <FileText className="h-16 w-16 text-gray-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                No Template Selected
              </h3>
              <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                Select a template from the dropdown above to begin adding document metadata.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="shrink-0">
        <Card className="rounded-2xl bg-white shadow-none border border-gray-200">
            <CardContent className="flex items-center justify-between px-6 py-4">

            {/* Left Section */}
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 "
                />
                <span className="text-sm font-medium text-gray-800">
                    Apply to all
                </span>
                </label>

                {/* Info */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                <Info className="h-3.5 w-3.5 text-gray-400" />
                <span>Apply this template to all files</span>
                </div>
            </div>

            {/* Right Section */}
            <Button
                className="bg-gray-900 text-white rounded-2xl px-6 hover:bg-gray-800 transition-colors"
            >
                Upload
            </Button>

            </CardContent>
        </Card>
    </div>



    </div>
  );
}