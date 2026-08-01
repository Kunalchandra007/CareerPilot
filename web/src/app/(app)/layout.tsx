// The (app) route group exists to hold the dashboard home at `/today`
// (web/src/app/(app)/today/page.tsx). App chrome (AppShell) is applied globally by
// the root layout, which renders it for every route except the `/` landing page —
// so this group layout is a plain pass-through and must NOT wrap AppShell again,
// or `/today` would get a doubled shell. Route groups don't affect URLs.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
