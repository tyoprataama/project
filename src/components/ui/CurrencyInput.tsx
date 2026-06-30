import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";

// Pemisah ribuan gaya Indonesia: 1000000 -> 1.000.000
const groupThousands = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

interface CurrencyInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  className?: string;
  placeholder?: string;
  required?: boolean | string;
  /** Awalan, mis. "Rp". Kosongkan untuk angka biasa (kg, dll). */
  prefix?: string;
  id?: string;
}

// Input angka dengan format ribuan otomatis saat mengetik.
// Nilai yang tersimpan ke form tetap berupa number murni.
export function CurrencyInput<T extends FieldValues>({
  control,
  name,
  className = "",
  placeholder,
  required,
  prefix,
  id,
}: CurrencyInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required } : undefined}
      render={({ field }) => {
        const raw = field.value;
        const display =
          raw === undefined || raw === null || raw === ""
            ? ""
            : groupThousands(String(raw).replace(/\D/g, ""));
        return (
          <div className="relative">
            {prefix ? (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                {prefix}
              </span>
            ) : null}
            <input
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={placeholder}
              value={display}
              onBlur={field.onBlur}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                field.onChange(digits === "" ? undefined : Number(digits));
              }}
              className={`${prefix ? "pl-9 " : ""}${className}`}
            />
          </div>
        );
      }}
    />
  );
}
