// components/metadata/field-components.jsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Check, ChevronsUpDown, CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/* -------------------------------------------------------------------------- */
/*                          Single-Select Dropdown                            */
/* -------------------------------------------------------------------------- */

export function SingleSelectDropdown({ options = [], value = "", onChange, placeholder = "Select an item..." }) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange("");
  }, [onChange]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    return options.find(opt => opt === value) || value;
  }, [value, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 bg-white hover:bg-white"
        >
          <span className={cn("truncate", !selectedLabel && "text-gray-400 font-normal")}>
            {selectedLabel || placeholder}
          </span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {value && (
              <button
                onClick={handleClear}
                className="hover:bg-gray-200 rounded p-1"
                type="button"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl" align="start">
        <Command className={'rounded-2xl'}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty className={'p-4 pt-10 text-center text-sm text-gray-500 h-[80px]'}>No items found.</CommandEmpty>
          <CommandList className="max-h-[200px]">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Multi-Select Dropdown                             */
/* -------------------------------------------------------------------------- */

export function MultiSelectDropdown({ options = [], value = [], onChange, placeholder = "Select items..." }) {
  const [open, setOpen] = useState(false);

  // Ensure value is always an array
  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return [];
  }, [value]);

  const handleToggle = useCallback((item) => {
    const newValues = selectedValues.includes(item)
      ? selectedValues.filter((v) => v !== item)
      : [...selectedValues, item];
    onChange(newValues);
  }, [selectedValues, onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange([]);
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] py-2 bg-white hover:bg-white"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="mr-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  {item}
                  <button
                    className="ml-1 hover:bg-blue-300 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-gray-400 font-normal">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {selectedValues.length > 0 && (
              <button
                onClick={handleClear}
                className="hover:bg-gray-200 rounded p-1"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl" align="start">
        <Command className={'rounded-2xl'}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty className="p-4 pt-10 text-center text-sm text-gray-500 h-[80px]">No items found.</CommandEmpty>
          <CommandList className="max-h-[200px]">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleToggle(option)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={selectedValues.includes(option)}
                    className="mr-2"
                  />
                  <span className="flex-1">{option}</span>
                  {selectedValues.includes(option) && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Tags Input                                   */
/* -------------------------------------------------------------------------- */

export function TagsInput({ value = [], onChange, placeholder = "Type and press Enter..." }) {
  const [inputValue, setInputValue] = useState("");

  // Ensure value is always an array
  const tags = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return [];
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }, [inputValue, tags, onChange]);

  const handleRemove = useCallback((tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }, [tags, onChange]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border rounded-2xl bg-white focus-within:ring-.5 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[40px]">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1"
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              className="ml-1 hover:bg-blue-300 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-30 outline-none  text-sm py-1 rounded-2xl bg-white"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Press Enter to add tags</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Multiple Date Picker                              */
/* -------------------------------------------------------------------------- */

export function MultipleDatePicker({ value = [], onChange, placeholder = "Select dates..." }) {
  const [open, setOpen] = useState(false);

  // Ensure value is always an array of Date objects
  const selectedDates = useMemo(() => {
    if (!Array.isArray(value)) {
      return value ? [new Date(value)] : [];
    }
    return value.map((d) => (d instanceof Date ? d : new Date(d)));
  }, [value]);

  const handleSelect = useCallback((date) => {
    if (!date) return;

    const dateString = format(date, "yyyy-MM-dd");
    const existingIndex = selectedDates.findIndex(
      (d) => format(d, "yyyy-MM-dd") === dateString
    );

    let newDates;
    if (existingIndex >= 0) {
      // Remove if already selected
      newDates = selectedDates.filter((_, i) => i !== existingIndex);
    } else {
      // Add new date
      newDates = [...selectedDates, date];
    }

    // Sort dates
    newDates.sort((a, b) => a - b);

    // Convert to strings for storage
    onChange(newDates.map((d) => format(d, "yyyy-MM-dd")));
  }, [selectedDates, onChange]);

  const handleRemove = useCallback((index) => {
    const newDates = selectedDates.filter((_, i) => i !== index);
    onChange(newDates.map((d) => format(d, "yyyy-MM-dd")));
  }, [selectedDates, onChange]);

  const isDateSelected = useCallback((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return selectedDates.some((d) => format(d, "yyyy-MM-dd") === dateString);
  }, [selectedDates]);

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 bg-white hover:bg-white",
              selectedDates.length === 0 && "text-gray-500"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
            <div className="flex items-center gap-1 flex-1">
              {selectedDates.length > 0 ? (
                <span className="text-sm">
                  {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
                </span>
              ) : (
                <span className="text-gray-400 font-normal">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDates[0]}
            onSelect={handleSelect}
            modifiers={{
              selected: (date) => isDateSelected(date),
            }}
            modifiersClassNames={{
              selected: "bg-blue-600 text-white hover:bg-blue-700",
            }}
            initialFocus
          />
          <div className="p-3 border-t">
            <p className="text-xs text-gray-600 mb-2">
              Click dates to select/deselect multiple
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {selectedDates.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
          {selectedDates.map((date, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {format(date, "MMM dd, yyyy")}
              <button
                onClick={() => handleRemove(index)}
                className="ml-1 hover:bg-blue-300 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
