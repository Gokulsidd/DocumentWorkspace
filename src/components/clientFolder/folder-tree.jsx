import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Folder,
  FolderOpen,
  Loader2,
  X,
  Search,
  Clipboard,
} from "lucide-react";

import useStore from "@/store/useStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FolderTreeShimmer from "./folder-shimmer";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import { errorToastObj, successToastObj } from "@/lib/constants";
import { toast } from "sonner";

// Layout constants (kept from base)
const LAYOUT = {
  ROW_HEIGHT: 32,
  INDENT: 20,
  BASE_PADDING: 12,
  CONNECTOR_WIDTH: 1,
};

// Utility function to build folder hierarchy connectors
const buildHierarchyLines = (level) => {
  if (level === 0) return null;

  return (
    <div
      className="absolute left-0 top-0 bottom-0 pointer-events-none"
      style={{ width: `${level * LAYOUT.INDENT + LAYOUT.BASE_PADDING}px` }}
      aria-hidden="true"
    >
      {Array.from({ length: level }).map((_, i) => (
        <div
          key={`vertical-${i}`}
          className="absolute top-0 bottom-0"
          style={{
            left: `${i * LAYOUT.INDENT + LAYOUT.INDENT / 2 + LAYOUT.BASE_PADDING}px`,
            width: `${LAYOUT.CONNECTOR_WIDTH}px`,
            backgroundColor: "var(--vscode-tree-connector, rgba(128,128,128,0.18))",
          }}
        />
      ))}
      <div
        className="absolute"
        style={{
          left: `${(level - 1) * LAYOUT.INDENT + LAYOUT.INDENT / 2 + LAYOUT.BASE_PADDING}px`,
          top: "50%",
          height: "1px",
          width: `${LAYOUT.INDENT / 2}px`,
          backgroundColor: "var(--vscode-tree-connector, rgba(128,128,128,0.18))",
        }}
      />
    </div>
  );
};

// Search Result Item Component
const SearchResultItem = ({ folder, onSelect, highlightTerm, closeDropdown, selectedFolderPath }) => {
  const pathParts = folder.path.split(/[\\/\\\\]/).filter(Boolean);

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-600 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Display path relative to selected folder or hide first 3 segments if no folder selected
  let displayPath;
  if (selectedFolderPath) {
    // Show path relative to selected folder
    const selectedPathParts = selectedFolderPath.split(/[\\/\\\\]/).filter(Boolean);
    const currentPathParts = folder.path.split(/[\\/\\\\]/).filter(Boolean);

    // Find where paths diverge and show from selected folder onwards
    let startIndex = 0;
    for (let i = 0; i < selectedPathParts.length; i++) {
      if (selectedPathParts[i] === currentPathParts[i]) {
        startIndex = i + 1;
      } else {
        break;
      }
    }

    const displayParts = currentPathParts.slice(startIndex);
    displayPath = displayParts.length ? displayParts.join(' > ') : folder.folderName;
  } else {
    // No folder selected: hide first 3 segments
    const displayParts = pathParts.slice(3);
    displayPath = displayParts.length ? displayParts.join(' > ') : pathParts.join(' > ');
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDropdown();
    onSelect(folder);
  };

  return (
    <div
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <Folder className="h-4 w-4 text-yellow-600 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {highlightText(folder.folderName, highlightTerm)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {displayPath}
          </div>
        </div>
      </div>
    </div>
  );
};

// Folder Item Component (base version extended with context menu + clipboard)
const FolderItem = React.memo(({
  folder,
  level = 0,
  expandedFolders,
  toggleFolder,
  selectedFolder,
  onFolderSelect,
}) => {
  // Pull many actions/state from store. Some may not exist in all projects; we guard usage where necessary.
  const {
    getFolderTreeByPath,
    folderLoading,
    setFolderLoading,
    setSelectedClientFolder,
    handleUploadFolderClick,
    selectedUploadFolder,
    selectedTabs,
    setSelectedTabs,
    setFolderTemplatesList,
    activeTab,
    setActiveTab,
    setDocumentsList,
    setSelectedCollection,
    setUploadedFiles,
    setSelectedFolderTemplates,
    resetFileDocumentTitles,
    setIsUploadable,
    pasteDocumentMainPath,
    setSelectedUploadFolder,
    isUploadable,
    setFolderTreePath,
    isPasteButtonEnabled,
    setPasteTrigger,
    folderTreePath,
    setSelectedIds,
    setSelectedFolderNode,
    setIsPasteButtonEnabled,
    getFolderTemplatesByPath,
  } = useStore();

  const itemRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const folderPath = folder?.path || '';
  const folderName = folder?.folderName || 'Unnamed Folder';
  const childFolders = folder?.childFolder || [];

  const isExpanded = expandedFolders.includes(folderPath);
  const hasChildren = childFolders.length > 0;
  const isSelected = selectedUploadFolder?.path === folderPath;
  const isLoading = folderLoading?.[folderPath];

  // Scroll into view when selected (Critical for search navigation)
  useEffect(() => {
    if (isSelected && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSelected]);

  const updateClientUploadTab = useCallback((isUploadableFlag) => {
    const currentTabs = selectedTabs?.options || [];
    const alreadyHasClientUpload = currentTabs.some(
      (tab) => tab.name === "ClientUpload"
    );

    if (!alreadyHasClientUpload) {
      setSelectedTabs &&
        setSelectedTabs({
          options: [
            ...currentTabs,
            {
              id: 9997,
              name: "ClientUpload",
              seq: 1,
            },
          ],
        });
    }

    setIsUploadable && setIsUploadable(isUploadableFlag);
  }, [selectedTabs, setSelectedTabs, setIsUploadable]);

  // Check if text is truncated to show tooltip
  const checkTruncation = useCallback(() => {
    if (itemRef.current && containerRef.current) {
      const textElement = itemRef.current;
      const container = containerRef.current;
      // buffer for icons/padding
      const buffer = 60;
      const isOverflowing = textElement.scrollWidth > (container.clientWidth - buffer);
      setShowTooltip(isOverflowing);
    }
  }, []);

  useEffect(() => {
    checkTruncation();
    const ro = new ResizeObserver(checkTruncation);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [checkTruncation, folder?.folderName]);

  // Copy folder name to clipboard + toast
  const handleCopyFolderName = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(folderName);
        toast.success("Folder name copied", successToastObj);
      } else {
        // fallback
        const tmp = document.createElement("textarea");
        tmp.value = folderName;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        toast.success("Folder name copied", successToastObj);
      }
    } catch (err) {
      console.error("Copy error", err);
      toast.error("Failed to copy folder name", errorToastObj);
    }
  }, [folderName]);

  // Copy folder path to clipboard + toast
  const handleCopyFolderPath = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(folderPath);
        toast.success("Folder path copied", successToastObj);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = folderPath;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        toast.success("Folder path copied", successToastObj);
      }
    } catch (err) {
      console.error("Copy path error", err);
      toast.error("Failed to copy folder path", errorToastObj);
    }
  }, [folderPath]);

  // Paste here: use localStorage "CopyData" (as in Version B). This calls store.pasteDocumentMainPath if available.
  const handlePasteFolderPath = useCallback(async () => {
    try {
      const saved = localStorage.getItem("CopyData");

      if (!saved) {
        toast.error("No files have been copied", errorToastObj);
        return;
      }

      // Parse the saved data
      const parsed = JSON.parse(saved);
      const ids = Array.isArray(parsed?.ID) ? parsed.ID : [];

      if (!ids.length) {
        toast.error("No valid IDs to paste", errorToastObj);
        return;
      }

      // Check if folder is uploadable
      if (!folder?.canUpload) {
        toast.error("Paste is not allowed in this folder", errorToastObj);
        return;
      }

      // Build payload
      const payload = {
        DocType: parsed?.DocType || "D",
        ID: ids,
        TargetType: "Folder",
        TargetFolder: folderPath || folder?.path || "",
      };

      console.log("Paste payload:", payload);

      // Fire the trigger to activate useEffect in upload tab
      if (typeof setPasteTrigger === "function") {
        setPasteTrigger(Date.now());
      }

      // If pasteDocumentMainPath is available, call it
      if (typeof pasteDocumentMainPath === "function") {
        await pasteDocumentMainPath(payload);
        // toast.success("Pasted Successfully", successToastObj);
      } else {
        // Just trigger the upload tab's useEffect
        toast.success("Paste initiated", successToastObj);
      }

    } catch (err) {
      console.error("Paste error:", err);
      toast.error(err.message || "Paste failed", errorToastObj);
    }
  }, [
    folder,
    folderPath,
    setPasteTrigger,
    pasteDocumentMainPath
  ]);

 
  // Toggle handler: fetch full folder tree on expand if available
const handleToggle = async (e) => {
  e.stopPropagation();
  const isRoot = level === 0;

  /* ---------------------------------------------------------------------- */
  /* 1. TAB + DOCUMENT RESET (same as handleFolderSelect)                   */
  /* ---------------------------------------------------------------------- */
  if (activeTab !== "upload") {
    setDocumentsList?.([]);
  }

  /* ---------------------------------------------------------------------- */
  /* 2. LOCAL STORAGE CLIPBOARD LOGIC                                       */
  /* ---------------------------------------------------------------------- */
  try {
    const copiedIds = localStorage.getItem("CopyData");

    if (!copiedIds) {
      setIsPasteButtonEnabled(false);
    } else {
      const parsed = JSON.parse(copiedIds);
      const parsedIds = Array.isArray(parsed?.ID) ? parsed.ID : [];

      if (parsedIds.length > 0 && folder?.canUpload) {
        setIsPasteButtonEnabled(true);
      } else {
        setIsPasteButtonEnabled(false);
      }
    }
  } catch (err) {
    console.error("❌ Error parsing CopyData:", err);
    setIsPasteButtonEnabled(false);
  }

  /* ---------------------------------------------------------------------- */
  /* 3. REMOVE "CLIENT METADATA" TAB (same as handleFolderSelect)           */
  /* ---------------------------------------------------------------------- */
  const updatedTabs = (selectedTabs?.options || []).filter(
    (t) => t.name !== "Client Metadata"
  );
  setSelectedTabs?.({ options: updatedTabs });

  /* ---------------------------------------------------------------------- */
  /* 4. FOLDER STATE SETUP                                                  */
  /* ---------------------------------------------------------------------- */
  const liveFolder = folder;
  const isUploadable = folder?.canUpload === true;

  /* ---------------------------------------------------------------------- */
  /* 5. EXPAND/COLLAPSE LOGIC + FOLDER PATH SET + LOADING                   */
  /* ---------------------------------------------------------------------- */
  if (!isExpanded) {
    // ✅ EXPANDING - Fetch data and expand
    setFolderLoading?.(folderPath, true);

    try {
      updateClientUploadTab?.(isUploadable);
      setSelectedFolderNode?.(liveFolder);
      setUploadedFiles([]);

      // Upload destination path
      setFolderTreePath?.(folderPath);

      // Fetch templates if uploadable
      if (isUploadable) {
        getFolderTemplatesByPath?.(liveFolder);
      }

    } catch (error) {
      console.error("Error in toggle select:", error);
    } finally {
      setFolderLoading?.(folderPath, false);
    }

    // Expand folder after loading
    toggleFolder?.(folderPath, folder, isRoot);

    /* -------------------------------------------------------------------- */
    /* FINAL ASSIGNMENTS for EXPAND                                         */
    /* -------------------------------------------------------------------- */
    handleUploadFolderClick?.(liveFolder);
    setSelectedClientFolder?.(liveFolder?.path);
    setSelectedCollection?.(null);
    setUploadedFiles?.([]);
    setSelectedFolderTemplates?.(null);
    resetFileDocumentTitles?.();
    setIsUploadable?.(isUploadable);

    onFolderSelect?.(liveFolder);

  } else {
    // ✅ COLLAPSING - Just collapse without fetching or updating states
    console.log("📁 Collapsing folder:", folderPath);
    
    // Simply toggle to collapse
    toggleFolder?.(folderPath, folder, isRoot);
    
    // No state updates needed when collapsing
    // The folder is just visually collapsed, keeping its previous state
  }
};


  // Folder select: preserve Version A logic + clipboard checks + fetching when necessary
  const handleFolderSelect = async (e) => {
    e?.stopPropagation?.();

    /* ------------------------- TAB + DOCUMENT RESET ------------------------- */
    if (activeTab !== "upload") {
      setDocumentsList([])
    }

    /* ---------------------- LOCAL STORAGE CLIPBOARD LOGIC ------------------- */
    try {
      const copiedIds = localStorage.getItem("CopyData");

      if (!copiedIds) {
        setIsPasteButtonEnabled(false);
      }

      const parsed = JSON.parse(copiedIds);
      const parsedIds = Array.isArray(parsed?.ID) ? parsed.ID : [];

      if (parsedIds.length > 0 && folder?.canUpload) {
        setIsPasteButtonEnabled(true);
      } else {
        setIsPasteButtonEnabled(false);
      }
    } catch (err) {
      console.error("❌ Error parsing CopyData:", err);
      setIsPasteButtonEnabled(false);
    }

    /* -------------------- REMOVE 'CLIENT METADATA' TAB ---------------------- */
    const updatedTabs = (selectedTabs?.options || []).filter(
      (t) => t.name !== "Client Metadata"
    );
    setSelectedTabs?.({ options: updatedTabs });

    /* ---------------------------- FOLDER STATES ----------------------------- */
    const liveFolder = folder;
    const isUploadable = folder?.canUpload === true;


    /* ------------------------------- EXPAND LOGIC --------------------------- */
    if (!isExpanded) {
      setFolderLoading?.(folderPath, true);

      try {
        updateClientUploadTab?.(isUploadable);
        setSelectedFolderNode?.(liveFolder);
        setUploadedFiles([]);

        // Set upload destination path
        setFolderTreePath?.(folderPath);

      } catch (error) {
        console.error("Error in folder select:", error);
      } finally {
        setFolderLoading?.(folderPath, false);
      }

      toggleFolder?.(folderPath, folder);

    } else {
      // Already expanded
      updateClientUploadTab?.(isUploadable);
      setSelectedFolderNode?.(liveFolder);

      // Set upload destination path
      setFolderTreePath?.(folderPath);
    }

    // Fetch templates only if not already loaded
    if (isUploadable) { getFolderTemplatesByPath(liveFolder) }

    /* ------------------------------ FINAL ASSIGNMENTS ----------------------- */
    handleUploadFolderClick?.(liveFolder);
    setSelectedClientFolder?.(liveFolder?.path);
    setSelectedCollection?.(null);
    setUploadedFiles?.([]);
    setSelectedFolderTemplates?.(null);
    resetFileDocumentTitles?.();
    setIsUploadable?.(isUploadable);

    onFolderSelect?.(liveFolder);
  }




  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !folder) return;

    try {
      if (typeof setFolderLoading === "function") setFolderLoading((prev) => ({ ...prev, [folderPath]: true }));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderPath", folderPath);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      console.log("✅ Upload successful:", data);
    } catch (error) {
      console.error("❌ Upload error:", error);
    } finally {
      if (typeof setFolderLoading === "function") setFolderLoading((prev) => ({ ...prev, [folderPath]: false }));
      event.target.value = "";
    }
  }, [folder, folderPath, setFolderLoading]);

  if (!folder) return null;

  return (
    <div className="relative">
      {buildHierarchyLines(level)}

      {/* ContextMenu wraps the clickable folder row and will open on right click */}
      <ContextMenu>
        <TooltipProvider delayDuration={300}>
          {/* Tooltip for the folder row itself */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ContextMenuTrigger asChild>
                <div
                  ref={containerRef}
                  className={cn(
                    "relative flex items-center cursor-pointer text-xs outline-none transition-colors group",
                    {
                      "bg-blue-500/10 dark:bg-blue-500/20": isSelected,
                      "hover:bg-gray-100 dark:hover:bg-gray-800": !isSelected,
                    }
                  )}
                  onClick={handleFolderSelect}
                  onContextMenu={(e) => {
                    // allow ContextMenuTrigger to detect right-click; stopPropagation so parent handlers don't run
                    e.stopPropagation();
                  }}
                  style={{
                    paddingLeft: `${level * LAYOUT.INDENT + LAYOUT.BASE_PADDING}px`,
                    height: `${LAYOUT.ROW_HEIGHT}px`,
                  }}
                >
                  {/* Selection indicator bar */}
                  {isSelected && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"
                      aria-hidden="true"
                    />
                  )}

                  {/* Expand/collapse chevron */}
                  <div
                    className="flex items-center justify-center mr-2 cursor-pointer"
                    onClick={handleToggle}
                    role="button"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {hasChildren ? (
                      isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                      ) : isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>

                  {/* Folder icon */}
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0" />
                  )}

                  {/* Folder label */}
                  <span
                    ref={itemRef}
                    className={cn("truncate", {
                      "font-semibold text-gray-900": isSelected,
                      "text-gray-700": !isSelected,
                    })}
                    style={{ lineHeight: `${LAYOUT.ROW_HEIGHT}px` }}
                  >
                    {folderName}
                  </span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                </div>
              </ContextMenuTrigger>
            </TooltipTrigger>

            {/* Tooltip for folder name (on hover of row) */}
            <TooltipContent
              side="right"
              align="center"
              sideOffset={8}
              className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg"
            >
              <p className="text-sm break-words">{folderName}</p>
            </TooltipContent>

            {/* Context menu */}
            <ContextMenuContent
              align="start"
              sideOffset={6}
              className="w-44 rounded-md border border-border/40 bg-popover  shadow-lg"
            >
              <ContextMenuItem
                onSelect={() => {
                  handleCopyFolderName();
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Copy className="h-4 w-4 text-muted-foreground/80" />
                Copy Folder Name
              </ContextMenuItem>

              <ContextMenuItem
                onSelect={() => {
                  handleCopyFolderPath();
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Copy className="h-4 w-4 text-muted-foreground/80" />
                Copy Folder Path
              </ContextMenuItem>

              {folder?.canUpload && (
                <ContextMenuItem
                  onSelect={() => {

                    // Check clipboard and paste if files exist
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
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Clipboard className="h-4 w-4 text-muted-foreground/80" />
                  Paste files
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </Tooltip>
        </TooltipProvider>
      </ContextMenu>

      {isExpanded &&
        hasChildren &&
        childFolders.map((child) => (
          <FolderItem
            key={child.path}
            folder={child}
            level={level + 1}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            selectedFolder={selectedFolder}
            onFolderSelect={onFolderSelect}
          />
        ))}
    </div>
  );
});

FolderItem.displayName = 'FolderItem';

// Main ClientTree Component
const ClientTree = ({ onFolderSelect }) => {
  const {
    selectedFolderTree,
    selectedUploadFolder,
    setSelectedUploadFolder,
    activeTab,
    setActiveTab,
    setDocumentsList,
    setFolderTemplatesList,
    handleUploadFolderClick,
    setSelectedClientFolder,
    setSelectedCollection,
    setUploadedFiles,
    setSelectedFolderTemplates,
    resetFileDocumentTitles,
    setIsUploadable,
    selectedTabs,
    setSelectedTabs,
    setFolderLoading,
    setSelectedFolderNode,
    getFolderTreeByPath,
    pasteDocumentMainPath,
    setPasteTrigger,
    setIsPasteButtonEnabled,
    setFolderTreePath,
    getFolderTemplatesByPath 
  } = useStore();

  const [expandedFolders, setExpandedFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const folderPaths = useRef([]);

  // Auto-focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const updateClientUploadTab = useCallback((isUploadableFlag) => {
    const currentTabs = selectedTabs?.options || [];
    const alreadyHasClientUpload = currentTabs.some(
      (tab) => tab.name === "ClientUpload"
    );

    if (!alreadyHasClientUpload) {
      setSelectedTabs &&
        setSelectedTabs({
          options: [
            ...currentTabs,
            {
              id: 9997,
              name: "ClientUpload",
              seq: 1,
            },
          ],
        });
    }

    setIsUploadable && setIsUploadable(isUploadableFlag);
  }, [selectedTabs, setSelectedTabs, setIsUploadable]);

  const { parentMap, allFoldersList } = useMemo(() => {
    const parentMap = {};
    const allFolders = [];

    function walk(node, parentPath = null) {
      if (!node) return;
      parentMap[node.path] = parentPath;
      allFolders.push(node);

      if (node.childFolder && node.childFolder.length > 0) {
        node.childFolder.forEach((c) => walk(c, node.path));
      }
    }

    if (selectedFolderTree?.folder) {
      walk(selectedFolderTree.folder, null);
    }
    return { parentMap, allFoldersList: allFolders };
  }, [selectedFolderTree]);

  // Get all descendant folders of a given folder
  const getDescendantFolders = useCallback((folder) => {
    const descendants = [];

    function collectDescendants(node) {
      if (!node) return;

      if (node.childFolder && node.childFolder.length > 0) {
        node.childFolder.forEach((child) => {
          descendants.push(child);
          collectDescendants(child);
        });
      }
    }

    collectDescendants(folder);
    return descendants;
  }, []);

  // Get search scope based on selected folder
  const getSearchScope = useCallback(() => {
    if (!selectedUploadFolder) {
      // No folder selected: search all folders
      return allFoldersList;
    }

    // Folder selected: search only current folder and its descendants
    const descendants = getDescendantFolders(selectedUploadFolder);
    return [selectedUploadFolder, ...descendants];
  }, [selectedUploadFolder, allFoldersList, getDescendantFolders]);

  const computeAncestorPaths = useCallback((path) => {
    const ancestors = [];
    let cur = parentMap[path];
    while (cur) {
      ancestors.push(cur);
      cur = parentMap[cur];
    }
    return ancestors;
  }, [parentMap]);

  // Format path for display (remove first 3 segments)
  const formatPathForDisplay = useCallback((path) => {
    if (!path) return "";
    const pathParts = path.split(/[\\/\\\\]/).filter(Boolean);
    const displayParts = pathParts.slice(3);
    return displayParts.length ? displayParts.join(' > ') : path;
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const lowerTerm = value.toLowerCase();
      const searchScope = getSearchScope();

      const results = searchScope.filter(folder =>
        (folder.folderName || '').toLowerCase().includes(lowerTerm)
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [getSearchScope]);

  // Clear search term only - keep all folder selections intact
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);

    // Refocus the input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle folder selection from search results
  const handleSearchResultSelect = async (folder) => {
    if (!folder) return;

    console.log(folder, 'folder in search result')

    const folderPath = folder.path;
    const isUploadableFlag = folder?.canUpload === true;
    const liveFolder = folder;

    /* ------------------------- TAB + DOCUMENT RESET ------------------------- */
    if (activeTab !== "upload") {
      setDocumentsList([])
    }

    /* ---------------------- LOCAL STORAGE CLIPBOARD LOGIC ------------------- */
    try {
      const copiedIds = localStorage.getItem("CopyData");

      if (!copiedIds) {
        setIsPasteButtonEnabled(false);
      }

      const parsed = JSON.parse(copiedIds);
      const parsedIds = Array.isArray(parsed?.ID) ? parsed.ID : [];

      if (parsedIds.length > 0 && isUploadableFlag) {
        setIsPasteButtonEnabled(true);
      } else {
        setIsPasteButtonEnabled(false);
      }
    } catch (err) {
      console.error("❌ Error parsing CopyData:", err);
      setIsPasteButtonEnabled(false);
    }

    /* -------------------- REMOVE 'CLIENT METADATA' TAB ---------------------- */
    const updatedTabs = (selectedTabs?.options || []).filter(
      (t) => t.name !== "Client Metadata"
    );
    setSelectedTabs?.({ options: updatedTabs });

    /* -------------------------- EXPANDANCESTORS ----------------------------- */
    const ancestors = computeAncestorPaths(folderPath);
    setExpandedFolders?.(ancestors);

    /* ----------------------------- LOADING LOGIC ----------------------------- */
    const isExpanded = expandedFolders?.includes?.(folderPath);

    setFolderLoading?.(folderPath, true);

    try {
      updateClientUploadTab?.(isUploadableFlag);
      setSelectedFolderNode?.(liveFolder);
      setUploadedFiles([])


      // ▶️ Missing in previous search version — added to match handleFolderSelect
      setFolderTreePath?.(folderPath);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFolderLoading?.(folderPath, false);
    }

    // Fetch templates only if not already loaded
    if (isUploadableFlag) { getFolderTemplatesByPath(liveFolder) }

    /* -------------------------- EXPANSION TOGGLE ---------------------------- */
    // handleFolderSelect uses toggleFolder — now added
    toggleFolder?.(folderPath, folder);

    /* ------------------------------ FINAL ASSIGNMENTS ----------------------- */
    console.log(liveFolder, folderPath, 'livefolder')
    handleUploadFolderClick?.(liveFolder);
    setSelectedClientFolder?.(folderPath);
    setSelectedUploadFolder?.(liveFolder);
    setSelectedCollection?.(null);
    setUploadedFiles?.([]);
    setSelectedFolderTemplates?.(null);
    resetFileDocumentTitles?.();
    setIsUploadable?.(isUploadableFlag);

    onFolderSelect?.(liveFolder);

    /* -------------------- SEARCH UI CLEANUP (unique to search) -------------- */
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);

    // Keep this — required for breadcrumb path update
    setSelectedFolderPath(folderPath);
  };


  // Toggle folder expansion/collapse
  const toggleFolder = useCallback((path, folder = undefined, isRoot = false) => {
    setExpandedFolders((prev) => {
      const isCurrentlyExpanded = prev.includes(path);

      if (isCurrentlyExpanded) {
        const pathsToRemove = new Set([path]);

        const findDescendantPaths = (currentFolder) => {
          if (currentFolder?.childFolder?.length) {
            for (const child of currentFolder.childFolder) {
              pathsToRemove.add(child.path);
              findDescendantPaths(child);
            }
          }
        };

        if (folder) findDescendantPaths(folder);
        return prev.filter((p) => !pathsToRemove.has(p));
      } else {
        return [...prev, path];
      }
    });

    if (isRoot) {
      setSelectedUploadFolder && setSelectedUploadFolder("");
    }
  }, [setSelectedUploadFolder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate placeholder text - show folder name when selected
  const placeholderText = selectedUploadFolder
    ? `Search in ${selectedUploadFolder.folderName}`
    : "Search for folder";

  // convenience: collapse / expand all
  const collapseAll = useCallback(() => {
    setExpandedFolders([]);
  }, []);

  const expandAll = useCallback(() => {
    setExpandedFolders(folderPaths.current);
  }, []);

  // Build the folderPaths cache once (for expandAll)
  useEffect(() => {
    const arr = [];
    function collect(node) {
      if (!node) return;
      arr.push(node.path);
      (node.childFolder || []).forEach(collect);
    }
    if (selectedFolderTree?.folder) collect(selectedFolderTree.folder);
    folderPaths.current = arr;
  }, [selectedFolderTree]);

  // If no folder tree present, show shimmer (from Version B)
  if (!selectedFolderTree?.folder) {
    return (
      <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="w-full h-full flex justify-center items-center p-4">
          <FolderTreeShimmer />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Search Section */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={placeholderText}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full text-sm pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((folder) => (
                <SearchResultItem
                  key={folder.path}
                  folder={folder}
                  onSelect={() => handleSearchResultSelect(folder)}
                  highlightTerm={searchTerm}
                  closeDropdown={() => setShowDropdown(false)}
                  selectedFolderPath={selectedUploadFolder?.path}
                />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {showDropdown && searchResults.length === 0 && searchTerm.trim() && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No folders found matching "{searchTerm}"
                {selectedUploadFolder && " in selected folder"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-auto overflow-x-auto">
        {selectedFolderTree?.folder && (
          <FolderItem
            folder={selectedFolderTree.folder}
            level={0}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            selectedFolder={selectedUploadFolder}
            onFolderSelect={onFolderSelect}
          />
        )}
      </div>
    </div>
  );
};

export default ClientTree;
