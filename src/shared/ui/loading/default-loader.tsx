export function DefaultLoader() {
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-50 overflow-hidden bg-transparent">
      <div className="h-full w-full bg-brand animate-loading-bar" />
    </div>
  );
}
