import { validateCNPJ, validateCEP, validateEmail, validatePhone } from "@/lib/validation";

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  errorMessage?: string;
}

export type ValidationRules<T> = Partial<Record<keyof T, ValidationRule>>;

export function useModuleValidation<T extends Record<string, any>>(rules: ValidationRules<T>) {
  const validate = (data: T): Partial<Record<keyof T, string>> => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [key, rule] of Object.entries(rules)) {
      const value = data[key as keyof T];
      const fieldKey = key as keyof T;

      if (rule?.required && (!value || (typeof value === "string" && !value.trim()))) {
        errors[fieldKey] = rule.errorMessage || "Campo obrigatório";
        continue;
      }

      if (value && typeof value === "string") {
        if (rule?.pattern && !rule.pattern.test(value)) {
          errors[fieldKey] = rule.errorMessage || "Valor inválido";
        }

        if (rule?.custom && !rule.custom(value)) {
          errors[fieldKey] = rule.errorMessage || "Valor inválido";
        }
      }
    }

    return errors;
  };

  const validateField = (key: keyof T, value: any): string | undefined => {
    const rule = rules[key];
    if (!rule) return undefined;

    if (rule.required && (!value || (typeof value === "string" && !value.trim()))) {
      return rule.errorMessage || "Campo obrigatório";
    }

    if (value && typeof value === "string") {
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.errorMessage || "Valor inválido";
      }

      if (rule.custom && !rule.custom(value)) {
        return rule.errorMessage || "Valor inválido";
      }
    }

    return undefined;
  };

  return {
    validate,
    validateField,
  };
}

// Predefined validation rules for common Brazilian fields
export const commonValidationRules: Record<string, ValidationRule> = {
  cnpj: {
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    custom: validateCNPJ,
    errorMessage: "CNPJ inválido",
  },

  cep: {
    pattern: /^\d{5}-\d{3}$/,
    custom: validateCEP,
    errorMessage: "CEP inválido",
  },

  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: validateEmail,
    errorMessage: "E-mail inválido",
  },

  phone: {
    custom: validatePhone,
    errorMessage: "Telefone inválido",
  },

  required: {
    required: true,
    errorMessage: "Campo obrigatório",
  },
};
