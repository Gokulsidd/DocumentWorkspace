"use client";

import { SquareCode, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemo, useState } from "react";
import useStore from "@/store/useStore";
import TemplateMapping from "../shared/TemplateMapping";
import { CLIENTS, DOCUMENT_SUB_TYPES, DOCUMENT_SUB_TYPES_II, DOCUMENT_TYPES, TAGS, TEMPLATES } from "@/lib/constants";
import useBulkUploadStore from "@/store/useBulkUploadStore";

const MetaDataTab = ({ tab }) => {
  const { selectedDocumentId, toggleItem, tabsList, selectedTabs } = useStore();
  const { uploadFiles, validateUpload } = useBulkUploadStore();

  const iframeUrl = useMemo(() => {
    if (!selectedDocumentId)
      return tab?.url.replace("${selectedDocumentId}", "");
    return tab?.url.replace("${selectedDocumentId}", selectedDocumentId);
  }, [tab?.url, selectedDocumentId]);

  const handleClose = () => {
    const metadataTab = tabsList?.find((item) => item.name === "Metadata");
    if (metadataTab) {
      toggleItem("options", metadataTab);
    }
  };


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
    <Card className={`${selectedTabs.options?.some((t) => t.name === "Metadata") ? "flex" : "hidden"} flex-col text-slate-800 h-full   rounded-2xl shadow-sm transition-all duration-300 w-full`}>
      <CardHeader>
        <CardTitle className="border-b border-slate-300 p-1">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center pl-4 gap-1 h-8">
              <span className="text-muted-foreground">
                <SquareCode size={16} />
              </span>
              <p className="text-muted-foreground text-sm font-medium">
                {tab?.name}
              </p>
            </div>
            <button
              className="text-muted-foreground cursor-pointer hover:bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full"
              onClick={handleClose}
            >
              <X size={16} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full h-full flex-1 p-0">
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
      </CardContent>
    </Card>
  );
};

export default MetaDataTab;
