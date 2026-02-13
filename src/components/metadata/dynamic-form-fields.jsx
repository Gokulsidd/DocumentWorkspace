// components/metadata/dynamic-form-fields.jsx
"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import useMetadataStore from "@/store/useMetadataStore";
import {
  SingleSelectDropdown,
  MultiSelectDropdown,
  TagsInput,
  MultipleDatePicker,
} from "./field-components";

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

const DynamicFormFields = () => {
  const { selectedTemplate, formData, setFormData } = useMetadataStore();

  const fields = useMemo(
    () => selectedTemplate?.Fields ?? [],
    [selectedTemplate]
  );

  const handleChange = useCallback(
    (fieldId, value) => {
      setFormData(fieldId, value);
    },
    [setFormData]
  );

  if (!selectedTemplate) return null;

  if (fields.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
          No fields available for this template
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-6 bg-gray-50">
        {fields.map((field) => {
          const value = formData[field.ID] ?? (field.IsMultiValue ? [] : "");
          const isFilled = field.IsMultiValue
            ? Array.isArray(value) && value.length > 0
            : String(value).trim() !== "";

          return (
            <div
              key={field.ID}
              className="space-y-3 border-b border-gray-100 pb-6 last:border-none last:pb-0"
            >
              {/* Label Row */}
              <div className="flex flex-wrap items-center gap-2">
                <Label className="flex items-center gap-2 font-medium text-gray-900">
                  {isFilled && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {field.Name}
                  {field.IsRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    {field.PropType}
                  </Badge>
                  {field.IsMultiValue && (
                    <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
                      Multi-value
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {field.Description && (
                <p className="text-xs text-gray-600">{field.Description}</p>
              )}

              {/* Field Renderer */}
              <FieldRenderer
                field={field}
                value={value}
                onChange={(val) => handleChange(field.ID, val)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicFormFields;

/* -------------------------------------------------------------------------- */
/*                               Field Renderer                               */
/* -------------------------------------------------------------------------- */

function FieldRenderer({ field, value, onChange }) {
  const type = field.PropType?.toLowerCase();
  const isMultiValue = field.IsMultiValue;

  // Handle Date fields
  if (type === "date") {
    if (isMultiValue) {
      return (
        <MultipleDatePicker
          value={value}
          onChange={onChange}
          placeholder="Select multiple dates..."
        />
      );
    }
    return <SingleDateField value={value} onChange={onChange} field={field} />;
  }

  // Handle List fields (Dropdown)
  if (type === "list") {
    return (
      <ListField
        field={field}
        value={value}
        onChange={onChange}
        isMultiValue={isMultiValue}
      />
    );
  }

  // Handle String fields
  if (type === "string") {
    if (isMultiValue) {
      return (
        <TagsInput
          value={value}
          onChange={onChange}
          placeholder={`Enter ${field.Name.toLowerCase()} and press Enter...`}
        />
      );
    }
    return <StringField field={field} value={value} onChange={onChange} />;
  }

  // Default fallback
  return (
    <Input
      type="text"
      value={value}
      placeholder={`Enter ${field.Name.toLowerCase()}...`}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white h-10 outline-none"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                            Single Date Field                               */
/* -------------------------------------------------------------------------- */

function SingleDateField({ field, value, onChange }) {
  const date = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 bg-white hover:bg-white",
            !date && "text-gray-500"
          )}
        >
          <CalendarIcon className=" ml-2 h-4 w-4 shrink-0" />
          {date ? format(date, "PPP") : <span>Select a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) =>
            onChange(newDate ? format(newDate, "yyyy-MM-dd") : "")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                            List (Dropdown) Field                           */
/* -------------------------------------------------------------------------- */

function ListField({ field, value, onChange, isMultiValue }) {
  const items = useMemo(() => {
    if (!Array.isArray(field.ListItem)) return [];
    return field.ListItem.map((i) => i.trim()).filter(Boolean);
  }, [field.ListItem]);

  // Multi-value List: Use MultiSelectDropdown
  if (isMultiValue) {
    return (
      <MultiSelectDropdown
        options={items}
        value={value}
        onChange={onChange}
        placeholder={`Select ${field.Name.toLowerCase()}...`}
      />
    );
  }

  // Single-value List: Use SingleSelectDropdown
  return (
    <SingleSelectDropdown
      options={items}
      value={value}
      onChange={onChange}
      placeholder={`Select ${field.Name.toLowerCase()}...`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              String Field                                  */
/* -------------------------------------------------------------------------- */

function StringField({ field, value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={`Enter ${field.Name.toLowerCase()}...`}
      maxLength={field.Length || undefined}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10  px-4 text-gray-700 text-sm bg-white rounded-2xl "
    />
  );
}
