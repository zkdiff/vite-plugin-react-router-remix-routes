import { Link, Outlet } from "react-router-dom";

export function Component() {
    return (
        <div>
            <h1>Root Layout</h1>
            <Link to="/app">App</Link>
            <Outlet />
        </div>
    );
}
