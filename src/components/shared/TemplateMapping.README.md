# TemplateMapping Component

A standalone, plug-and-play React component for template-based document metadata mapping. Fully responsive and can be integrated into any project.

## Features

- 🎯 **Standalone & Reusable** - Works independently across different projects
- 📱 **Fully Responsive** - Adapts to any parent container size
- 🎨 **Customizable** - Configurable fields, buttons, and options via props
- 💾 **Built-in State Management** - Uses Zustand store for efficient state handling
- ✅ **Form Validation** - Built-in validation for required fields
- 🎭 **Flexible UI** - Show/hide upload button and apply-to-all checkbox

## Installation

### 1. Copy Required Files

Copy these files to your project:

```
src/components/shared/TemplateMapping.jsx
src/store/useTemplateMappingStore.js
```

### 2. Install Dependencies

```bash
npm install zustand lucide-react
```

### 3. Ensure shadcn/ui Components

Make sure you have the following shadcn/ui components installed:

```bash
npx shadcn add label input select popover card button
```

## Basic Usage

```jsx
import TemplateMapping from '@/components/shared/TemplateMapping';

function MyComponent() {
  const templates = [
    { id: 'template1', name: 'Template 1', description: 'Description' },
    { id: 'template2', name: 'Template 2', description: 'Description' },
  ];

  const clients = [
    { id: 'client1', name: 'Client A', clientId: 'CLI001' },
    { id: 'client2', name: 'Client B', clientId: 'CLI002' },
  ];

  const documentTypes = [
    { id: 'invoice', name: 'Invoice' },
    { id: 'receipt', name: 'Receipt' },
  ];

  const documentSubTypes = [
    { id: 'financial', name: 'Financial' },
    { id: 'legal', name: 'Legal' },
  ];

  const documentSubTypesII = [
    { id: 'internal', name: 'Internal' },
    { id: 'external', name: 'External' },
  ];

  const handleSubmit = (fieldValues) => {
    console.log('Form data:', fieldValues);
    // fieldValues includes:
    // - selectedTemplateId
    // - clientNameList
    // - clientId
    // - documentTitle
    // - documentDate
    // - documentType
    // - documentSubType
    // - documentSubTypeII
    // - tags
    // - applyToAll
  };

  return (
    <div className="h-screen w-full">
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
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `templates` | `Array<{id, name, description}>` | `[]` | List of available templates |
| `clients` | `Array<{id, name, clientId}>` | `[]` | List of clients to select from |
| `documentTypes` | `Array<{id, name}>` | `[]` | List of document type options |
| `documentSubTypes` | `Array<{id, name}>` | `[]` | List of document sub type options |
| `documentSubTypesII` | `Array<{id, name}>` | `[]` | List of document sub type II options |
| `tags` | `Array<{id, name}>` | `[]` | Optional list of tag options |
| `onSubmit` | `Function` | `() => {}` | Callback function when submit/upload is clicked |
| `showUploadButton` | `boolean` | `true` | Whether to show the upload button |
| `showApplyToAll` | `boolean` | `true` | Whether to show the apply-to-all checkbox |
| `uploadButtonText` | `string` | `"Upload"` | Text for the upload button |
| `className` | `string` | `""` | Additional CSS classes for the root container |

## Advanced Usage

### Without Upload Button (Form Mode)

```jsx
<TemplateMapping
  templates={templates}
  clients={clients}
  documentTypes={documentTypes}
  documentSubTypes={documentSubTypes}
  documentSubTypesII={documentSubTypesII}
  showUploadButton={false}
  showApplyToAll={false}
  onSubmit={handleSubmit}
/>
```

### Custom Button Text

```jsx
<TemplateMapping
  // ... other props
  uploadButtonText="Submit Documents"
/>
```

### With Custom Styling

```jsx
<TemplateMapping
  // ... other props
  className="max-w-4xl mx-auto"
/>
```

## Accessing Store Directly

You can also access the store directly in your code:

```jsx
import useTemplateMappingStore from '@/store/useTemplateMappingStore';

function MyComponent() {
  const { 
    getFieldValues, 
    validateFields, 
    reset 
  } = useTemplateMappingStore();

  const handleCustomAction = () => {
    const values = getFieldValues();
    console.log('Current values:', values);

    const validation = validateFields();
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    // Process the form...
  };

  const handleReset = () => {
    reset(); // Reset all fields
  };

  return (
    <div>
      <TemplateMapping {...props} />
      <button onClick={handleCustomAction}>Custom Action</button>
      <button onClick={handleReset}>Reset Form</button>
    </div>
  );
}
```

## Store Methods

The `useTemplateMappingStore` provides these methods:

- `setSelectedTemplate(template)` - Set the selected template
- `setClientNameList(value)` - Set client name
- `setClientId(value)` - Set client ID
- `setDocumentTitle(value)` - Set document title
- `setDocumentDate(value)` - Set document date
- `setDocumentType(value)` - Set document type
- `setDocumentSubType(value)` - Set document sub type
- `setDocumentSubTypeII(value)` - Set document sub type II
- `setTags(value)` - Set tags
- `setApplyToAll(value)` - Set apply to all checkbox
- `getFieldValues()` - Get all field values as an object
- `validateFields()` - Validate all required fields
- `reset()` - Reset all fields to initial state
- `resetFields()` - Reset only form fields (keep template selection)

## Validation

The component includes built-in validation for:
- Template selection (required)
- Client name (required)
- Client ID (required)
- Document type (required)
- Document sub type (required)
- Document sub type II (required)
- Document title (required)
- Document date (required)

Validation is triggered automatically when the submit button is clicked.

## Responsive Behavior

The component is fully responsive:
- Mobile: Stacked layout with adjusted spacing
- Tablet: Optimized padding and font sizes
- Desktop: Full layout with maximum spacing

## Styling

The component uses Tailwind CSS and is fully compatible with:
- Tailwind v3
- Tailwind v4
- shadcn/ui theming

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This component is part of the project and follows the same license.
