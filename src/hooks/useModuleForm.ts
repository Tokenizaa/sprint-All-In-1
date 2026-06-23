import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ModuleRecord } from "@/lib/store";
import { addRecord, updateRecord } from "@/lib/store";

type Mode<T> = { kind: "create" } | { kind: "edit"; record: ModuleRecord };

export interface UseModuleFormOptions<T> {
  moduleKey: string;
  initialData: T;
  toRecord: (data: T) => { name: string; meta?: Record<string, string> };
  validate?: (data: T) => Partial<Record<keyof T, string>>;
  onSuccess?: () => void;
}

export function useModuleForm<T extends Record<string, any>>({
  moduleKey,
  initialData,
  toRecord,
  validate,
  onSuccess,
}: UseModuleFormOptions<T>) {
  const navigate = useNavigate();
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setField = useCallback(<K extends keyof T>(k: K, v: T[K]) => {
    setData((s) => ({ ...s, [k]: v }));
    // Clear error when field is modified
    if (errors[k]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }, [errors]);

  const canSave = validate ? Object.keys(validate(data)).length === 0 : true;

  const submit = useCallback((mode: Mode<T>) => {
    // Run validation if provided
    if (validate) {
      const validationErrors = validate(data);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    const record = toRecord(data);

    if (mode.kind === "create") {
      addRecord(moduleKey as any, record.name, record.meta);
    } else {
      updateRecord(moduleKey as any, mode.record.id, record);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      // Default navigation
      navigate({ to: `/${moduleKey}` });
    }
  }, [validate, data, toRecord, moduleKey, onSuccess, navigate]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    data,
    setData,
    errors,
    setErrors,
    setField,
    canSave,
    submit,
    reset,
  };
}
