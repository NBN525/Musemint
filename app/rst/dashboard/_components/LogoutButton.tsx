// app/rst/dashboard/_components/LogoutButton.tsx
"use client";

export default function LogoutButton() {
  const doLogout = () => {
    window.location.href = "/rst/logout";
  };
  return (
    <button
      onClick={doLogout}
      className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
      aria-label="Log out"
      title="Log out"
    >
      Log out
    </button>
  );
}
