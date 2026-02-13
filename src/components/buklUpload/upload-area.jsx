"use client";

import { useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Trash2, ChevronDown, X, Check } from "lucide-react";
import useBulkUploadStore from "@/store/useBulkUploadStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFileIcon } from "@/lib/constants";

const documentTypes = [
  { id: "docx", name: "Word Document", extension: ".docx" },
  { id: "csv", name: "Excel Spreadsheet", extension: ".xlsx" },
  { id: "ppt", name: "PowerPoint", extension: ".pptx" },
];


export default function UploadArea() {
  const fileInputRef = useRef(null);

  const {
    files,
    maxFiles,
    isDragging,
    addFiles,
    addNewDocument,
    removeFile,
    setIsDragging,
    creatingDocType,
    setCreatingDocType
  } = useBulkUploadStore();
  
  //New Document dropdown state
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  // NEW INLINE CREATOR STATE
  const [newFileName, setNewFileName] = useState("");

  const hasFiles = files.length > 0;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles, setIsDragging]);

  const handleFileSelect = useCallback((e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    // Reset input value to allow re-selecting the same file after deletion
    if (e.target) {
      e.target.value = '';
    }
  }, [addFiles]);

  const handleCreateClick = (e, docType) => {
    e.preventDefault();
    e.stopPropagation();
    setCreatingDocType(docType);
    setNewFileName("");
  };

  const handleAddNewDocument = () => {
    if (!newFileName.trim()) return;
    const success = addNewDocument(creatingDocType, newFileName);
    if (success) {
      setCreatingDocType(null);
      setNewFileName("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddNewDocument();
    } else if (e.key === 'Escape') {
      setCreatingDocType(null);
      setNewFileName("");
    }
  };

  const handleDropzoneClick = (e) => {
    // Only trigger file select if clicking directly on the dropzone, not on buttons
    if (e.target === e.currentTarget || e.target.closest('.dropzone-content')) {
      handleFileSelect(e);
    }
  };

  return (
    <div className={`space-y-6 bg-white p-4 rounded-2xl w-full ${(hasFiles || creatingDocType)? "h-[99.9%]": "h-full"} shadow-sm`}>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Upload Dropzone */}
      <Card className={`w-full ${(hasFiles || creatingDocType )? "": "h-full"} bg-white shadow-none border-0 rounded-3xl`}>
        <div
          className={`w-full bg-white flex flex-col justify-center items-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer relative min-h-[300px]
            ${
              isDragging
                ? "bg-blue-50 border-blue-400 shadow-inner"
                : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50",
              hasFiles
                ? ""
                : "h-full"
            }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropzoneClick}
        >
          <div className="dropzone-content flex flex-col items-center justify-center gap-5 p-10 text-center">

            <div
              className={`p-4 rounded-full transition-all duration-300 pointer-events-none
                ${
                  isDragging
                    ? "bg-blue-100 text-blue-600 scale-110"
                    : "bg-gray-100 text-gray-500"
                }`}
            >
              <Upload size={32} />
            </div>

            <div className="space-y-2 pointer-events-none">
              <p className="text-gray-900 font-semibold text-xl tracking-tight">
                Upload your documents
              </p>
              <p className="text-sm text-gray-500">
                {isDragging
                  ? "Drop your files here"
                  : "Drag & drop files here, or click to browse"}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleFileSelect}
                className="bg-gray-900 text-white rounded-2xl px-6 hover:bg-gray-800"
                type="button"
              >
                Upload File
              </Button>

              <DropdownMenu
                open={isDocMenuOpen}
                onOpenChange={setIsDocMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-2xl px-6 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 gap-2"
                    type="button"
                  >
                    New Document
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 rounded-2xl shadow-lg border border-gray-200 bg-white"
                >
                  {documentTypes.map((docType) => (
                    <DropdownMenuItem
                      key={docType.id}
                      onClick={(e) => {
                        handleCreateClick(e, docType);
                        setIsDocMenuOpen(false); // 👈 CLOSE MENU HERE
                      }}
                      className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {docType.id === "word" && "📄"}
                          {docType.id === "excel" && "📊"}
                          {docType.id === "powerpoint" && "📽️"}
                          {getFileIcon(docType.id)}
                        </div>
                        <span>{docType.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>

          {isDragging && (
            <div className="absolute inset-0 bg-blue-400 opacity-5 animate-pulse rounded-3xl pointer-events-none" />
          )}
        </div>
      </Card>

      {/* Files + Inline Creator */}
      {(hasFiles || creatingDocType) && (
        <div className="space-y-3 flex flex-col items-start h-full">

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Selected Files
            </h3>
            <span className="text-xs text-gray-500">
              {files.length} / {maxFiles}
            </span>
          </div>

          <Card className="rounded-2xl w-full shadow-none border border-gray-200 bg-gray-50 p-3 space-y-3 max-h-75  overflow-y-auto">

            {/* Inline New Document Creator */}
            {creatingDocType && (
              <div className="bg-white rounded-xl border-2 border-blue-400 shadow-sm p-3">
                <div className="flex items-center gap-3">
                  <div>
                    {getFileIcon(creatingDocType.id)}
                  </div>

                  <Input
                    placeholder={`Enter file name (${creatingDocType.extension})`}
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="h-9 text-sm border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                    autoFocus
                  />

                  <Button
                    size="sm"
                    className="bg-blue-600 text-white rounded-lg px-3 hover:bg-blue-700 flex-shrink-0"
                    onClick={handleAddNewDocument}
                    disabled={!newFileName.trim()}
                    type="button"
                  >
                    <Check size={14} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    onClick={() => {
                      setCreatingDocType(null);
                      setNewFileName("");
                    }}
                    type="button"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Files */}
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center px-3 py-1.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 truncate flex-1 min-w-0">
                    <div>
                      {console.log(file)}
                      <span className="text-lg">{getFileIcon(file.docType)}</span>
                    </div>
                    <span className="truncate" title={file.name}>{file.name}</span>
                    {file.isNew && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-red-50 hover:text-red-500 p-1.5 h-auto rounded-lg transition-colors flex-shrink-0"
                    onClick={() => removeFile(file.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}