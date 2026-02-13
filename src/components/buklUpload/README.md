# Bulk Upload Components

This folder contains reusable, independent components for handling bulk file uploads with drag & drop, local file browsing, and new document creation. **All state is managed centrally using Zustand store.**

## Components

### 1. `upload-screen.jsx` - Main Container

The main component that combines the upload area and template mapping with tabs navigation.

**Features:**
- Tab navigation (Upload, Uploaded Files, Show Files)
- Integrates upload-area and template-mapping components
- Responsive grid layout
- Toast notifications for user feedback
- Connected to Zustand store for state management

**Usage:**
```jsx
import UploadScreen from "@/components/buklUpload/upload-screen";

export default function MyPage() {
  return <UploadScreen />;
}
```

### 2. `upload-area.jsx` - File Upload Component

A fully-featured, reusable upload component that handles multiple file input methods.

**Features:**
- ✅ Drag & drop file upload with visual feedback
- ✅ Local file browsing via "Select Files" button
- ✅ Paste files from clipboard
- ✅ Create new documents (Word, Excel, PowerPoint)
- ✅ File list with preview
- ✅ File removal capability
- ✅ Upload and Clear actions
- ✅ Smooth animations and transitions
- ✅ Responsive layout (adapts to mobile/desktop)
- ✅ **State managed by Zustand store**

**Props:**
```jsx
{
  onUpload: function,         // Optional callback when upload button is clicked
  onClear: function,          // Optional callback when clear button is clicked
}
```

**Usage:**
```jsx
import UploadArea from "@/components/buklUpload/upload-area";

export default function MyComponent() {
  const handleUpload = (files) => {
    console.log("Uploading files:", files);
    // Perform additional upload logic here
  };

  const handleClear = () => {
    console.log("Files cleared");
  };

  return (
    <UploadArea
      onUpload={handleUpload}
      onClear={handleClear}
    />
  );
}
```

### 3. `template-mapping.jsx` - Template Selection Component

A simple component for template selection and metadata entry.

**Features:**
- Search input for templates
- Empty state display
- Customizable template selection callback
- **State managed by Zustand store**

**Props:**
```jsx
{
  onTemplateSelect: function  // Optional callback when template is selected
}
```

**Usage:**
```jsx
import TemplateMapping from "@/components/buklUpload/template-mapping";

export default function MyComponent() {
  const handleTemplateSelect = (template) => {
    console.log("Template selected:", template);
  };

  return (
    <TemplateMapping onTemplateSelect={handleTemplateSelect} />
  );
}
```

## State Management with Zustand

All bulk upload state is managed centrally using `useBulkUploadStore`.

### Store Location
```
src/store/useBulkUploadStore.js
```

### Store State
```jsx
{
  // Files
  files: [],              // Array of file objects
  maxFiles: 20,          // Maximum files allowed
  
  // UI State
  isDragging: false,     // Drag & drop state
  isNewDocOpen: false,   // New document sheet state
  isCreateDocOpen: false, // Create document dialog state
  
  // Document Creation
  selectedDocType: null, // Selected document type
  newFileName: '',       // New file name input
  
  // Metadata
  title: string,         // Upload title
  folderName: string,    // Folder name
  
  // Template Mapping
  selectedTemplate: null, // Selected template
  searchQuery: '',       // Template search query
  
  // Loading & Messages
  loading: false,
  error: null,
  successMessage: null,
}
```

### Store Actions
```jsx
// File Actions
addFiles(newFiles)                    // Add files to the list
addNewDocument(docType, fileName)     // Create new document
removeFile(fileId)                    // Remove a file
clearFiles()                          // Clear all files
uploadFiles()                         // Upload files (async)

// UI Actions
setIsDragging(isDragging)
setIsNewDocOpen(isOpen)
setIsCreateDocOpen(isOpen)
setSelectedDocType(docType)
setNewFileName(fileName)

// Configuration
setTitle(title)
setFolderName(folderName)
setMaxFiles(maxFiles)

// Template Actions
setSelectedTemplate(template)
setSearchQuery(query)

// Messages
setError(error)
setSuccessMessage(message)
clearMessages()

// Validation
validateUpload()                      // Validate before upload

// Reset
reset()                               // Reset entire store
```

### Using the Store Directly

You can access the store directly from any component:

```jsx
import useBulkUploadStore from "@/store/useBulkUploadStore";

export default function MyComponent() {
  const { files, addFiles, uploadFiles } = useBulkUploadStore();
  
  const handleCustomUpload = async () => {
    const success = await uploadFiles();
    if (success) {
      console.log("Upload successful!");
    }
  };
  
  return (
    <div>
      <p>Files: {files.length}</p>
      <button onClick={handleCustomUpload}>Upload</button>
    </div>
  );
}
```

### Store Benefits

1. **Centralized State**: All components share the same state
2. **Persistence**: State persists across component unmounts
3. **DevTools Support**: Debug state changes using Redux DevTools
4. **Performance**: Optimized re-renders with Zustand
5. **Easy Integration**: Access from any component without prop drilling

## File States

Each file in the store has the following structure:

```jsx
{
  id: string,           // Unique identifier
  name: string,         // File name
  date: string,         // Date added (YYYY-MM-DD)
  file: File | null,    // File object (null for new documents)
  isNew: boolean,       // Whether it's a newly created document
}
```

## Transitions & Animations

The components use Framer Motion for smooth transitions:

- **Layout transitions**: Smooth expansion/collapse when files are added/removed
- **Entry animations**: Fade and slide effects for new elements
- **Drag feedback**: Visual indication during drag & drop
- **State changes**: Smooth transitions between empty and filled states

## Dependencies

- `@/components/ui/*` - shadcn/ui components (Button, Card, Dialog, Sheet, Tabs, Input, etc.)
- `lucide-react` - Icons
- `framer-motion` - Animations
- `sonner` - Toast notifications
- `zustand` - State management

## Demo Page

To see the components in action, visit:
```
/bulk-upload-demo
```

## Advanced Usage

### Custom Upload Logic

```jsx
import useBulkUploadStore from "@/store/useBulkUploadStore";
import axios from "axios";

export default function CustomUpload() {
  const { files, setLoading, setError, setSuccessMessage, clearFiles } = useBulkUploadStore();
  
  const handleCustomUpload = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        if (file.file) {
          formData.append('files', file.file);
        }
      });
      
      await axios.post('/api/upload', formData);
      
      setSuccessMessage('Upload successful!');
      clearFiles();
    } catch (error) {
      setError('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleCustomUpload}>
      Custom Upload
    </button>
  );
}
```

### Customizing Configuration

```jsx
import { useEffect } from "react";
import useBulkUploadStore from "@/store/useBulkUploadStore";
import UploadScreen from "@/components/buklUpload/upload-screen";

export default function CustomConfigPage() {
  const { setTitle, setFolderName, setMaxFiles } = useBulkUploadStore();
  
  useEffect(() => {
    setTitle("Upload to Project Documents");
    setFolderName("Marketing Materials");
    setMaxFiles(50);
  }, [setTitle, setFolderName, setMaxFiles]);
  
  return <UploadScreen />;
}
```

### Monitoring File Changes

```jsx
import { useEffect } from "react";
import useBulkUploadStore from "@/store/useBulkUploadStore";

export default function FileMonitor() {
  const files = useBulkUploadStore(state => state.files);
  
  useEffect(() => {
    console.log("Files changed:", files);
    // Perform actions when files change
  }, [files]);
  
  return <div>Monitoring {files.length} files</div>;
}
```

## Customization

### Styling
Components use Tailwind CSS classes. You can customize:
- Colors via Tailwind theme
- Border radius, shadows, spacing
- Responsive breakpoints

### File Types
To add/modify document types in "New Document", edit the `documentTypes` array in `upload-area.jsx`:

```jsx
const documentTypes = [
  { id: "word", name: "Word Document", icon: "word.svg", extension: ".docx" },
  { id: "excel", name: "Excel Spreadsheet", icon: "xlsx.png", extension: ".xlsx" },
  { id: "powerpoint", name: "PowerPoint Presentation", icon: "ppt.png", extension: ".pptx" },
  // Add more types here
];
```

### Max Files Limit
Change the max files using the store:

```jsx
const { setMaxFiles } = useBulkUploadStore();
setMaxFiles(100); // Set to 100 files
```

## Notes

- The components are designed to be **framework-agnostic** and can be used in any React/Next.js project
- All state is managed by Zustand, making it easy to integrate with other parts of your app
- All file icons should be placed in the `/public` directory
- The paste files feature requires clipboard permissions in the browser
- Drag & drop is fully supported on modern browsers
- Store uses devtools middleware for debugging (use Redux DevTools extension)
