import { join as joinPath, resolve as resolvePath } from "node:path";

import type * as Vite from "vite";

interface RouteRecord {
  moduleId?: string;
  path?: string;
  id: string;
  file: string;
  parentId?: string;
}

interface RouteRecordWithChildren extends RouteRecord {
  children?: RouteRecordWithChildren[];
}

interface RouteManifest {
  [routeId: string]: RouteRecord;
}

export function reactRouterRemixRoutes(
  convention: (
    appDirectory: string,
    ignoredFilePatterns?: string[],
    prefix?: string,
  ) => RouteManifest,
  appDirectory: string,
  ignoredFilePatterns?: string[],
  prefix?: string,
): Vite.Plugin {
  const virtualModuleId = "react-router-remix-routes";

  const rootDir = resolvePath(appDirectory);

  const routeManifest = convention(rootDir, ignoredFilePatterns, prefix);

  function collectChildren(
    routes: RouteRecord[],
    parentId: string,
  ): RouteRecordWithChildren[] | undefined {
    const children = routes.filter((r) => r.parentId === parentId);

    if (!children.length) return undefined;

    return children.map((route) => ({
      ...route,
      children: collectChildren(routes, route.id),
    }));
  }

  return {
    name: virtualModuleId,
    resolveId: (id) => (id == virtualModuleId ? id : null),
    load(id) {
      if (id !== virtualModuleId) return null;

      const routes = Object.values(routeManifest).map((route, index) => ({
        ...route,
        moduleId: "_" + index,
      }));

      const root = {
        moduleId: "root",
        path: "",
        id: "root",
        file: "root.tsx",
        children: collectChildren(routes, "root"),
      };

      let output = `import * as root from "${joinPath(rootDir, "root.tsx")}"\n`;

      for (const { file, moduleId } of routes) {
        output += `import * as ${moduleId} from "${joinPath(rootDir, file)}"\n`;
      }

      output +=
        "export default " +
        JSON.stringify(root, null, 4).replace(/"moduleId": "(.*)"/g, "...$1");

      return output;
    },
    configureServer(server) {
      function handleFileChange() {
        const module = server.moduleGraph.getModuleById(virtualModuleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }

        server.ws.send({ type: "full-reload", path: "*" });
      }

      server.watcher.on("add", handleFileChange);
      server.watcher.on("unlink", handleFileChange);
    },
  };
}
