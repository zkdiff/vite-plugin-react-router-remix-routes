import { Outlet } from "react-router-dom";

export function Component() {
  return (
    <div>
      <h1>App</h1>
      <Outlet />
    </div>
  );
}
