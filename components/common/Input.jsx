export default function Input({ label, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-[0.9375rem] font-medium text-black">
          {label}
        </label>
      )}

      <input 
        {...props}
        className={`h-14 w-full rounded-xl border border-[var(--color-black-shade-300)] px-5 text-[0.9375rem] font-medium text-[var(--color-black-shade-800)] outline-none focus:border-[var(--color-primary)] ${className}`}
      />
    </div>
  );
}
