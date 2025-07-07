import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  name?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    value, 
    defaultValue, 
    placeholder = 'Select an option...', 
    disabled = false,
    required = false,
    className,
    onChange,
    name,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');
    const [selectedLabel, setSelectedLabel] = React.useState('');

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    React.useEffect(() => {
      const option = options.find(opt => opt.value === selectedValue);
      setSelectedLabel(option ? option.label : '');
    }, [selectedValue, options]);

    const handleSelect = (optionValue: string, optionLabel: string) => {
      setSelectedValue(optionValue);
      setSelectedLabel(optionLabel);
      setIsOpen(false);
      onChange?.(optionValue);
    };

    return (
      <div className="relative">
        {/* Hidden native select for form submission */}
        <select
          ref={ref}
          name={name}
          value={selectedValue}
          onChange={() => {}} // Controlled by custom logic
          required={required}
          className="sr-only"
          tabIndex={-1}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom select display */}
        <button
          type="button"
          className={cn(
            'relative w-full cursor-default rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={cn(
            'block truncate',
            !selectedLabel && 'text-gray-500'
          )}>
            {selectedLabel || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown 
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
              aria-hidden="true" 
            />
          </span>
        </button>

        {/* Dropdown options */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Options list */}
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left transition-colors duration-150',
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : selectedValue === option.value
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value, option.label)}
                  disabled={option.disabled}
                >
                  <span className="block truncate font-normal">
                    {option.label}
                  </span>
                  {selectedValue === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Check className="h-5 w-5 text-purple-600" aria-hidden="true" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;