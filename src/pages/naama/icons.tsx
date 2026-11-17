interface IconProps {
  className?: string;
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15.8 15.8 L20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function MicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3.5" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 11.5a5 5 0 0 0 10 0M12 16.5V20M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlantIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20V11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 14c-3.2.2-5 2.2-5.4 5.2 2.8-.2 4.6-1.6 5.4-3.6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12c3-.4 5.2-2.2 5.6-5.4-2.8.3-4.7 1.8-5.6 4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 15.2c-2.4-1.6-3.2-3.6-2.6-6.2 2.2.6 3.4 2.2 2.6 4.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5s5.2 6 5.2 9.4A5.2 5.2 0 0 1 12 18.1a5.2 5.2 0 0 1-5.2-5.2C6.8 9.5 12 3.5 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function ExpandIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4.5H6.2A1.7 1.7 0 0 0 4.5 6.2V9M15 4.5h2.8a1.7 1.7 0 0 1 1.7 1.7V9M9 19.5H6.2a1.7 1.7 0 0 1-1.7-1.7V15M15 19.5h2.8a1.7 1.7 0 0 0 1.7-1.7V15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 6.5 9 12l5.5 5.5M9.2 12H19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 9.5 12 15l5.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 6.5 9 12l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 19.2c.8-2.8 2.9-4.2 5.8-4.2s5 1.4 5.8 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LanguageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 12h16M12 4c2.2 2.2 3.2 5 3.2 8s-1 5.8-3.2 8c-2.2-2.2-3.2-5-3.2-8s1-5.8 3.2-8Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SortIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6v12M8 6 5.5 8.5M8 6l2.5 2.5M16 18V6M16 18l-2.5-2.5M16 18l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5 19 19.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.2 9.4A3.2 3.2 0 0 0 12 15.2c.7 0 1.3-.2 1.8-.6M6 8.2C4.4 9.5 3.2 11.1 3 12c.8 2.6 4.2 6 9 6 1.3 0 2.5-.3 3.6-.8M10 6.2c.6-.1 1.3-.2 2-.2 4.8 0 8.2 3.4 9 6-.3.9-1.1 2.1-2.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ZoomInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.6 14.6 19 19M10.5 8.2v4.6M8.2 10.5h4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ZoomOutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.6 14.6 19 19M8.2 10.5h4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function VolumeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 9.5h3.2L12 6.2v11.6l-4.3-3.3H4.5v-5Z" fill="currentColor" />
      <path d="M15 9.2a3.4 3.4 0 0 1 0 5.6M17.2 7a6 6 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="6.2" r="2.2" fill="currentColor" />
      <path d="M7.2 19.5v-1.2c0-2.2 2-3.8 4.8-3.8s4.8 1.6 4.8 3.8v1.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="5.2" cy="10" r="1.5" fill="currentColor" />
      <circle cx="18.8" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function HandIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 11.2V6.8a1.3 1.3 0 0 1 2.6 0v3.6M10.8 10V5.6a1.3 1.3 0 0 1 2.6 0V10M13.4 10.2V6.8a1.3 1.3 0 0 1 2.6 0v6.2M8.2 12.2l-1.6-1.4a1.3 1.3 0 0 0-1.9 1.8l3.2 4.2c.6 1 1.8 1.7 3.1 1.7h3.4c2 0 3.4-1.6 3.4-3.4v-4.2a1.3 1.3 0 0 0-2.6 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16.5 4.2 19.2c-.3.5.1 1.1.7.9L8.6 19A8 8 0 1 0 6 16.5Z" fill="currentColor" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.2 13.8a4 4 0 0 0 5.6 0l2.2-2.2a4 4 0 0 0-5.6-5.6l-1.1 1.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.8 10.2a4 4 0 0 0-5.6 0L6 12.4a4 4 0 0 0 5.6 5.6l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
