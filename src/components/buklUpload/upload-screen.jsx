"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import UploadArea from "./upload-area";
import TemplateMappingWrapper from "./template-mapping-wrapper";
import { toast } from "sonner";
import useBulkUploadStore from "@/store/useBulkUploadStore";
import { Upload as UploadIcon, Loader2 } from "lucide-react";

export default function UploadScreen() {
  const { 
    files,
    successMessage, 
    error, 
    clearMessages,
    uploadFiles,
    loading,
    validateUpload,
    creatingDocType
  } = useBulkUploadStore();

  // Handle success and error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearMessages();
    }
    if (error) {
      toast.error(error);
      clearMessages();
    }
  }, [successMessage, error, clearMessages]);

  const handleUpload = async () => {
    if (!validateUpload()) {
      return;
    }
    
    const success = await uploadFiles();
    if (success) {
      console.log("Upload successful");
    }
  };

  const hasFiles = files.length > 0;
  

  return (
    <div className="h-full w-full bg-gray-50 p-4">
      <div className="h-full flex flex-col gap-4">
        
        {/* Main Content - Responsive Layout */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full flex gap-4 ${(hasFiles || creatingDocType) ? 'flex-row' : 'flex-col'}`}>
            
            {/* Left Column - Upload Area */}
            <div className={`transition-all duration-300 ${
              (hasFiles || creatingDocType) 
                ? 'w-1/2 h-full' 
                : 'w-full h-full'
            }`}>
              <div className="h-full">
                <UploadArea />
              </div>
            </div>

            {console.log(creatingDocType, 'in screen')}
            {/* Right Column - Template Mapping (only visible when files selected) */}
            {(hasFiles || creatingDocType) && (
              <div className="w-1/2 h-full transition-all duration-300 animate-in fade-in slide-in-from-right-5">
                <TemplateMappingWrapper />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}