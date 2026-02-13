// store/useBulkUploadStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useBulkUploadStore = create(
  devtools(
    (set, get) => ({
      // Files state
      files: [],
      maxFiles: 7,
      
      // UI state
      isDragging: false,
      isNewDocOpen: false,
      isCreateDocOpen: false,
      
      
      // Document creation state
      creatingDocType: null,
      selectedDocType: null,
      newFileName: '',
      
      // Upload metadata
      title: 'Upload to S12. Structure Chart',
      folderName: '002. Other Accounting Document',
      
      // Template mapping
      selectedTemplate: '',
      tags: '',
      clientNameList: '',
      clientId: '',
      documentType: '',
      documentSubType: '',
      
      // Loading and messages
      loading: false,
      error: null,
      successMessage: null,

      // File Actions
      addFiles: (newFiles) => {
        const { files, maxFiles } = get();
        
        // Get existing file names (both uploaded and newly created)
        const existingFileNames = files.map(f => f.name.toLowerCase());
        
        const fileList = newFiles
          .filter((file) => {
            // Check for duplicates
            const isDuplicate = existingFileNames.includes(file.name.toLowerCase());
            if (isDuplicate) {
              set({ error: `File "${file.name}" already exists in the list` });
              return false;
            }
            return true;
          })
          .map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            file: file,
            isNew: false,
          }));
        
        if (fileList.length === 0 && newFiles.length > 0) {
          // All files were duplicates
          return;
        }
        
        const updatedFiles = [...files, ...fileList].slice(0, maxFiles);
        set({ files: updatedFiles, error: null });
      },

      addNewDocument: (docType, fileName) => {
        const { files, maxFiles } = get();
        
        if (!fileName.trim()) {
          set({ error: 'File name cannot be empty' });
          return false;
        }
        
        const fullFileName = fileName.trim() + docType.extension;
        
        // Check for duplicate names
        const existingFileNames = files.map(f => f.name.toLowerCase());
        if (existingFileNames.includes(fullFileName.toLowerCase())) {
          set({ error: `File "${fullFileName}" already exists in the list` });
          return false;
        }
        
        const newDoc = {
          id: Math.random().toString(36).substr(2, 9),
          name: fullFileName,
          date: new Date().toISOString().split('T')[0],
          file: null,
          isNew: true,
          docType: docType.id,
        };
        
        const updatedFiles = [...files, newDoc].slice(0, maxFiles);
        set({ 
          files: updatedFiles,
          newFileName: '',
          isCreateDocOpen: false,
          selectedDocType: null,
          error: null,
        });
        return true;
      },

      removeFile: (fileId) => {
        const { files } = get();
        const updatedFiles = files.filter((f) => f.id !== fileId);
        set({ files: updatedFiles });
      },

      clearFiles: () => {
        set({ 
          files: [],
          error: null,
          successMessage: null,
        });
      },

      // UI Actions
      setIsDragging: (isDragging) => set({ isDragging }),

      setIsNewDocOpen: (isOpen) => set({ isNewDocOpen: isOpen }),

      setIsCreateDocOpen: (isOpen) => set({ isCreateDocOpen: isOpen }),

      setSelectedDocType: (docType) => set({ selectedDocType: docType }),

      setNewFileName: (fileName) => set({ newFileName: fileName }),

      setCreatingDocType: (docType) => set({ creatingDocType: docType }),


      // Upload configuration
      setTitle: (title) => set({ title }),

      setFolderName: (folderName) => set({ folderName }),

      setMaxFiles: (maxFiles) => set({ maxFiles }),

      // Template mapping actions
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    
      setTags: (tags) => set({ tags }),
    
      setClientNameList: (clientNameList) => set({ clientNameList }),
    
      setClientId: (clientId) => set({ clientId }),
    
      setDocumentType: (documentType) => set({ documentType }),
    
      setDocumentSubType: (documentSubType) => set({ documentSubType }),

      // Upload action
      uploadFiles: async () => {
        const { files, clientNameList, clientId } = get();
        
        if (files.length === 0) {
          set({ error: 'No files to upload' });
          return false;
        }

        // Validate required fields
        if (!clientNameList || !clientId) {
          set({ error: 'Please fill all required fields (Client Name and Client ID)' });
          return false;
        }

        set({ loading: true, error: null });

        try {
          // Here you would make your API call
          // For now, we'll simulate an upload
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            loading: false,
            successMessage: `Successfully uploaded ${files.length} file(s)!`,
            files: [], // Clear files after successful upload
            selectedTemplate: '',
            tags: '',
            clientNameList: '',
            clientId: '',
            documentType: '',
            documentSubType: '',
          });
          
          return true;
        } catch (error) {
          set({ 
            loading: false,
            error: error.message || 'Upload failed',
          });
          return false;
        }
      },

      // Message actions
      setError: (error) => set({ error, successMessage: null }),

      setSuccessMessage: (message) => set({ successMessage: message, error: null }),

      clearMessages: () => set({ error: null, successMessage: null }),

      // Validation
      validateUpload: () => {
        const { files, clientNameList, clientId } = get();
        
        if (files.length === 0) {
          set({ error: 'Please select at least one file to upload' });
          return false;
        }

        if (!clientNameList || !clientId) {
          set({ error: 'Please fill all required fields (Client Name and Client ID)' });
          return false;
        }

        return true;
      },

      // Reset store
      reset: () => {
        set({
          files: [],
          isDragging: false,
          isNewDocOpen: false,
          isCreateDocOpen: false,
          selectedDocType: null,
          newFileName: '',
          selectedTemplate: '',
          tags: '',
          clientNameList: '',
          clientId: '',
          documentType: '',
          documentSubType: '',
          loading: false,
          error: null,
          successMessage: null,
        });
      },
    }),
    { name: 'BulkUploadStore' }
  )
);

export default useBulkUploadStore;