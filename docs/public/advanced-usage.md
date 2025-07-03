# Advanced Usage

This guide covers advanced DreadCabinet features and patterns for complex file organization scenarios.

## Features Configuration

When creating a DreadCabinet instance using `DreadCabinet.create(options)`, you can provide a `features` array in the `options` object. This array allows you to specify which sets of functionalities and their associated command-line arguments are enabled for that particular instance. This is useful for tailoring DreadCabinet to specific needs or when integrating it into larger applications where only a subset of its capabilities might be required.

If the `features` array is not provided, DreadCabinet typically enables a default set of features.

### Available Feature Flags

The `features` option takes an array of strings. The known feature flags are:

#### `'input'`
Enables core input-related functionalities and CLI options.

**Controls options like:**
- `--input-directory <inputDirectory>` / `-i <inputDirectory>`
- `--recursive` / `-r`
- `--limit <limit>`
- `--concurrency <concurrency>`

#### `'output'`
Enables core output-related functionalities and CLI options.

**Controls options like:**
- `--output-directory <outputDirectory>` / `-o <outputDirectory>`

#### `'structured-output'`
Enables features related to how files are named and organized in the output directory.

**Controls options like:**
- `--output-structure <type>`
- `--output-filename-options [outputFilenameOptions...]`

#### `'extensions'`
Enables filtering of files based on their extensions.

**Controls options like:**
- `--extensions [extensions...]`

#### `'structured-input'`
Enables features for interpreting existing structure in the input directory or filenames, and date-based filtering.

**Controls options like:**
- `--input-structure <type>`
- `--input-filename-options [options...]`
- `--start <date>`
- `--end <date>`

### Example Usage

```javascript
import * as DreadCabinet from '@theunwalked/dreadcabinet';

const instance = DreadCabinet.create({
  defaults: {
    // your defaults
  },
  features: [
    'input',
    'output',
    'extensions'
    // Only enable input, output, and extension filtering
    // Other features like 'structured-output' or 'structured-input' would be disabled
  ],
  addDefaults: false // Often set to false when using features selectively with commander
});

// ... then configure with commander
// const program = new Command();
// await instance.configure(program);
// ...
```

By selectively enabling features, you can create a more streamlined DreadCabinet instance that only exposes the necessary options and behaviors for your specific use case.

## Output Structures in Detail

DreadCabinet can automatically create subdirectories based on file dates. The `--output-structure` option provides intelligent file organization:

### `none` - Flat Structure
All output files go directly into the output directory.

```bash
my-app --output-structure none
```

**Example output:**
```
./organized/
├── 2025-05-13-meeting-notes.md
├── 2025-05-14-project-update.md
└── 2025-05-15-brainstorming.md
```

### `year` - Annual Organization
One subfolder per year. The year is omitted from filenames since it's in the folder name.

```bash
my-app --output-structure year
```

**Example output:**
```
./organized/
├── 2024/
│   ├── 12-31-year-end-review.md
│   └── 12-30-holiday-notes.md
└── 2025/
    ├── 01-01-new-year-goals.md
    └── 05-13-meeting-notes.md
```

### `month` - Monthly Organization (Default)
Subfolders by year and month. Year and month are omitted from filenames.

```bash
my-app --output-structure month
```

**Example output:**
```
./organized/
├── 2024/
│   └── 12/
│       ├── 31-year-end-review.md
│       └── 30-holiday-notes.md
└── 2025/
    ├── 01/
    │   └── 01-new-year-goals.md
    └── 05/
        └── 13-meeting-notes.md
```

### `day` - Daily Organization
Subfolders for year, month, and day. The entire date is encoded in the folder structure.

```bash
my-app --output-structure day
```

**Example output:**
```
./organized/
├── 2024/
│   └── 12/
│       ├── 30/
│       │   └── holiday-notes.md
│       └── 31/
│           └── year-end-review.md
└── 2025/
    ├── 01/
    │   └── 01/
    │       └── new-year-goals.md
    └── 05/
        └── 13/
            └── meeting-notes.md
```

## Filename Options in Detail

The `--output-filename-options` flag determines what elements appear in each final filename. DreadCabinet intelligently handles redundancy based on your chosen output structure.

### Available Components

#### `date`
Prepends the date to the filename, automatically omitting redundant segments based on the folder structure.

- With `--output-structure none`: `2025-05-13-subject.md`
- With `--output-structure year`: `05-13-subject.md`
- With `--output-structure month`: `13-subject.md`
- With `--output-structure day`: `subject.md`

#### `time`
Appends the time in 24-hour format (HHMM) after the date.

```bash
my-app --output-filename-options date time subject
```

**Examples:**
- `2025-05-13-1430-meeting-notes.md`
- `2025-05-13-0900-standup.md`
- `2025-05-13-1800-retrospective.md`

#### `subject`
Adds a subject string derived from file content or metadata.

### Advanced Filename Patterns

#### Time-stamped Files
Perfect for meeting notes or journal entries:

```bash
my-app --output-filename-options date time subject --output-structure month
```

**Result:** `./2025/05/13-1430-meeting-notes.md`

#### Subject-only Organization
When dates are encoded in the folder structure:

```bash
my-app --output-filename-options subject --output-structure day
```

**Result:** `./2025/05/13/meeting-notes.md`

#### Date-only Archives
For timestamped files without descriptive subjects:

```bash
my-app --output-filename-options date time --output-structure year
```

**Result:** `./2025/05-13-1430.md`

## Subject Extraction Strategies

Applications using DreadCabinet can implement various subject extraction strategies:

### 1. YAML Front Matter
Parse YAML at the top of files:

```javascript
await operator.process(async (file) => {
  const content = await fs.readFile(file.path, 'utf8');
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (frontMatterMatch) {
    const yaml = require('js-yaml');
    const metadata = yaml.load(frontMatterMatch[1]);
    
    // Use metadata.title or metadata.subject
    const subject = metadata.title || metadata.subject || 'untitled';
    // Process with subject
  }
});
```

### 2. Markdown Headings
Extract from the first heading:

```javascript
await operator.process(async (file) => {
  const content = await fs.readFile(file.path, 'utf8');
  const headingMatch = content.match(/^#\s+(.+)$/m);
  
  if (headingMatch) {
    const subject = headingMatch[1].trim();
    // Clean and use subject
    const cleanSubject = subject.replace(/[^\w\s-]/g, '').trim();
  }
});
```

### 3. Filename-based
Use the original filename as subject:

```javascript
await operator.process(async (file) => {
  const path = require('path');
  const subject = path.basename(file.path, path.extname(file.path));
  // Clean the subject for use in new filename
  const cleanSubject = subject.replace(/[^\w\s-]/g, '');
});
```

## Date Detection Strategies

### 1. Metadata Dates
Extract from YAML front matter:

```javascript
// Look for various date fields
const dateFields = ['date', 'created', 'timestamp', 'published'];
let fileDate = null;

for (const field of dateFields) {
  if (metadata[field]) {
    fileDate = new Date(metadata[field]);
    break;
  }
}
```

### 2. Content Parsing
Extract dates from file content:

```javascript
// Look for ISO date patterns
const datePattern = /(\d{4}-\d{2}-\d{2})/;
const dateMatch = content.match(datePattern);

if (dateMatch) {
  const fileDate = new Date(dateMatch[1]);
}
```

### 3. Filename Dates
Parse dates from existing filenames:

```javascript
// Parse various filename date formats
const patterns = [
  /(\d{4}-\d{2}-\d{2})/, // 2025-01-15
  /(\d{8})/,             // 20250115
  /(\d{2}-\d{2}-\d{4})/  // 01-15-2025
];

for (const pattern of patterns) {
  const match = filename.match(pattern);
  if (match) {
    // Parse and convert to standard date
    break;
  }
}
```

## Collision Handling

DreadCabinet automatically handles filename collisions:

### Hash-based Collision Resolution
```
2025-05-13-meeting.md
2025-05-13-meeting-a7b9.md
2025-05-13-meeting-c3d4.md
```

### Counter-based Collision Resolution
```
2025-05-13-meeting.md
2025-05-13-meeting-1.md
2025-05-13-meeting-2.md
```

### Custom Collision Handling
Implement your own collision resolution:

```javascript
await operator.process(async (file) => {
  let outputPath = file.outputPath;
  let counter = 1;
  
  while (await fileExists(outputPath)) {
    const parsed = path.parse(file.outputPath);
    outputPath = path.join(
      parsed.dir,
      `${parsed.name}-v${counter}${parsed.ext}`
    );
    counter++;
  }
  
  // Use the collision-free outputPath
  await processFile(file, outputPath);
});
```

## Performance Optimization

### Concurrent Processing
Process multiple files simultaneously:

```javascript
// Process 5 files concurrently
await operator.process(async (file) => {
  await processFile(file);
}, undefined, 5);

// Dynamic concurrency based on system
const os = require('os');
const concurrency = Math.min(os.cpus().length, 8);
await operator.process(processFile, undefined, concurrency);
```

### Memory-Efficient Processing
For large files or many files:

```javascript
await operator.process(async (file) => {
  // Stream large files instead of loading into memory
  const readStream = fs.createReadStream(file.path);
  const writeStream = fs.createWriteStream(file.outputPath);
  
  return new Promise((resolve, reject) => {
    readStream.pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });
});
```

### Selective Processing
Process only what you need:

```javascript
// Skip files that haven't changed
await operator.process(async (file) => {
  const outputExists = await fileExists(file.outputPath);
  if (outputExists) {
    const inputStat = await fs.stat(file.path);
    const outputStat = await fs.stat(file.outputPath);
    
    if (inputStat.mtime <= outputStat.mtime) {
      console.log(`Skipping unchanged file: ${file.path}`);
      return;
    }
  }
  
  await processFile(file);
});
```

## Integration Patterns

### Middleware Pattern
Add processing steps:

```javascript
const middleware = [
  async (file) => {
    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${file.path}`);
    }
  },
  async (file) => {
    // Extract metadata
    file.metadata = await extractMetadata(file.path);
  },
  async (file) => {
    // Transform content
    if (file.extension === 'md') {
      file.html = await markdownToHtml(file.content);
    }
  }
];

await operator.process(async (file) => {
  for (const fn of middleware) {
    await fn(file);
  }
  
  await finalProcessing(file);
});
```

### Plugin Architecture
Create reusable plugins:

```javascript
const plugins = {
  yamlFrontMatter: require('./plugins/yaml-front-matter'),
  imageOptimization: require('./plugins/image-optimization'),
  linkChecking: require('./plugins/link-checking')
};

await operator.process(async (file) => {
  // Apply relevant plugins based on file type
  if (file.extension === 'md') {
    await plugins.yamlFrontMatter(file);
    await plugins.linkChecking(file);
  }
  
  if (isImageFile(file)) {
    await plugins.imageOptimization(file);
  }
  
  await finalProcessing(file);
});
``` 