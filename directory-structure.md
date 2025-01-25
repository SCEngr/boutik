# Directory Structure API Specification

## Base URL
Default: `http://localhost:9989`

## Endpoints

### 1. Get Directory Structure
- **URL:** `/`
- **Method:** `GET`
- **Response Format:** `application/json`

#### Response Structure
```typescript
interface FileItem {
    // File or directory name
    name: string;
    
    // Type of the item: "file" or "directory"
    type: "file" | "directory";
    
    // URL to access the content of this item
    url: string;
    
    // Size in bytes
    size: number;
    
    // Last modified timestamp
    lastModified: string;
    
    // Only present if type is "directory"
    children?: FileItem[];
}

type Response = FileItem[];
```

#### Example Response
```json
[
    {
        "name": "example.txt",
        "type": "file",
        "url": "/content/example.txt",
        "size": 1024,
        "lastModified": "2025-01-25T04:14:12.000Z"
    },
    {
        "name": "images",
        "type": "directory",
        "url": "/content/images",
        "size": 4096,
        "lastModified": "2025-01-25T04:14:12.000Z",
        "children": [
            {
                "name": "photo.jpg",
                "type": "file",
                "url": "/content/images/photo.jpg",
                "size": 2048,
                "lastModified": "2025-01-25T04:14:12.000Z"
            }
        ]
    }
]
```

### 2. Get File Content
- **URL:** `/content/:path`
- **Method:** `GET`
- **Response Format:** `application/json`

#### Response Structure
```typescript
interface ContentResponse {
    // File content as string
    content: string;
}

interface ErrorResponse {
    // Error message if request fails
    error: string;
}
```

#### Example Success Response
```json
{
    "content": "This is the content of the file..."
}
```

#### Example Error Response
```json
{
    "error": "File not found"
}
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (e.g., trying to get content of a directory)
- `404`: File or Directory Not Found
- `500`: Server Error

### Common Error Messages
- "File not found"
- "Path is a directory"
- "Access denied"

## Notes

1. **Hidden Files**
   - Files/directories starting with `.` are excluded
   - `node_modules` directory is excluded

2. **CORS**
   - Cross-Origin Resource Sharing (CORS) is enabled for all origins

3. **URL Encoding**
   - All paths in URLs should be properly encoded
   - Example: Spaces should be encoded as `%20`

4. **Size**
   - File size is in bytes
   - Directory size is typically 4096 bytes (platform dependent)

5. **Timestamps**
   - All timestamps are in ISO 8601 format
   - Example: "2025-01-25T04:14:12.000Z"

## Command Line Options

```bash
serve-files [options]

Options:
  -p, --port <number>  Port to run server on (default: "9989")
  -d, --dir <path>     Directory to serve (default: current directory)
  -h, --help          Display help for command
```
