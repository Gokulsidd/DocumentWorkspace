"use client";

import {
  Upload,
  Trash2,
  X,
  MessageSquare,
  FolderOpen,
  ChevronDown,
  LayoutTemplate,
  Folder,
  Search,
  FileText,
  InfoIcon,
  Info,
  Loader2,
  AlertCircle,
  Clipboard,
  RefreshCcw,
  CalendarIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { errorToastObj, formatDate, formatDateForUI, getFileIcon, successToastObj } from "@/lib/constants";
import useStore from "@/store/useStore";
import { toast } from "sonner";
import Loader from "../loader";
import useFrontOfficeStore from "@/store/useFrontOfficeStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import CollectionsDropdown from "../collections/collections-dropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import NotUploadableNotice from "../not-uploadable";
import AiPromptBox from "../ai-prompt-box";
import { getDocumentFileById } from "@/services/api";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
// import { cn } from "@/lib/utils";

const ClientFolderUploadTab = ({ tab }) => {
  // ==================== UI STATE ====================
  const [isDragging, setIsDragging] = useState(false);
  const [startAiChat, setStartAiChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [showInfoNote, setShowInfoNote] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [hoverPaste, setHoverPaste] = useState(false);
  const [fileDates, setFileDates] = useState({});
  const [openCalendars, setOpenCalendars] = useState({});

  // ==================== REFS ====================
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const pasteProcessingRef = useRef(false);

  // ==================== STORE STATE ====================
  const {
    aiPrompt,
    setAiPrompt,
    isUploadable,
    uploadedFiles,
    setUploadedFiles,
    selectedTabs,
    setSelectedTabs,
    activeTab,
    previousActiveTab,
    setActiveTab,
    setIsSourcesDialogOpen,
    setIsCollapsed,
    uploadInProgressFilesFromDnD,
    selectedClientFolder,
    saveUploadedFilesToCollection,
    setSelectedDocumentId,
    setSelectedDocument,
    documentsList,
    selectedDocumentId,
    setDocumentsList,
    setClientMetaTabClosed,
    selectedFolder,
    folderTemplatesList,
    setSelectedFolderTemplates,
    selectedFolderTemplates,
    fileDocumentTitles,
    setFileDocumentTitle,
    resetFileDocumentTitles,
    setFileDocumentTitles,
    selectedCollection,
    setSelectedCollection,
    setCollectionTags,
    removeSelectedDoc,
    newCollectionName,
    setNewCollectionName,
    showNewCollectionInput,
    setShowNewCollectionInput,
    isLoadingCollections,
    collections,
    clearMultiSelectedDocs,
    user,
    isPasteButtonEnabled,
    pasteTrigger,
    folderTreePath,
    multiSelectedDocs,
    configs,
    PastedDocumentId,
    selectedClient,
    SelectedFileNameAndId,
    getDocumentFileNameByID,
    selectedFolderNode,
    setFolderTreePath,
    setPasteTrigger,
    defaultUploadTab,
    setIsPasteButtonEnabled
  } = useStore();

  const { isFrontOffice } = useFrontOfficeStore();

  // ==================== CONSTANTS ====================
  const MAX_FILES = configs?.MAX_FILES_SIZE || 20;

  // ==================== COMPUTED VALUES ====================

  // Get document title requirement from selected template
  const getDocumentTitleRequirement = () => {
    if (!selectedFolderTemplates || !Array.isArray(folderTemplatesList)) {
      return null;
    }

    const templateObj = folderTemplatesList.find(
      (t) => (typeof t === "object" ? t.name : t) === selectedFolderTemplates
    );

    return templateObj?.documentTitle || null;
  };

  const documentTitleRequirement = getDocumentTitleRequirement();

  // Check if document title input should be shown
  const shouldShowDocumentTitleInput =
    documentTitleRequirement !== configs?.DOCUMENT_TITLE_NAME &&
    selectedFolderTemplates;

  // Filtered templates with search
  const getFilteredTemplates = () => {
    if (!Array.isArray(folderTemplatesList)) return [];
    if (!templateSearch.trim()) return folderTemplatesList;

    const searchLower = templateSearch.toLowerCase();
    return folderTemplatesList.filter((template) => {
      const templateName = typeof template === "object" ? template.name : template;
      return templateName.toLowerCase().includes(searchLower);
    });
  };

  const filteredTemplates = getFilteredTemplates();

  // Display folder name
  const displayFolderName = selectedClient?.url || " ";

  // Get dynamic iframe URL
  const getDocumentSearchUrl = () => {
    const baseUrl = configs?.DOCUMENT_SEARCH_URL;
    if (!baseUrl) {
      console.error('DOCUMENT_SEARCH_URL not found in configs');
      return '';
    }

    const selectedUrl = selectedFolderNode?.url || " ";
    return `${baseUrl}${displayFolderName}${selectedUrl}`;
  };

  // Collection names for validation
  const collectionNames = collections?.map((item) => item.workspaceName) || [];

  // ==================== FILE MANAGEMENT ====================

  /**
   * Filters out duplicate files and shows toast
   */
  const filterDuplicateFiles = (newFiles, existingFiles) => {
    const existingFileNames = new Set(existingFiles.map(file => file.name));
    const uniqueFiles = [];
    const duplicates = [];

    newFiles.forEach(file => {
      if (existingFileNames.has(file.name)) {
        duplicates.push(file.name);
      } else {
        uniqueFiles.push(file);
        existingFileNames.add(file.name);
      }
    });

    if (duplicates.length > 0) {
      const message = duplicates.length === 1
        ? `File "${duplicates[0]}" is already uploaded!`
        : `${duplicates.length} file(s) already uploaded!`;
      toast.error(message, errorToastObj);
    }

    return uniqueFiles;
  };

  /**
   * Adds files to upload list after filtering duplicates
   */
  const addFiles = (newFiles, skipDuplicateCheck = false) => {
    if (!newFiles || newFiles.length === 0) return;

    let uniqueFiles;

    if (skipDuplicateCheck) {
      // Silently filter duplicates for pasted files
      const existingFileNames = new Set(uploadedFiles.map(file => file.name));
      uniqueFiles = newFiles.filter(file => !existingFileNames.has(file.name));
    } else {
      // Show toast for user-selected files
      uniqueFiles = filterDuplicateFiles(newFiles, uploadedFiles);
    }

    if (uniqueFiles.length === 0) return;

    const totalFiles = uploadedFiles.length + uniqueFiles.length;

    if (totalFiles > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed!`, errorToastObj);
      return;
    }



    setUploadedFiles([...uploadedFiles, ...uniqueFiles]);
  };

  /**
   * Remove individual file with cleanup
   */
  const handleDeleteFile = (fileToDelete) => {
    const updatedFiles = uploadedFiles.filter(
      (f) => f?.name !== fileToDelete.name
    );
    setUploadedFiles(updatedFiles);

    // Clean up document titles
    const newTitles = { ...fileDocumentTitles };
    delete newTitles[fileToDelete.name];
    setFileDocumentTitles(newTitles);

    // Clean up document dates
    const newDates = { ...fileDates };
    delete newDates[fileToDelete.name];
    setFileDates(newDates);

    // Remove from multiSelectedDocs
    const doc = multiSelectedDocs.find((d) => d.name === fileToDelete.name);
    if (doc) {
      removeSelectedDoc(doc.id);
    }

    // Remove Client Metadata tab if no files left
    if (updatedFiles.length === 0) {
      const filteredTabs = selectedTabs.options?.filter(
        (tab) => tab.name !== "Client Metadata"
      );
      setSelectedTabs({ options: filteredTabs });
      setClientMetaTabClosed(true);
    }
  };

  /**
   * Clear all files and reset state
   */
  const handleClearClick = () => {
    setSelectedCollection(null);
    setUploadedFiles([]);
    setFileDocumentTitles({});
    setFileDates({});
    clearMultiSelectedDocs();
    setSelectedFolderTemplates(null);

    const filteredTabs = selectedTabs.options?.filter(
      (tab) => tab.name !== "Client Metadata"
    );
    setSelectedTabs({ options: filteredTabs });
    setClientMetaTabClosed(true);
  };

  // ==================== DRAG & DROP HANDLERS ====================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleFileChange = (e) => {
    setIsCollapsed(false);
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);

    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ==================== PASTE FUNCTIONALITY ====================

  /**
   * Optimized paste handler - processes files from clipboard
   */
  const processPastedFiles = async () => {
    // Prevent duplicate processing
    if (pasteProcessingRef.current) {
      console.log("⚠️ Paste already processing, skipping...");
      return;
    }

    if (!folderTreePath || !pasteTrigger || !isUploadable) {
      console.log("⚠️ Paste conditions not met:", { folderTreePath, pasteTrigger, isUploadable });
      return;
    }

    pasteProcessingRef.current = true;

    try {
      const saved = localStorage.getItem("CopyData");

      if (!saved) {
        console.log("⚠️ No CopyData found");
        toast.info("No files found in clipboard", errorToastObj);
        pasteProcessingRef.current = false;
        return;
      }

      const parsed = JSON.parse(saved);
      const idsFromLocal = parsed.ID || [];
      const uniqueIds = [...new Set(idsFromLocal)];

      console.log("📋 Processing paste with IDs:", uniqueIds);

      // Build list of files to fetch
      const existingIds = new Set(SelectedFileNameAndId.map(x => x.id));
      const idsToFetch = uniqueIds.filter(id => !existingIds.has(id));

      if (idsToFetch.length === 0) {
        console.log("✅ All files already in list");
        const modifiedFiles = SelectedFileNameAndId
          .filter(doc => uniqueIds.includes(doc.id))
          .map((doc) => ({
            name: doc.fileName,
            id: doc.id,
            size: 0,
            type: "application/octet-stream",
            lastModified: Date.now(),
          }));
        addFiles(modifiedFiles, true);
        pasteProcessingRef.current = false;
        return;
      }

      // Fetch all new files in parallel
      console.log("🔄 Fetching", idsToFetch.length, "new files...");
      const fetchPromises = idsToFetch.map(id => getDocumentFileNameByID(id));

      const results = await Promise.allSettled(fetchPromises);

      // ✅ Separate successful and failed results
      const successfulResults = [];
      const failedResults = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value;

          // Check if the response status is Success
          if (response?.Status === "Success" && response?.Document) {
            successfulResults.push({
              id: response.Document.ID,
              fileName: response.Document.FileName,
            });
          } else {
            // Response was fulfilled but status is Error
            failedResults.push({
              id: idsToFetch[index],
              error: response?.ErrorMessage || "Unknown error",
            });
          }
        } else {
          // Promise was rejected
          failedResults.push({
            id: idsToFetch[index],
            error: result.reason?.message || "Failed to fetch",
          });
        }
      });

      // ❌ Show error toast if any files failed
      if (failedResults.length > 0) {
        console.error("❌ Failed to fetch files:", failedResults);

        if (failedResults.length === idsToFetch.length) {
          // All failed
          toast.error("Error pasting files. All files failed to load.", errorToastObj);
        } else {
          // Some failed
          toast.warning(
            `Error pasting ${failedResults.length} of ${idsToFetch.length} files`,
            errorToastObj
          );
        }
      }

      // ✅ Continue with successful files if any
      if (successfulResults.length === 0) {
        console.log("⚠️ No files successfully fetched");
        pasteProcessingRef.current = false;
        return;
      }

      // Combine with existing
      const allFileData = [...SelectedFileNameAndId, ...successfulResults];

      // Convert to file objects (only successful ones)
      const modifiedFiles = uniqueIds
        .map(id => {
          const fileData = allFileData.find(x => x.id == id);
          return fileData ? {
            name: fileData.fileName,
            id: fileData.id,
            size: 0,
            type: "application/octet-stream",
            lastModified: Date.now(),
          } : null;
        })
        .filter(Boolean);

      await addFiles(modifiedFiles, true);

      // ✅ Success toast only if we have files
      if (uploadedFiles?.length > 0 || modifiedFiles.length > 0) {
        if (failedResults.length > 0) {
          toast.success(
            `Pasted ${successfulResults.length} files successfully`,
            successToastObj
          );
        } else {
          toast.success("Pasted successfully", successToastObj);
        }
      }

    } catch (error) {
      console.error("❌ Paste processing error:", error);
      toast.error("Error pasting files. Please try again.", errorToastObj);
    } finally {
      pasteProcessingRef.current = false;
    }
  };

  /**
   * Handle paste button click
   */
  const handlePasteFolderPath = async () => {
    try {
      setLoading(true);

      const saved = localStorage.getItem("CopyData");

      if (!saved) {
        toast.error("No files have been copied", errorToastObj);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(saved);
      const ids = parsed?.ID || [];

      if (ids.length === 0) {
        toast.error("No valid files to paste", errorToastObj);
        setLoading(false);
        return;
      }

      if (!isUploadable) {
        toast.error("Paste is not allowed in this folder", errorToastObj);
        setLoading(false);
        return;
      }

      // Trigger the paste processing
      setPasteTrigger(Date.now());

      // 👉 if your actual paste logic is async elsewhere (e.g. useEffect on pasteTrigger),
      // move `setLoading(false)` to that place when paste is done.

    } catch {
      console.error("Paste error:", err);
      toast.error(err?.message || "Paste failed", errorToastObj);
    } finally {
      // ensures loader stops even if we returned early
      setLoading(false);
    }
  };

  // ==================== UPLOAD FUNCTIONALITY ====================

  /**
   * Handle file upload with validation and collection saving
   * FIXED: Properly clears uploaded files and switches to documents tab
   */
  const handleUploadFile = async () => {
    if (isFrontOffice) return;

    try {
      setLoading(true);

      // Validate new collection name
      if (showNewCollectionInput && !newCollectionName?.trim()) {
        toast.error("Please enter a new collection name", errorToastObj);
        setLoading(false);
        return;
      }

      if (showNewCollectionInput && collectionNames.includes(newCollectionName)) {
        toast.error("Collection name already taken", errorToastObj);
        setLoading(false);
        return;
      }

      //validate selected template
      if (folderTemplatesList?.length > 1 && !selectedFolderTemplates) {
        toast.error("Please select a template", errorToastObj);
        setLoading(false);
        return;
      }

      // Validate files
      if (uploadedFiles.length === 0) {
        toast.error("Please select files to upload", errorToastObj);
        setLoading(false);
        return;
      }

      // Validate document titles if required
      if (shouldShowDocumentTitleInput) {
        const missingTitles = uploadedFiles.filter(
          (file) => !fileDocumentTitles[file.name]?.trim()
        );

        if (missingTitles.length > 0) {
          toast.error("Please enter document titles for all files", errorToastObj);
          setLoading(false);
          return;
        }
      }

      // Upload files
      const uploadResponse = await uploadInProgressFilesFromDnD(
        uploadedFiles,
        selectedClientFolder,
        startAiChat,
        shouldShowDocumentTitleInput ? fileDocumentTitles : null,
        shouldShowDocumentTitleInput ? fileDates : null
      );

      const ids = uploadResponse?.data?.ResultID || [];
      const documentList = uploadResponse?.data?.DocumentList || [];
      const uploadStatus = uploadResponse?.data?.Status;

      if (uploadStatus === "Error") {
        toast.error("Upload failed. Please try again.", errorToastObj);
        setLoading(false);
        return;
      }

      // Save to collection if needed
      if ((selectedCollection || showNewCollectionInput) && ids.length > 0) {
        const workspaceName = showNewCollectionInput
          ? newCollectionName
          : selectedCollection?.workspaceName;
        const workspaceId = selectedCollection?.id;
        const userId = user?.User.ID;

        await saveUploadedFilesToCollection(
          ids,
          workspaceId,
          workspaceName,
          showNewCollectionInput,
          userId,
          selectedCollection
        );
      }

      // Handle success
      if (uploadStatus === "Success") {
        const docId = documentList[0]?.ID;
        const selectedDocument = documentList[0];

        if (docId) {
          setSelectedDocumentId(docId);
          setSelectedDocument(selectedDocument);

          // FIXED: Switch to documents tab after upload
          setActiveTab("documents");

          // Add Client Metadata tab if not exists
          const hasClientMetadata = selectedTabs.options?.some(
            (t) => t.name === "Client Metadata"
          );

          if (!hasClientMetadata) {
            const clientMetaTab = {
              id: Date.now(),
              name: "Client Metadata",
              seq: selectedTabs.options.length + 1,
              url: `https://10.115.14.14/DFXDMSLite/dfxweb/Email/Mailproperty?readonlyflag=1&newfile=ikfvcn.dat&showallmenu=true&showpreview=true&documentai=true&application=dfxsearch&activetab=documentai&repository=stonehage&id=${docId}`,
            };

            setSelectedTabs({
              options: [...selectedTabs.options, clientMetaTab],
            });
          }
        }

        toast.success("Uploaded Successfully", successToastObj);
        setIsCollapsed(false);

        // FIXED: Clear localStorage and reset state properly
        localStorage.removeItem("CopyData");
        setIsPasteButtonEnabled(false);
        // Clear uploaded files
        setUploadedFiles([]);

        // Clear multiSelectedDocs
        clearMultiSelectedDocs();

        // Only reset template if multiple templates available
        if (folderTemplatesList?.length !== 1) {
          setSelectedFolderTemplates(null);
        }

        // FIXED: Clear document titles
        setFileDocumentTitles({});
        setFileDates({});

        // Reset collection selection
        setSelectedCollection(null);
        setShowNewCollectionInput(false);
        setNewCollectionName("");
      }

      setIsSourcesDialogOpen(false);

    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Upload failed", errorToastObj);
    } finally {
      setLoading(false);
    }

    console.log(fileDates, 'fileDates')
  };

  // ==================== OTHER HANDLERS ====================

  const handleDateSelect = (filename, date) => {
    setFileDates(prev => ({
      ...prev,
      [filename]: date
    }));
    setOpenCalendars(prev => ({
      ...prev,
      [filename]: false
    }));
  };

  const toggleCalendar = (filename, isOpen) => {
    setOpenCalendars(prev => ({
      ...prev,
      [filename]: isOpen
    }));
  };

  const handleDocumentTitleChange = (fileName, value) => {
    setFileDocumentTitle(fileName, value);
  };

  const handleSelectDocument = (item) => {
    setSelectedDocumentId(item.ID);
  };

  const handleUploadTabClick = () => {
    const updatedTabs = selectedTabs.options.filter(
      (t) => t.name !== "Client Metadata"
    );
    setSelectedTabs({ options: updatedTabs });
  };

  const handleDocumentsTabClick = () => {
    const tabs = selectedTabs.options || [];
    const hasClientMetadata = tabs.some((t) => t.name === "Client Metadata");

    if (!hasClientMetadata && selectedDocumentId) {
      const updatedTabs = [
        ...tabs,
        {
          id: Date.now(),
          name: "Client Metadata",
          seq: selectedTabs.options.length + 1,
          url: `https://10.115.14.14/DFXDMSLite/dfxweb/Email/Mailproperty?readonlyflag=1&newfile=ikfvcn.dat&showallmenu=true&showpreview=true&documentai=true&application=dfxsearch&activetab=documentai&repository=stonehage&id=${selectedDocumentId}`,
        },
      ];
      setSelectedTabs({ options: updatedTabs });
    }
  };

  // ==================== EFFECTS ====================

  // Auto-select single template
  useEffect(() => {
    if (Array.isArray(folderTemplatesList) && folderTemplatesList.length === 1) {
      const templateName = typeof folderTemplatesList[0] === "object"
        ? folderTemplatesList[0].name
        : folderTemplatesList[0];
      setSelectedFolderTemplates(templateName);
    }
  }, [folderTemplatesList, setSelectedFolderTemplates]);

  // Reset iframe states when folder changes
  useEffect(() => {
    if (previousActiveTab === 'documentSearch') {
      setIframeLoading(true);
      setIframeError(false);
    }
  }, [selectedFolder?.id, previousActiveTab]);

  // Reset template search when dropdown closes
  useEffect(() => {
    if (!isTemplateDropdownOpen) {
      setTemplateSearch("");
    }
  }, [isTemplateDropdownOpen]);

  // Initialize document titles and dates for new files
  useEffect(() => {
    const newTitles = { ...fileDocumentTitles };
    const newDates = { ...fileDates };
    let hasChanges = false;

    uploadedFiles.forEach((file) => {
      if (!(file.name in newTitles)) {
        newTitles[file.name] = '';
        hasChanges = true;
      }

      if (!(file.name in newDates)) {
        newDates[file.name] = new Date(); // ✅ local Date, NO Z
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFileDocumentTitles(newTitles);
      setFileDates(newDates);
    }
  }, [uploadedFiles]);


  // Process pasted files when paste trigger changes
  useEffect(() => {
    if (pasteTrigger) {
      processPastedFiles();
    }
  }, [pasteTrigger]);

  return (
    <Card className="w-full h-[calc(100vh-4rem)] md:h-full rounded-2xl shadow-md border bg-white flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <CardHeader className="flex-shrink-0 p-0 border-b">
        <div className="flex justify-between items-center">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full rounded-none bg-transparent p-2 h-12">
              <TabsTrigger
                value="upload"
                onClick={handleUploadTabClick}
                disabled={!isUploadable}
                className="rounded-none data-[state=active]:rounded-lg data-[state=active]:shadow-none shadow-none hover:rounded-lg h-full px-6 text-muted-foreground data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
              >
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                onClick={handleDocumentsTabClick}
                className="rounded-none data-[state=active]:rounded-lg data-[state=active]:shadow-none shadow-none hover:rounded-lg h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
                disabled={!isUploadable || !documentsList || documentsList.length === 0}
              >
                Uploaded Files
              </TabsTrigger>
              <TabsTrigger
                value="documentSearch"
                onClick={handleUploadTabClick}
                disabled={false}
                className="rounded-none data-[state=active]:rounded-lg data-[state=active]:shadow-none shadow-none hover:rounded-lg h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
              >
                Show Files
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      {/* Scrollable Content Area */}
      <CardContent className="flex-1 p-0 overflow-auto">
        <Tabs value={activeTab} className="h-full flex flex-col">
          {/* Upload Tab */}
          <TabsContent
            value="upload"
            className={`flex-1 h-full m-0 ${loading ? "pointer-events-none opacity-60" : ""}`}
          >
            {console.log(!isUploadable, !selectedFolderTemplates?.length, "testing condition")}
            {(!isUploadable || folderTemplatesList?.length === 0) && activeTab === "upload" ? (
              <div className="h-full flex items-center justify-center">
                <NotUploadableNotice />
              </div>
            ) : (
              <div className="h-full flex gap-4 p-4">
                {/* Left Upload Area */}
                <div className="w-full h-full flex flex-col relative">
                  {/* Paste Files Button - Top Right Corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      className="text-sm font-medium px-4 py-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-300 shadow-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        const saved = localStorage.getItem("CopyData");
                        if (saved) {
                          try {
                            const parsed = JSON.parse(saved);
                            if (parsed?.ID?.length > 0) {
                              handlePasteFolderPath();
                            } else {
                              toast.info("No files found in clipboard", errorToastObj);
                            }
                          } catch {
                            toast.error("Invalid clipboard data", errorToastObj);
                          }
                        } else {
                          toast.info("No files found in clipboard", errorToastObj);
                        }
                      }}
                    >
                      {pasteProcessingRef.current ? (
                        <span className="flex items-center gap-2">
                          <Loader width={4} height={4} />
                          Pasting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-gray-500" />
                          Paste Files
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Main Drop Area */}
                  <div
                    className={`w-full h-full flex flex-col justify-center items-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
                      ${isDragging
                        ? "bg-blue-50 border-blue-400 shadow-inner"
                        : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                      aria-label="File upload input"
                    />

                    {/* Upload Icon */}
                    <div
                      className={`p-6 rounded-full transition-all duration-300 ${isDragging
                        ? "bg-blue-100 text-blue-600 scale-110"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <Upload size={48} strokeWidth={1.5} />
                    </div>

                    {/* Current Folder Display */}
                    <div className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                      <Folder className="w-5 h-5 text-gray-600" />
                      <p className="text-gray-800 font-semibold text-base">
                        {selectedFolderNode?.folderName}
                      </p>
                    </div>

                    {/* Upload Instructions */}
                    <div className="mt-4 text-center">
                      <p className="text-lg text-gray-700 font-medium">
                        {isDragging ? "Drop your files here" : "Drag & drop files here"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1.5">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Configuration & Files */}
                {(uploadedFiles?.length > 0) && (
                  <div className="w-1/2 min-w-1/2 h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col justify-start items-start gap-6">
                      <div className="flex flex-col gap-2 w-full">
                        <CollectionsDropdown
                          collections={collections}
                          selectedCollection={selectedCollection}
                          setSelectedCollection={setSelectedCollection}
                          setCollectionTags={setCollectionTags}
                          newCollectionName={newCollectionName}
                          setNewCollectionName={setNewCollectionName}
                          showNewCollectionInput={showNewCollectionInput}
                          setShowNewCollectionInput={setShowNewCollectionInput}
                          isLoadingCollections={isLoadingCollections}
                          className="w-full"
                        />

                        {/* Templates Section with Search */}
                        {folderTemplatesList?.length > 1 && (
                          <Card className="rounded-2xl w-full shadow-none border-0 bg-gray-100">
                            <CardContent className="p-3 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 w-full">
                                <div className="items-center gap-3 min-w-0 flex-1 hidden xl:flex">
                                  <div className="p-2 bg-white rounded-lg flex-shrink-0">
                                    <LayoutTemplate
                                      className={`h-4 w-4 ${selectedFolderTemplates
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                        }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                      Template
                                      <span className="text-red-500 ml-1">*</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      Choose document template
                                    </p>
                                  </div>
                                </div>

                                <DropdownMenu
                                  open={isTemplateDropdownOpen}
                                  onOpenChange={setIsTemplateDropdownOpen}
                                >
                                  <div className="relative w-full xl:w-[220px] flex items-center px-3 py-2 bg-white rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 min-w-[160px]">
                                    <DropdownMenuTrigger
                                      asChild
                                      className="w-full"
                                    >
                                      <div className="flex items-center justify-between gap-3 flex-1 cursor-pointer">
                                        <span className="flex-1 text-left truncate">
                                          {selectedFolderTemplates ||
                                            "Select Template"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                                      </div>
                                    </DropdownMenuTrigger>

                                    {selectedFolderTemplates && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedFolderTemplates(null);
                                        }}
                                        className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                                      >
                                        <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                      </button>
                                    )}
                                  </div>

                                  <DropdownMenuContent
                                    align="end"
                                    className="w-[400px] sm:w-[350px] mt-2 -mr-2.5 rounded-2xl shadow-lg border border-gray-200 bg-white p-0"
                                  >
                                    <div className="p-2 border-b sticky z-50 top-0 bg-white rounded-t-2xl">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search templates..."
                                          value={templateSearch}
                                          onChange={(e) =>
                                            setTemplateSearch(e.target.value)
                                          }
                                          className="pl-9 h-9 rounded-lg border-gray-200 focus:border-blue-400"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto max-h-[300px]">
                                      {filteredTemplates.length > 0 ? (
                                        filteredTemplates.map(
                                          (template, index) => {
                                            const templateName =
                                              typeof template === "object"
                                                ? template.name
                                                : template;
                                            return (
                                              <TooltipProvider
                                                delayDuration={400}
                                                key={index}
                                              >
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <DropdownMenuItem
                                                      onClick={() => {
                                                        setSelectedFolderTemplates(
                                                          templateName
                                                        );
                                                        setIsTemplateDropdownOpen(
                                                          false
                                                        );
                                                      }}
                                                      className={`text-sm text-gray-700 px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedFolderTemplates ===
                                                        templateName
                                                        ? "bg-blue-50 text-blue-700"
                                                        : ""
                                                        }`}
                                                    >
                                                      <span className="truncate w-full block">
                                                        {templateName}
                                                      </span>
                                                    </DropdownMenuItem>
                                                  </TooltipTrigger>
                                                  <TooltipContent
                                                    side="right"
                                                    className="text-xs bg-gray-900 text-white px-2 py-1 rounded-md shadow-md max-w-[220px] break-words"
                                                  >
                                                    {templateName}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            );
                                          }
                                        )
                                      ) : (
                                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                                          No templates found
                                        </div>
                                      )}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* AI Assistant Toggle */}
                        <Card className="rounded-2xl w-full shadow-none border-0 bg-gray-100">
                          <CardContent className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg">
                                  <MessageSquare
                                    className={`h-4 w-4 ${startAiChat ? "text-blue-500" : "text-gray-400"
                                      }`}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">AI Assistant</p>
                                  <p className="text-xs text-muted-foreground truncate hidden xl:block">
                                    Enable AI processing
                                  </p>
                                </div>
                              </div>

                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={startAiChat}
                                  onChange={() => setStartAiChat(!startAiChat)}
                                />
                                <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-full after:transition-all" />
                              </label>
                            </div>

                            {startAiChat && <AiPromptBox startAiChat={startAiChat} />}
                          </CardContent>
                        </Card>

                      </div>

                      {/* Files Preview List */}
                      <Card className="rounded-xl w-full shadow-none min-h-1/2 flex flex-col border-none">
                        <div className="p-3 pb-2">
                          <p className="font-semibold text-sm flex items-center justify-between">
                            <span>Selected Files</span>
                            <span className="text-xs text-muted-foreground">
                              {uploadedFiles.length} / {MAX_FILES}
                              <span className="text-red-500 font-medium">
                                {" "}
                                *
                              </span>{" "}
                              files
                            </span>
                          </p>
                        </div>

                        <div className="relative px-3 pb-3 space-y-3 max-h-[220px] overflow-y-auto">
                          {shouldShowDocumentTitleInput &&
                            folderTemplatesList?.length > 0 && (
                              <Card className="sticky top-0 z-20 shadow-xs rounded-xl border border-blue-300 bg-blue-50">
                                <CardContent className="p-2 flex shadow-none items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <InfoIcon className="h-5 w-5 shrink-0 text-blue-400" />
                                    <p className="text-sm text-gray-800 text-wrap">
                                      {documentTitleRequirement}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                          <div className="space-y-3 mt-1 z-10">
                            {uploadedFiles.map((file) => {
                              const extension = file.name?.split(".").pop();
                              return (
                                <div
                                  key={file.name}
                                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                  <div className="flex justify-between items-center p-3">
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 truncate flex-1 min-w-0">
                                      {getFileIcon(extension, file.name)}
                                      <span className="truncate">
                                        {file.name}
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:bg-red-50 hover:text-red-500 p-1.5 h-auto rounded-lg transition-colors flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFile(file);
                                      }}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>

                                  {shouldShowDocumentTitleInput && (
                                    <div className="px-3 pb-3 space-y-3">
                                      {/* Document Title Input */}
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          placeholder="Enter document title..."
                                          value={fileDocumentTitles[file.name] || ""}
                                          onChange={(e) =>
                                            handleDocumentTitleChange(
                                              file.name,
                                              e.target.value
                                            )
                                          }
                                          className="w-full h-9 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        {fileDocumentTitles[file.name] && (
                                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                          </div>
                                        )}
                                      </div>

                                    </div>
                                  )}
                                  {/* Calendar Date Picker */}
                                  <div className="px-3 pb-3 space-y-3">
                                    <Popover
                                    open={openCalendars[file.name]}
                                    onOpenChange={(isOpen) => toggleCalendar(file.name, isOpen)}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full h-9 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-blue-400 transition-all justify-start text-left font-normal"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                        <span className={fileDates[file.name] ? "text-gray-700" : "text-gray-400"}>
                                          {fileDates[file.name]
                                            ? formatDate(fileDates[file.name], configs?.DateFormat)
                                            : "Select date..."}
                                        </span>
                                        {fileDates[file.name] && (
                                          <div className="ml-auto">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                          </div>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0 rounded-md"
                                      align="start"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={fileDates[file.name]}
                                        onSelect={(date) => handleDateSelect(file.name, date)}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Fixed Bottom Buttons */}
                    <div className="flex-shrink-0 flex justify-end gap-3 pt-3 mt-3 border-t">
                      <Button
                        variant="outline"
                        className="text-muted-foreground text-sm px-6 hover:bg-gray-200 rounded-2xl border border-gray-300"
                        onClick={handleClearClick}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                      <Button
                        disabled={uploadedFiles.length === 0 || loading}
                        className="bg-gray-900/90 text-sm px-6 text-white rounded-2xl hover:bg-gray-900 disabled:opacity-50"
                        onClick={handleUploadFile}
                      >
                        {loading ? <Loader width={4} height={4} /> : "Upload"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Show Files Tab */}
          <TabsContent value="documentSearch" className="h-full m-0 p-0">
            <div className="w-full h-full flex flex-col">
              {selectedFolder ? (
                <>
                  <div className="flex-1 w-full overflow-hidden relative bg-white">
                    {iframeLoading && !iframeError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <p className="text-sm text-gray-600">Loading document search...</p>
                        </div>
                      </div>
                    )}

                    {iframeError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                        <div className="flex flex-col items-center gap-3 p-8 text-center">
                          <AlertCircle className="w-12 h-12 text-red-500" />
                          <h3 className="text-lg font-semibold text-gray-900">Failed to Load</h3>
                          <p className="text-sm text-gray-600 max-w-md">
                            Unable to load the document search interface. Please check your connection and try again.
                          </p>
                          <Button
                            onClick={() => {
                              setIframeError(false);
                              setIframeLoading(true);
                            }}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}

                    <iframe
                      key={selectedFolder.id}
                      src={getDocumentSearchUrl()}
                      className="w-full h-full border-0"
                      title="Document Search"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                      onLoad={() => {
                        setIframeLoading(false);
                        setIframeError(false);
                      }}
                      onError={() => {
                        setIframeLoading(false);
                        setIframeError(true);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Folder Selected</h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Please select a folder from the sidebar to search for documents.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documents Tab (Uploaded Files) */}
          <TabsContent value="documents" className="flex-1 h-full m-0">
            {!isUploadable && activeTab === 'documents' ? (
              <div className="h-full flex items-center justify-center">
                <NotUploadableNotice />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4">
                {documentsList?.length > 0 ? (
                  <div className="space-y-2">
                    {documentsList.map((item) => (
                      <div
                        key={item.ID}
                        onClick={() => handleSelectDocument(item)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                        ${selectedDocumentId === item.ID
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getFileIcon(item.Extension, item.FileName)}
                          <p className="text-sm font-medium truncate">
                            {item.FileName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mb-3" />
                    <p className="text-sm">No documents available</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientFolderUploadTab;