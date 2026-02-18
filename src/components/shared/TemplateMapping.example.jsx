/**
 * Example Usage of TemplateMapping Component
 * 
 * This file demonstrates how to use the standalone TemplateMapping component
 * in different scenarios across various projects.
 */

import TemplateMapping from './TemplateMapping';
import { toast } from 'sonner'; // Optional: for notifications

// ============================================
// Example 1: Basic Usage
// ============================================

export function BasicExample() {
  const templates = [
    { 
      id: 'invoice-template', 
      name: 'Invoice Template', 
      description: 'Standard invoice template' 
    },
    { 
      id: 'receipt-template', 
      name: 'Receipt Template', 
      description: 'Payment receipt template' 
    },
  ];

  const clients = [
    { id: 'client1', name: 'ABC Corp', clientId: 'ABC001' },
    { id: 'client2', name: 'XYZ Ltd', clientId: 'XYZ002' },
  ];

  const documentTypes = [
    { id: 'invoice', name: 'Invoice' },
    { id: 'receipt', name: 'Receipt' },
  ];

  const documentSubTypes = [
    { id: 'sales', name: 'Sales' },
    { id: 'purchase', name: 'Purchase' },
  ];

  const documentSubTypesII = [
    { id: 'taxable', name: 'Taxable' },
    { id: 'non-taxable', name: 'Non-Taxable' },
  ];

  const handleSubmit = (values) => {
    console.log('Submitted values:', values);
    // API call here
  };

  return (
    <div className="h-screen p-4">
      <TemplateMapping
        templates={templates}
        clients={clients}
        documentTypes={documentTypes}
        documentSubTypes={documentSubTypes}
        documentSubTypesII={documentSubTypesII}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ============================================
// Example 2: With Tags and Custom Button
// ============================================

export function AdvancedExample() {
  const templates = [
    { id: 'legal-doc', name: 'Legal Document', description: 'Legal contracts' },
    { id: 'financial-report', name: 'Financial Report', description: 'Financial statements' },
  ];

  const clients = [
    { id: 'client1', name: 'Tech Startup Inc', clientId: 'TSI001' },
    { id: 'client2', name: 'Global Enterprise', clientId: 'GE002' },
  ];

  const documentTypes = [
    { id: 'contract', name: 'Contract' },
    { id: 'agreement', name: 'Agreement' },
    { id: 'report', name: 'Report' },
  ];

  const documentSubTypes = [
    { id: 'employment', name: 'Employment' },
    { id: 'vendor', name: 'Vendor' },
    { id: 'client', name: 'Client' },
  ];

  const documentSubTypesII = [
    { id: 'confidential', name: 'Confidential' },
    { id: 'public', name: 'Public' },
    { id: 'internal', name: 'Internal' },
  ];

  const tags = [
    { id: 'urgent', name: '🔴 Urgent' },
    { id: 'review', name: '👁️ Review' },
    { id: 'approved', name: '✅ Approved' },
  ];

  const handleSubmit = async (values) => {
    try {
      // API call
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Document metadata saved successfully!');
      } else {
        toast.error('Failed to save document metadata');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="container mx-auto p-6 h-screen">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
      <TemplateMapping
        templates={templates}
        clients={clients}
        documentTypes={documentTypes}
        documentSubTypes={documentSubTypes}
        documentSubTypesII={documentSubTypesII}
        tags={tags}
        onSubmit={handleSubmit}
        uploadButtonText="Save Metadata"
      />
    </div>
  );
}

// ============================================
// Example 3: Without Upload Button (Form Only)
// ============================================

export function FormOnlyExample() {
  const templates = [
    { id: 'template1', name: 'Template 1', description: 'Description 1' },
  ];

  const clients = [
    { id: 'client1', name: 'Client A', clientId: 'CA001' },
  ];

  const documentTypes = [
    { id: 'type1', name: 'Type 1' },
  ];

  const documentSubTypes = [
    { id: 'subtype1', name: 'Subtype 1' },
  ];

  const documentSubTypesII = [
    { id: 'subtype-ii-1', name: 'Subtype II 1' },
  ];

  // Don't show upload button - handle submission externally
  const handleFormChange = (values) => {
    console.log('Form values updated:', values);
    // Can be used for real-time validation or preview
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <TemplateMapping
        templates={templates}
        clients={clients}
        documentTypes={documentTypes}
        documentSubTypes={documentSubTypes}
        documentSubTypesII={documentSubTypesII}
        showUploadButton={false}
        showApplyToAll={false}
        onSubmit={handleFormChange}
      />
      
      {/* Custom external buttons */}
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Save Draft
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Modal Integration
// ============================================

export function ModalExample({ isOpen, onClose }) {
  const templates = [
    { id: 'quick-template', name: 'Quick Template', description: 'Fast setup' },
  ];

  const clients = [
    { id: 'client1', name: 'Client One', clientId: 'C001' },
  ];

  const documentTypes = [{ id: 'general', name: 'General' }];
  const documentSubTypes = [{ id: 'standard', name: 'Standard' }];
  const documentSubTypesII = [{ id: 'normal', name: 'Normal' }];

  const handleSubmit = (values) => {
    console.log('Modal form submitted:', values);
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Add Document Metadata</h2>
        </div>
        
        <div className="h-[calc(90vh-120px)]">
          <TemplateMapping
            templates={templates}
            clients={clients}
            documentTypes={documentTypes}
            documentSubTypes={documentSubTypes}
            documentSubTypesII={documentSubTypesII}
            onSubmit={handleSubmit}
            uploadButtonText="Submit"
            className="border-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 5: Using Store Directly
// ============================================

import useTemplateMappingStore from '@/store/useTemplateMappingStore';

export function DirectStoreExample() {
  const { 
    getFieldValues, 
    validateFields, 
    reset,
    documentTitle,
    documentType
  } = useTemplateMappingStore();

  const handleCustomAction = () => {
    const validation = validateFields();
    
    if (!validation.isValid) {
      alert('Please fill all required fields:\n' + validation.errors.join('\n'));
      return;
    }

    const values = getFieldValues();
    console.log('All values:', values);
    
    // Process the data
    // ...
    
    // Reset form
    reset();
  };

  // Real-time value monitoring
  console.log('Current title:', documentTitle);
  console.log('Current type:', documentType);

  const templates = [{ id: 't1', name: 'Template', description: 'Desc' }];
  const clients = [{ id: 'c1', name: 'Client', clientId: 'C1' }];
  const documentTypes = [{ id: 'd1', name: 'Type 1' }];
  const documentSubTypes = [{ id: 's1', name: 'SubType 1' }];
  const documentSubTypesII = [{ id: 's2', name: 'SubType II 1' }];

  return (
    <div className="p-4">
      <TemplateMapping
        templates={templates}
        clients={clients}
        documentTypes={documentTypes}
        documentSubTypes={documentSubTypes}
        documentSubTypesII={documentSubTypesII}
        showUploadButton={false}
      />
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={handleCustomAction}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Custom Validate & Submit
        </button>
        <button 
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Reset Form
        </button>
      </div>
    </div>
  );
}

// ============================================
// Example 6: Dynamic Data Loading
// ============================================

import { useState, useEffect } from 'react';

export function DynamicDataExample() {
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const [templatesRes, clientsRes] = await Promise.all([
          fetch('/api/templates'),
          fetch('/api/clients'),
        ]);

        const templatesData = await templatesRes.json();
        const clientsData = await clientsRes.json();

        setTemplates(templatesData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const documentTypes = [{ id: 'doc', name: 'Document' }];
  const documentSubTypes = [{ id: 'general', name: 'General' }];
  const documentSubTypesII = [{ id: 'standard', name: 'Standard' }];

  const handleSubmit = async (values) => {
    await fetch('/api/save-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-screen p-4">
      <TemplateMapping
        templates={templates}
        clients={clients}
        documentTypes={documentTypes}
        documentSubTypes={documentSubTypes}
        documentSubTypesII={documentSubTypesII}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
