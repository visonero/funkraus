"use client";

export default function DeleteButton({
  action,
  confirmText,
  style,
  children,
}: {
  action: () => void | Promise<void>;
  confirmText: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" style={style}>
        {children}
      </button>
    </form>
  );
}
