// store/useTemplateMappingStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Standalone store for Template Mapping component
 * Can be used independently across different projects
 */
const useTemplateMappingStore = create(
  devtools(
    (set, get) => ({
      // Template selection
      selectedTemplate: null,
      selectedTemplateId: '',

      // Required fields
      clientNameList: '',
      clientId: '',
      documentTitle: '',
      documentDate: '',

      // New document type fields (replacing folder path)
      documentType: '',
      documentSubType: '',
      documentSubTypeII: '',

      // Optional fields
      tags: '',

      // UI state
      applyToAll: false,

      // Actions - Template
      setSelectedTemplate: (template) => 
        set({ 
          selectedTemplate: template,
          selectedTemplateId: template?.id || ''
        }),

      // Actions - Required fields
      setClientNameList: (value) => set({ clientNameList: value }),
      setClientId: (value) => set({ clientId: value }),
      setDocumentTitle: (value) => set({ documentTitle: value }),
      setDocumentDate: (value) => set({ documentDate: value }),

      // Actions - Document type fields
      setDocumentType: (value) => set({ documentType: value }),
      setDocumentSubType: (value) => set({ documentSubType: value }),
      setDocumentSubTypeII: (value) => set({ documentSubTypeII: value }),

      // Actions - Optional fields
      setTags: (value) => set({ tags: value }),

      // Actions - UI
      setApplyToAll: (value) => set({ applyToAll: value }),

      // Get all field values
      getFieldValues: () => {
        const state = get();
        return {
          selectedTemplateId: state.selectedTemplateId,
          clientNameList: state.clientNameList,
          clientId: state.clientId,
          documentTitle: state.documentTitle,
          documentDate: state.documentDate,
          documentType: state.documentType,
          documentSubType: state.documentSubType,
          documentSubTypeII: state.documentSubTypeII,
          tags: state.tags,
          applyToAll: state.applyToAll,
        };
      },

      // Validation
      validateFields: () => {
        const state = get();
        const errors = [];

        if (!state.selectedTemplateId) {
          errors.push('Please select a template');
        }
        if (!state.clientNameList) {
          errors.push('Client Name is required');
        }
        if (!state.clientId) {
          errors.push('Client ID is required');
        }
        if (!state.documentTitle) {
          errors.push('Document Title is required');
        }
        if (!state.documentDate) {
          errors.push('Document Date is required');
        }
        if (!state.documentType) {
          errors.push('Document Type is required');
        }
        if (!state.documentSubType) {
          errors.push('Document Sub Type is required');
        }
        if (!state.documentSubTypeII) {
          errors.push('Document Sub Type II is required');
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      // Reset all fields
      reset: () => {
        set({
          selectedTemplate: null,
          selectedTemplateId: '',
          clientNameList: '',
          clientId: '',
          documentTitle: '',
          documentDate: '',
          documentType: '',
          documentSubType: '',
          documentSubTypeII: '',
          tags: '',
          applyToAll: false,
        });
      },

      // Reset only form fields (keep template selection)
      resetFields: () => {
        set({
          clientNameList: '',
          clientId: '',
          documentTitle: '',
          documentDate: '',
          documentType: '',
          documentSubType: '',
          documentSubTypeII: '',
          tags: '',
          applyToAll: false,
        });
      },
    }),
    { name: 'TemplateMappingStore' }
  )
);

export default useTemplateMappingStore;
