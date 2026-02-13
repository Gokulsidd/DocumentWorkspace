// components/metadata/metadata-form.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  FileText,
  RefreshCcw,
  Save,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import TemplateSelector from "./template-selector";
import DynamicFormFields from "./dynamic-form-fields";
import useMetadataStore from "@/store/useMetadataStore";

const MetadataForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedTemplate,
    formData,
    error,
    successMessage,
    loading,
    validateForm,
    resetFormData,
    setError,
    setSuccessMessage,
    clearMessages,
  } = useMetadataStore();

  /* -------------------------------- effects ------------------------------- */

  useEffect(() => {
    if (!error && !successMessage) return;

    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, successMessage, clearMessages]);

  /* -------------------------------- handlers ------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        templateId: selectedTemplate.ID,
        templateName: selectedTemplate.Name,
        metadata: formData,
        timestamp: new Date().toISOString(),
      };

      console.log("Submitting metadata:", payload);

      await new Promise((r) => setTimeout(r, 1500));
      setSuccessMessage("Metadata saved successfully!");
    } catch (err) {
      setError(err?.message || "Failed to save metadata");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetFormData();
    clearMessages();
  };

  /* -------------------------------- metrics -------------------------------- */

  const filledFieldsCount = selectedTemplate?.Fields?.filter((field) => {
    const value = formData[field.ID];
    if (field.IsMultiValue) {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== null && value !== undefined && String(value).trim() !== "";
  }).length ?? 0;

  const totalFieldsCount = selectedTemplate?.Fields?.length ?? 0;

  const progressPercentage =
    totalFieldsCount > 0
      ? Math.round((filledFieldsCount / totalFieldsCount) * 100)
      : 0;

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      <div className="mx-auto max-w-5xl w-full h-full flex flex-col px-6 py-6 gap-4">
        <form onSubmit={handleSubmit} className="h-full flex flex-col gap-4">

          {/* ------------------------------- Alerts ------------------------------ */}
          {error && (
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/40 shadow-sm shrink-0">
              <CardContent className="flex gap-3 py-4 px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {successMessage && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/40 shadow-sm shrink-0">
              <CardContent className="flex gap-3 py-4 px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Success</p>
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* -------------------------- Template Selector ------------------------- */}
          <div className="shrink-0">
            <TemplateSelector />
          </div>


          {/* -------------------------- Dynamic Fields ---------------------------- */}
          {selectedTemplate && (
            <Card className="border-gray-200 bg-gray-50 rounded-2xl shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
              <DynamicFormFields />
            </Card>
          )}

          {/* -------------------------- Action Buttons ---------------------------- */}
          {selectedTemplate && (
            <div className="shrink-0">
              <Card className="rounded-2xl border-gray-200 shadow-lg bg-white">
                <CardContent className="flex flex-col items-center justify-between gap-3 py-3 px-4 sm:flex-row">
                  <div className="hidden text-sm text-gray-600 sm:block">
                    {progressPercentage === 100 ? (
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        All fields completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        {totalFieldsCount - filledFieldsCount} field(s) remaining
                      </span>
                    )}
                  </div>

                  <div className="flex w-full gap-3 sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSubmitting || loading}
                      className="flex-1 gap-2 sm:flex-none hover:bg-gray-100 transition-colors"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Reset
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600/80 sm:flex-none transition-colors rounded-2xl text-sm w-40"
                    >
                      {isSubmitting || loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Metadata
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ----------------------------- Empty State ---------------------------- */}
          {!selectedTemplate && (
            <Card className="rounded-2xl border-2 border-dashed border-gray-300 bg-white shadow-sm">
              <CardContent className="py-16 text-center space-y-4">
                <div className="mx-auto inline-flex rounded-2xl bg-gradient-to-r from-white to-white p-6">
                  <FileText className="h-16 w-16 text-gray-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    No Template Selected
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                    Select a template from the dropdown above to begin adding document metadata.
                    Each template contains specific fields tailored to different document types.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default MetadataForm;
