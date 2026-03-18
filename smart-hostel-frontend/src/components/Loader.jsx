import { Loader2 } from "lucide-react";

export default function Loader({ message, className = "", size = 32, inline = false }) {
  const wrapperClass = inline
    ? `inline-flex items-center justify-center ${className}`
    : `flex flex-col items-center justify-center ${className}`;

  return (
    <div className={wrapperClass}>
      <Loader2 className="animate-spin" size={size} />
      {message && !inline && <p className="mt-2 text-sm text-gray-400">{message}</p>}
    </div>
  );
}
