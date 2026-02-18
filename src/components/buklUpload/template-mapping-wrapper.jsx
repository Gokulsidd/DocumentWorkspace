"use client";

import TemplateMapping from "@/components/shared/TemplateMapping";
import { CLIENTS, DOCUMENT_SUB_TYPES, DOCUMENT_SUB_TYPES_II, DOCUMENT_TYPES, TAGS, TEMPLATES } from "@/lib/constants";
import useBulkUploadStore from "@/store/useBulkUploadStore";
import { toast } from "sonner";

// Mock templates data

/**
 * Wrapper component for TemplateMapping in bulk upload context
 * Connects the standalone component with bulk upload store
 */
export default function TemplateMappingWrapper() {
  const { uploadFiles, validateUpload } = useBulkUploadStore();

  const handleSubmit = async (fieldValues) => {
    console.log('Template mapping values:', fieldValues);
    
    // Validate upload
    if (!validateUpload()) {
      toast.error('Please select files to upload');
      return;
    }
    
    // Upload files
    const success = await uploadFiles();
    if (success) {
      toast.success('Files uploaded successfully!');
    }
  };

  return (
    <TemplateMapping
      templates={TEMPLATES}
      clients={CLIENTS}
      documentTypes={DOCUMENT_TYPES}
      documentSubTypes={DOCUMENT_SUB_TYPES}
      documentSubTypesII={DOCUMENT_SUB_TYPES_II}
      tags={TAGS}
      onSubmit={handleSubmit}
      showUploadButton={true}
      showApplyToAll={true}
      uploadButtonText="Upload"
    />
  );
}
