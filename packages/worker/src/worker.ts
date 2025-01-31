export interface Env {
  FILES: KVNamespace;
}

interface FileInfo {
  name: string;
  type: "file" | "directory";
  path: string;
  url: string;
  size: number;
  lastModified: string;
  children?: FileInfo[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname);

    // Handle root path
    if (path === "/" || path === "") {
      return await this.getDirectoryStructure(env);
    }

    // Get file content
    try {
      const fileContent = await env.FILES.get(path.slice(1));
      if (!fileContent) {
        return new Response("File not found", { status: 404 });
      }

      return new Response(fileContent, {
        headers: {
          "content-type": getContentType(path),
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=3600"
        }
      });
    } catch (error) {
      return new Response("Error reading file", { status: 500 });
    }
  },

  async getDirectoryStructure(env: Env): Promise<Response> {
    try {
      const list = await env.FILES.list();
      const structure = this.buildDirectoryStructure(list.keys);

      return new Response(JSON.stringify(structure, null, 2), {
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*"
        }
      });
    } catch (error) {
      return new Response("Error listing files", { status: 500 });
    }
  },

  buildDirectoryStructure(files: { name: string }[]): FileInfo[] {
    const root: { [key: string]: FileInfo } = {};

    // First pass: create all directories and files
    for (const file of files) {
      const parts = file.name.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!root[currentPath]) {
          root[currentPath] = {
            name: part,
            type: isFile ? "file" : "directory",
            path: `/${currentPath}`,
            url: `/${currentPath}`,
            size: 0, // We don't have this info from KV list
            lastModified: new Date().toISOString(), // We don't have this info from KV list
            children: isFile ? undefined : []
          };
        }
      }
    }

    // Second pass: build the tree structure
    const structure: FileInfo[] = [];
    for (const [path, info] of Object.entries(root)) {
      if (!path.includes('/')) {
        structure.push(info);
      } else {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const parent = root[parentPath];
        if (parent && parent.children) {
          parent.children.push(info);
        }
      }
    }

    return structure;
  }
};

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const mimeTypes: { [key: string]: string } = {
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "txt": "text/plain",
    "md": "text/markdown",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
