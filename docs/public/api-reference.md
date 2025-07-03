# API Reference

This page provides comprehensive documentation for DreadCabinet's programmatic API.

## Main API

### `DreadCabinet.create(options)`

Creates a new DreadCabinet instance with the specified configuration.

**Parameters:**
- `options` (object): Configuration options for the instance

**Returns:** DreadCabinet instance

**Example:**
```javascript
import * as DreadCabinet from '@theunwalked/dreadcabinet';

const instance = DreadCabinet.create({
  defaults: {
    timezone: 'America/New_York',
    extensions: ['md', 'txt'],
    outputStructure: 'month',
  },
  features: ['input', 'output', 'structured-output'],
  addDefaults: false
});
```

#### Options Properties

##### `defaults` (object)
Default values for DreadCabinet configuration options.

**Available defaults:**
```javascript
{
  inputDirectory: './',
  outputDirectory: './',
  outputStructure: 'month',
  outputFilenameOptions: ['date', 'subject'],
  extensions: ['md'],
  recursive: false,
  timezone: 'Etc/UTC',
  limit: undefined,
  concurrency: 1,
  inputStructure: 'month',
  inputFilenameOptions: ['date', 'subject'],
  start: undefined,
  end: undefined
}
```

##### `features` (string[])
Array of feature flags to enable. See [Advanced Usage](advanced-usage.md#features-configuration) for details.

**Available features:**
- `'input'` - Input-related options
- `'output'` - Output-related options  
- `'structured-output'` - Output structure and filename options
- `'extensions'` - File extension filtering
- `'structured-input'` - Input structure and date filtering

##### `allowed` (object)
Constraints on allowed values for configuration options.

**Example:**
```javascript
{
  allowed: {
    extensions: ['md', 'txt', 'markdown'],
    outputStructure: ['none', 'year', 'month', 'day']
  }
}
```

##### `addDefaults` (boolean)
Whether to automatically add default values when configuring CLI options. Set to `false` when using with external configuration libraries like Cardigantime.

## Instance Methods

### `instance.configure(program)`

Configures a Commander.js program with DreadCabinet's CLI options.

**Parameters:**
- `program` (Commander.Program): Commander.js program instance

**Returns:** Promise<void>

**Example:**
```javascript
import { Command } from 'commander';

const program = new Command();
await instance.configure(program);
```

### `instance.read(cliArgs)`

Reads DreadCabinet configuration from CLI arguments.

**Parameters:**
- `cliArgs` (object): Parsed CLI arguments from Commander.js

**Returns:** Promise<object> - DreadCabinet configuration object

**Example:**
```javascript
program.parse(process.argv);
const cliArgs = program.opts();
const config = await instance.read(cliArgs);
```

### `instance.applyDefaults(config)`

Applies default values and transformations to a configuration object.

**Parameters:**
- `config` (object): Configuration object

**Returns:** object - Configuration with defaults applied

**Example:**
```javascript
const configWithDefaults = instance.applyDefaults(config);
```

### `instance.validate(config)`

Validates a configuration object against DreadCabinet's schema.

**Parameters:**
- `config` (object): Configuration object to validate

**Returns:** Promise<object> - Validated configuration object

**Throws:** Error if validation fails

**Example:**
```javascript
try {
  const validatedConfig = await instance.validate(config);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}
```

### `instance.operate(config)`

Creates an operator instance for processing files with the given configuration.

**Parameters:**
- `config` (object): Validated configuration object

**Returns:** Promise<Operator> - Operator instance

**Example:**
```javascript
const operator = await instance.operate(validatedConfig);
```

## Operator API

### `operator.process(processFn, dateRange?, concurrency?)`

Processes files using the provided processing function.

**Parameters:**
- `processFn` (function): Async function to process each file
- `dateRange` (object, optional): Date range filter
  - `start` (Date): Start date
  - `end` (Date): End date
- `concurrency` (number, optional): Number of files to process concurrently

**Returns:** Promise<void>

**Example:**
```javascript
// Basic processing
await operator.process(async (file) => {
  console.log(`Processing: ${file.path}`);
  // Your processing logic here
});

// With date range
await operator.process(
  async (file) => { /* process */ },
  { 
    start: new Date('2024-01-01'), 
    end: new Date('2024-12-31') 
  }
);

// With concurrency
await operator.process(
  async (file) => { /* process */ },
  undefined,
  5 // Process 5 files concurrently
);
```

## File Object

The file object passed to your processing function contains the following properties:

### Core Properties

#### `path` (string)
Absolute path to the input file.

#### `outputPath` (string)
Computed output path based on DreadCabinet's configuration.

#### `basename` (string)
Original filename without directory path.

#### `extension` (string)
File extension without the leading dot.

#### `size` (number)
File size in bytes.

### Date Properties

#### `date` (Date)
The detected date for the file (from metadata, filename, or modification time).

#### `timezone` (string)
The timezone used for date calculations.

### Subject Properties

#### `subject` (string)
Extracted subject/title for the file (implementation dependent).

### Directory Properties

#### `inputDirectory` (string)
The input directory being processed.

#### `outputDirectory` (string)  
The base output directory.

#### `relativeDirectory` (string)
Relative path from input directory to file's directory.

### Computed Properties

#### `outputFilename` (string)
The computed filename for the output file.

#### `outputRelativeDirectory` (string)
The relative output directory structure (e.g., '2025/05').

**Example file object:**
```javascript
{
  path: '/home/user/notes/2025-01-15-meeting.md',
  outputPath: '/home/user/organized/2025/01/15-meeting.md',
  basename: '2025-01-15-meeting.md',
  extension: 'md',
  size: 1024,
  date: Date('2025-01-15T14:30:00.000Z'),
  timezone: 'America/New_York',
  subject: 'meeting',
  inputDirectory: '/home/user/notes',
  outputDirectory: '/home/user/organized',
  relativeDirectory: '',
  outputFilename: '15-meeting.md',
  outputRelativeDirectory: '2025/01'
}
```

## Configuration Schema

DreadCabinet uses Zod for configuration validation. The main configuration schema includes:

### Input Configuration

```typescript
{
  inputDirectory: string,           // Directory to scan
  recursive: boolean,              // Process subdirectories
  limit?: number,                  // Max files to process
  concurrency: number,             // Concurrent processing
  extensions: string[],            // File extensions to process
}
```

### Output Configuration

```typescript
{
  outputDirectory: string,         // Output directory
  outputStructure: 'none' | 'year' | 'month' | 'day',
  outputFilenameOptions: ('date' | 'time' | 'subject')[],
}
```

### Date and Timezone Configuration

```typescript
{
  timezone: string,                // IANA timezone identifier
  start?: string,                  // Start date filter (YYYY-MM-DD)
  end?: string,                    // End date filter (YYYY-MM-DD)
}
```

### Input Structure Configuration

```typescript
{
  inputStructure: 'none' | 'year' | 'month' | 'day',
  inputFilenameOptions: ('date' | 'time' | 'subject')[],
}
```

## Error Handling

DreadCabinet throws specific error types for different failure scenarios:

### `ArgumentError`
Thrown when invalid arguments are provided.

```javascript
try {
  const config = await instance.validate(invalidConfig);
} catch (error) {
  if (error.name === 'ArgumentError') {
    console.error('Invalid argument:', error.message);
  }
}
```

### `ConfigurationError`
Thrown when configuration validation fails.

```javascript
try {
  await instance.validate(config);
} catch (error) {
  if (error.name === 'ConfigurationError') {
    console.error('Configuration error:', error.message);
  }
}
```

### `FileSystemError`
Thrown when file system operations fail.

```javascript
try {
  const operator = await instance.operate(config);
} catch (error) {
  if (error.name === 'FileSystemError') {
    console.error('File system error:', error.message);
  }
}
```

## Default Constants

DreadCabinet provides default constants you can use:

### `DEFAULT_OPTIONS`
Default configuration options.

```javascript
import { DEFAULT_OPTIONS } from '@theunwalked/dreadcabinet';

const instance = DreadCabinet.create({
  defaults: {
    ...DEFAULT_OPTIONS.defaults,
    timezone: 'America/New_York' // Override specific defaults
  }
});
```

### `DEFAULT_FEATURES`
Default feature flags.

```javascript
import { DEFAULT_FEATURES } from '@theunwalked/dreadcabinet';

const instance = DreadCabinet.create({
  features: DEFAULT_FEATURES // Use all default features
});
```

## Type Definitions

If you're using TypeScript, DreadCabinet provides type definitions:

```typescript
import type { 
  Config, 
  FileInfo, 
  DreadCabinetInstance, 
  Operator 
} from '@theunwalked/dreadcabinet';

const processFn = async (file: FileInfo): Promise<void> => {
  // Type-safe file processing
  console.log(`Processing ${file.basename}`);
};
```

## Integration Utilities

### Timezone Helpers

```javascript
import { getValidTimezones, isValidTimezone } from '@theunwalked/dreadcabinet';

// Check if a timezone is valid
if (isValidTimezone('America/New_York')) {
  // Use the timezone
}

// Get all valid timezones
const timezones = getValidTimezones();
```

### Path Utilities

```javascript
import { generateOutputPath, sanitizeFilename } from '@theunwalked/dreadcabinet';

// Generate output path for a file
const outputPath = generateOutputPath(file, config);

// Sanitize filename for filesystem safety
const safeName = sanitizeFilename('Meeting: Notes & Actions!');
// Result: 'Meeting-Notes-Actions'
``` 