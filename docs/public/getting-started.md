# Getting Started with DreadCabinet

DreadCabinet is a powerful library designed to be integrated into your own CLI tools. It provides file organization capabilities that help bring order to digital chaos by organizing, renaming, and transforming files based on date, subject, and other metadata.

## What is DreadCabinet?

DreadCabinet is **not** a standalone CLI tool. Instead, it's a TypeScript/JavaScript library that you integrate into your own applications to provide file organization capabilities. This design gives you maximum flexibility to:

- Customize the file processing logic for your specific needs
- Integrate with your existing CLI tools and workflows
- Add file organization capabilities to larger applications
- Maintain full control over the user experience

## Basic Integration

Here's how to integrate DreadCabinet into your CLI application:

### 1. Install DreadCabinet

```bash
npm install @theunwalked/dreadcabinet
```

### 2. Create a Basic CLI Tool

```javascript
import { Command } from 'commander';
import * as DreadCabinet from '@theunwalked/dreadcabinet';

// Create a DreadCabinet instance with default options
const instance = DreadCabinet.create({
  defaults: {
    timezone: 'America/New_York',
    extensions: ['md', 'txt'],
    outputStructure: 'month',
    outputDirectory: './organized',
  }
});

async function main() {
  // Configure your command with DreadCabinet options
  const program = new Command();
  program
    .name('my-organizer')
    .description('Organize files with DreadCabinet')
    .version('1.0.0');
    
  await instance.configure(program);

  // Parse arguments
  program.parse(process.argv);
  const cliArgs = program.opts();

  // Read and validate configuration
  const dreadcabinetConfig = await instance.read(cliArgs);
  const config = instance.applyDefaults(dreadcabinetConfig);
  await instance.validate(config);

  // Create operator and process files
  const operator = await instance.operate(config);
  await operator.process(async (file) => {
    // Your custom file processing logic here
    console.log(`Processing: ${file.path}`);
    
    // Example: Copy file content (you implement this)
    // await copyFileToDestination(file, destinationPath);
  });
}

main().catch(console.error);
```

### 3. Run Your Tool

Once you've created your CLI tool, users can run it like this:

```bash
my-organizer \
  --input-directory ./notes \
  --output-directory ./organized \
  --output-structure month \
  --extensions md txt \
  --recursive
```

## Quick Examples

### Example 1: Simple Note Organizer

```javascript
import * as DreadCabinet from '@theunwalked/dreadcabinet';
import fs from 'fs/promises';
import path from 'path';

const instance = DreadCabinet.create({
  defaults: {
    extensions: ['md'],
    outputStructure: 'month',
    timezone: 'America/New_York'
  }
});

const operator = await instance.operate(config);
await operator.process(async (file) => {
  // Simple file copy
  const content = await fs.readFile(file.path, 'utf8');
  await fs.writeFile(file.outputPath, content);
  console.log(`Organized: ${file.path} → ${file.outputPath}`);
});
```

### Example 2: Processing with Metadata

```javascript
await operator.process(async (file) => {
  // Extract metadata from file content
  const content = await fs.readFile(file.path, 'utf8');
  
  // Parse YAML front matter (implement your own logic)
  const metadata = parseYamlFrontMatter(content);
  
  // Use metadata for custom processing
  if (metadata.tags?.includes('important')) {
    console.log(`⭐ Important file: ${file.path}`);
  }
  
  // Process the file
  await processFile(file, metadata);
});
```

## Understanding the File Processing Flow

When you use DreadCabinet, here's what happens:

1. **Discovery**: DreadCabinet scans the input directory for files matching your criteria (extensions, recursive settings, etc.)

2. **Date Detection**: For each file, DreadCabinet attempts to extract dates from:
   - File metadata/front matter (if you implement parsing)
   - Filename patterns
   - File modification time (as fallback)

3. **Subject Extraction**: DreadCabinet can extract subjects from:
   - File metadata/front matter
   - First line or heading of the file
   - Original filename

4. **Path Generation**: Based on your configuration, DreadCabinet generates:
   - Output directory structure (none/year/month/day)
   - Output filename (with date, time, subject components)

5. **Processing**: Your custom processing function is called for each file with all the computed information

## Next Steps

Now that you understand the basics, explore these topics:

- **[CLI Options Reference](cli-options.md)** - Learn about all available configuration options
- **[Configuration Files](configuration-files.md)** - Use YAML/JSON files for complex configurations
- **[Advanced Usage](advanced-usage.md)** - Advanced patterns and real-world examples
- **[API Reference](api-reference.md)** - Complete API documentation

## Common Patterns

### Date-based Organization

```javascript
// Organize by month with date in filename
const instance = DreadCabinet.create({
  defaults: {
    outputStructure: 'month',           // ./2025/01/
    outputFilenameOptions: ['date', 'subject'],  // 2025-01-15-meeting-notes.md
  }
});
```

### Time-based Filenames

```javascript
// Include time in filenames for detailed tracking
const instance = DreadCabinet.create({
  defaults: {
    outputFilenameOptions: ['date', 'time', 'subject'],  // 2025-01-15-1430-meeting.md
  }
});
```

### Concurrent Processing

```javascript
// Process multiple files simultaneously
await operator.process(async (file) => {
  await processFile(file);
}, undefined, 5); // Process 5 files concurrently
``` 