export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="admin-shell" dir="rtl">{children}</main>;
}
