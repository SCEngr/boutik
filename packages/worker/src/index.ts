import { DirToJson, FileInfo } from '@boutik/dir-to-json';

interface Env {
  FILES: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET') {
      if (path === '/api/files') {
        try {
          const files = await env.FILES.get('files');
          if (!files) {
            return new Response('No files found', { status: 404 });
          }
          return new Response(files, {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response('Internal Server Error', { status: 500 });
        }
      }

      if (path.startsWith('/api/file/')) {
        const filePath = decodeURIComponent(path.replace('/api/file/', ''));
        try {
          const file = await env.FILES.get(`file:${filePath}`);
          if (!file) {
            return new Response('File not found', { status: 404 });
          }
          return new Response(file, {
            headers: { 'Content-Type': 'application/octet-stream' },
          });
        } catch (error) {
          return new Response('Internal Server Error', { status: 500 });
        }
      }
    }

    if (request.method === 'POST' && path === '/api/sync') {
      const { directory } = await request.json();
      if (!directory) {
        return new Response('Directory path is required', { status: 400 });
      }

      try {
        const dirToJson = new DirToJson({ includeContent: true });
        const structure = await dirToJson.toJson(directory);
        
        // Store the directory structure
        await env.FILES.put('files', JSON.stringify(structure));

        // Store individual files
        await storeFiles(env.FILES, structure, '');

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response('Failed to process directory', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function storeFiles(kv: KVNamespace, files: FileInfo[], basePath: string) {
  for (const file of files) {
    const currentPath = basePath ? `${basePath}/${file.name}` : file.name;
    
    if (file.type === 'file' && file.content) {
      await kv.put(`file:${currentPath}`, file.content);
    }
    
    if (file.type === 'directory' && file.children) {
      await storeFiles(kv, file.children, currentPath);
    }
  }
}
