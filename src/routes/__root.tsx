import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="w-full h-full dungeon-bg relative">
      <Outlet />
    </div>
  );
}
