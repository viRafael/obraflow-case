'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Supplier } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface SupplierComboboxProps {
  id: string;
  value: string;
  suppliers: Supplier[];
  isLoading: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

/** Fornecedor com busca por nome (a lista é pequena: filtra no navegador). */
export function SupplierCombobox({
  id,
  value,
  suppliers,
  isLoading,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = suppliers.find((supplier) => String(supplier.id) === value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur();
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={isLoading}
          className={cn(
            'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30',
            !selected && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {isLoading
              ? 'Carregando fornecedores…'
              : (selected?.name ?? 'Selecione o fornecedor…')}
          </span>
          <ChevronsUpDown
            className="size-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={`${id}-list`}
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar fornecedor…" />
          <CommandList>
            <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.name}
                  onSelect={() => {
                    onChange(String(supplier.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      String(supplier.id) === value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                    aria-hidden="true"
                  />
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
