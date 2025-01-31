# dir-to-json

A command line tool to convert directory structure and file contents to JSON format.

## Installation

```bash
npm install -g dir-to-json
```

## Usage

```bash
dir-to-json [options] [directory]
```

### Options

- `-c, --content`: Include file contents in the output
- `-s, --max-size <size>`: Maximum file size to include content (in bytes, default: 1MB)
- `-e, --exclude <items>`: Comma-separated list of items to exclude
- `-o, --output <file>`: Output to file instead of stdout

### Examples

1. Convert current directory structure to JSON:
```bash
dir-to-json
```

2. Convert specific directory with file contents:
```bash
dir-to-json -c /path/to/directory
```

3. Convert directory and save to file:
```bash
dir-to-json -o output.json /path/to/directory
```

4. Convert directory excluding specific items:
```bash
dir-to-json -e node_modules,dist,build
```

## Output Format

```typescript
interface FileItem {
    // File or directory name
    name: string;
    
    // Type of the item: "file" or "directory"
    type: "file" | "directory";
    
    // Size in bytes
    size: number;
    
    // Last modified timestamp
    lastModified: string;
    
    // File content (only if --content option is used)
    content?: string;
    
    // Only present if type is "directory"
    children?: FileItem[];
}
```

## License

ISC
