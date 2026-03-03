import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
  MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";

type Option = { label: string; value: string; [k: string]: any };

interface Props {
  options: Option[];
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  loading?: boolean;
  displayKey?: string;
  valueKey?: string;
}

const SearchableSelect: React.FC<Props> = ({
  options = [],
  value = null,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  error = false,
  helperText = "",
  loading = false,
  displayKey = "label",
  valueKey = "value",
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Save/restore scroll position briefly to guard against unwanted auto-scroll
  const savedScroll = useRef({ x: 0, y: 0 });

  const selectedLabel =
    options.find((o) => String(o[valueKey]) === String(value))?.[displayKey] ??
    placeholder;

  const filtered = filter
    ? options.filter(
        (o) =>
          String(o[displayKey]).toLowerCase().includes(filter.toLowerCase()) ||
          String(o[valueKey]).toLowerCase().includes(filter.toLowerCase())
      )
    : options;

  const getScrollParent = useCallback((element: HTMLElement): HTMLElement | Window => {
    if (!element) {
      return window;
    }

    // Check the element itself
    const style = window.getComputedStyle(element);
    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      return element;
    }

    // Traverse up to find the nearest scrolling ancestor
    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.overflowY === "auto" || parentStyle.overflowY === "scroll") {
        return parent;
      }
      parent = parent.parentElement;
    }

    return window;
  }, []);

  const updatePosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // For fixed positioning, use viewport-relative coords (no + scrollX/Y)
    setCoords({
      top: r.bottom,
      left: r.left,
      width: r.width,
    });
  }, []);

  // open/close: update position and focus search input WITHOUT scrolling
  const openDropdown = useCallback(() => {
    if (disabled) return;
    // save current scroll
    savedScroll.current = { x: window.scrollX, y: window.scrollY };
    setOpen(true);
    // wait for next tick and compute position then focus without scroll
    requestAnimationFrame(() => {
      updatePosition();
      // focus search input without scrolling the page
      if (searchRef.current?.focus) {
        try {
          // modern browsers support preventScroll option
          searchRef.current.focus({ preventScroll: true });
          // place caret at end
          const len = searchRef.current.value.length;
          searchRef.current.setSelectionRange(len, len);
        } catch {
          // fallback: focus then immediately restore scroll
          searchRef.current.focus();
          window.scrollTo(savedScroll.current.x, savedScroll.current.y);
        }
      }
      // small guard to re-apply original scroll
      requestAnimationFrame(() =>
        window.scrollTo(savedScroll.current.x, savedScroll.current.y)
      );
    });
  }, [disabled, updatePosition]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFilter("");
    setHighlighted(null);
    // restore scroll to be safe
    window.scrollTo(savedScroll.current.x, savedScroll.current.y);
  }, []);

  // toggle used by trigger click
  const toggle = (e?: MouseEvent) => {
    // prevent default click behaviors that may cause scroll
    e?.preventDefault();
    e?.stopPropagation();
    if (open) closeDropdown();
    else openDropdown();
  };

  // click outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(t) &&
        triggerRef.current &&
        !triggerRef.current.contains(t)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, closeDropdown]);

  // reposition on scroll/resize (now handles nearest scroll parent + window)
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const scrollParent = getScrollParent(triggerRef.current);
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    // Always listen to resize
    window.addEventListener("resize", handleResize);

    if (scrollParent === window) {
      // Listen to window scroll
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      // Listen to scroll parent's scroll
      (scrollParent as HTMLElement).addEventListener("scroll", handleScroll, { passive: true });
      // Also listen to window scroll for outer scrolls
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Initial update
    updatePosition();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (scrollParent === window) {
        window.removeEventListener("scroll", handleScroll);
      } else {
        (scrollParent as HTMLElement).removeEventListener("scroll", handleScroll);
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [open, updatePosition, getScrollParent]);

  // Option select handler — use mousedown to prevent focus-switch scroll, and click to set
  const handleOptionMouseDown = (e: React.MouseEvent) => {
    // Prevent default focus/scroll behavior before click handler runs
    e.preventDefault();
  };

  const handleOptionClick = (val: string) => {
    // save scroll, apply change, close, then restore scroll to be safe
    savedScroll.current = { x: window.scrollX, y: window.scrollY };
    onChange(val);
    // small delay to ensure any focus side-effects finish, then restore scroll
    requestAnimationFrame(() => {
      closeDropdown();
      requestAnimationFrame(() =>
        window.scrollTo(savedScroll.current.x, savedScroll.current.y)
      );
    });
  };

  // keyboard navigation inside dropdown
  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openDropdown();
      setHighlighted(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openDropdown();
      setHighlighted(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!open) openDropdown();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => {
        const next = prev == null ? 0 : Math.min(filtered.length - 1, prev + 1);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => {
        const next = prev == null ? filtered.length - 1 : Math.max(0, prev - 1);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted != null && filtered[highlighted]) {
        handleOptionClick(String(filtered[highlighted][valueKey]));
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  };

  // render dropdown portal
  const dropdown = open ? (
    createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed", // Changed to fixed for viewport-relative positioning
          top: coords.top,
          left: coords.left,
          width: coords.width,
          zIndex: 99999,
        }}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden"
        role="listbox"
        aria-activedescendant={
          highlighted != null ? `opt-${highlighted}` : undefined
        }
        onMouseDown={(e) => {
          // prevent clicks inside dropdown from causing focus jumps in some browsers
          e.stopPropagation();
        }}
      >
        <div className="p-2 border-b bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              value={filter}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilter(e.target.value)
              }
              onKeyDown={onSearchKeyDown}
              placeholder="Search..."
              // DON'T set autoFocus; we manually focus with preventScroll when opening
              // Prevent default mousedown from stealing focus & causing scroll
              onMouseDown={(e) => e.preventDefault()}
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none h-9 bg-white dark:bg-gray-800"
            />
            {filter ? (
              <button
                onClick={() => {
                  setFilter("");
                  // keep focus on input but don't scroll
                  try {
                    searchRef.current?.focus({ preventScroll: true });
                  } catch {
                    searchRef.current?.focus();
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((opt, idx) => {
              const isActive = String(opt[valueKey]) === String(value);
              const isHighlighted = idx === highlighted;
              return (
                <div
                  id={`opt-${idx}`}
                  key={String(opt[valueKey]) + "-" + idx}
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={handleOptionMouseDown} // prevent focus/scroll side effects
                  onClick={() => handleOptionClick(String(opt[valueKey]))}
                  onMouseEnter={() => setHighlighted(idx)}
                  className={`px-3 py-2 text-sm cursor-pointer select-none ${
                    isActive ? "bg-blue-100 text-blue-700" : ""
                  } ${isHighlighted ? "bg-blue-50" : ""}`}
                >
                  {opt[displayKey]}
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`relative w-full text-sm ${className}`}>
      <div
        ref={triggerRef}
        onClick={(e) => toggle(e as unknown as MouseEvent)}
        onKeyDown={onTriggerKeyDown}
        // keep tabIndex removed or -1 so browsers won't try to scroll it into view
        tabIndex={-1}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border rounded-md shadow-sm
          flex items-center justify-between cursor-pointer
          ${disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          ${open ? "border-blue-500 dark:border-blue-400 ring-1 ring-blue-500" : ""}
          focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 transition-colors`}
      >
        <span
          className={`block truncate ${
            !value ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {loading ? "Loading..." : selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ${open ? "rotate-180" : ""}`} />
      </div>

      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
          {helperText}
        </p>
      )}

      {dropdown}
    </div>
  );
};

export default SearchableSelect;