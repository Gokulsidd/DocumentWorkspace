// store/useMetadataStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useMetadataStore = create(
  devtools(
    (set, get) => ({
      // Templates
      templates: [],
      selectedTemplate: null,
      loading: false,
      error: null,
      successMessage: null,

      // Form Data - stores field values by field ID
      formData: {},

      // Actions
      setTemplates: (templates) =>
        set({ templates, error: null }),

      setSelectedTemplate: (template) =>
        set({
          selectedTemplate: template,
          formData: {}, // Reset form data when template changes
          error: null,
          successMessage: null,
        }),

      setFormData: (fieldId, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [fieldId]: value,
          },
        })),

      resetFormData: () =>
        set({ formData: {} }),

      setLoading: (loading) =>
        set({ loading }),

      setError: (error) =>
        set({ error, successMessage: null }),

      setSuccessMessage: (message) =>
        set({ successMessage: message, error: null }),

      clearMessages: () =>
        set({ error: null, successMessage: null }),

      // Validation
      validateForm: () => {
        const { selectedTemplate, formData } = get();
        
        if (!selectedTemplate) {
          set({ error: 'Please select a template' });
          return false;
        }

        const requiredFields = selectedTemplate.Fields.filter((field) => field.IsRequired);
        const emptyRequiredFields = [];

        requiredFields.forEach((field) => {
          const value = formData[field.ID];
          
          // Handle different value types
          if (field.IsMultiValue) {
            // For multi-value fields, check if array is empty
            if (!value || !Array.isArray(value) || value.length === 0) {
              emptyRequiredFields.push(field.Name);
            }
          } else {
            // For single-value fields, check if value is empty
            if (!value || value.toString().trim() === '') {
              emptyRequiredFields.push(field.Name);
            }
          }
        });

        if (emptyRequiredFields.length > 0) {
          set({
            error: `Please fill in the following required fields: ${emptyRequiredFields.join(', ')}`,
          });
          return false;
        }

        return true;
      },
    }),
    { name: 'MetadataStore' }
  )
);

export default useMetadataStore;
