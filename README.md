# DreadCabinet

> A powerful tool that brings order to your digital chaos, one file at a time!
> Organize, rename, and transform your notes or files based on date, subject, and other metadata—all via a single CLI command.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Example](#basic-example)
  - [CLI Options](#cli-options)
- [Output Structures](#output-structures)
- [Filename Options](#filename-options)
  - [Subject Extraction](#subject-extraction)
  - [Date Detection](#date-detection)
  - [Collision Handling](#collision-handling)
- [Enabled/Disabled Features](#enableddisabled-features)
- [Environment Variables](#environment-variables)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [Configuration Through Files](#configuration-through-files)

---

## Features

- **Date-based organization** – Place files into folders by year, month, or day (or no structure at all).  
- **Flexible filename generation** – Include date, time, and a subject in filenames.  
- **Recursion** – Process all subdirectories (or just the top level) as you prefer.  
- **Timezone support** – Convert file timestamps or metadata to a specific timezone for naming.  
- **Extension filtering** – Restrict processing to certain file types.  
- **No destructive operations** – Original files remain untouched; DreadCabinet only creates copies in a new directory structure.

---

## Installation

```bash
npm install -g dreadcabinet
````

*Alternatively, you can install locally in your project:*

```bash
npm install --save dreadcabinet
```

---

## Usage

### Integrating with Your CLI Tool

```javascript
import { Command } from 'commander';
import * as DreadCabinet from '@theunwalked/dreadcabinet';

// Create a new instance with options
const instance = DreadCabinet.create({
  defaults: {
    timezone: 'America/New_York',
    extensions: ['md', 'txt'],
    outputStructure: 'month',
    outputDirectory: './dist',
  }
});



// Configure your command
const program = new Command();
await instance.configure(program);

// Parse arguments
program.parse(process.argv);
const cliArgs = program.opts();

// DreadCabinet reads its relevant options from the raw CLI args
const dreadcabinetCliConfig = await instance.read(cliArgs);

// Your overall application might have more options than DreadCabinet, merge after reading from DreadCabinet
let config = {
  ...dreadcabinetCliConfig,
  ...cliArgs,
}

// Apply DreadCabinet's configured defaults and transformations again on the merged object
config = instance.applyDefaults(config);

// Validate options - returns nothing but throws an error if there is a problem
await instance.validate(config);

// Use the operator to process files
const operator = await instance.operate(config);
await operator.process(async (file) => {
  // Your file processing logic here
});
```

### Basic Example

For example, process all Markdown notes in the current directory (non-recursively), place the output in a new folder named `organized`, and arrange them by month:

```bash
dreadcabinet \
  --input-directory . \
  --output-directory ./organized \
  --output-structure month \
  --extensions md
```

This will look for all `.md` files in `.` (only the top-level directory), parse dates/subjects, and create a structured hierarchy within `./organized/`.

---

### Features Configuration

When creating a DreadCabinet instance using `DreadCabinet.create(options)`, you can provide a `features` array in the `options` object. This array allows you to specify which sets of functionalities and their associated command-line arguments are enabled for that particular instance. This is useful for tailoring DreadCabinet to specific needs or when integrating it into larger applications where only a subset of its capabilities might be required.

If the `features` array is not provided, DreadCabinet typically enables a default set of features.

**Available Feature Flags:**

The `features` option takes an array of strings. The known feature flags are:

*   **`'input'`**:
    *   Enables core input-related functionalities and CLI options.
    *   Controls options like:
        *   `--input-directory <inputDirectory>` / `-i <inputDirectory>`
        *   `--recursive` / `-r`
        *   `--limit <limit>`

*   **`'output'`**:
    *   Enables core output-related functionalities and CLI options.
    *   Controls options like:
        *   `--output-directory <outputDirectory>` / `-o <outputDirectory>`

*   **`'structured-output'`**:
    *   Enables features related to how files are named and organized in the output directory.
    *   Controls options like:
        *   `--output-structure <type>`
        *   `--output-filename-options [outputFilenameOptions...]`

*   **`'extensions'`**:
    *   Enables filtering of files based on their extensions.
    *   Controls options like:
        *   `--extensions [extensions...]`

*   **`'structured-input'`**:
    *   Enables features for interpreting existing structure in the input directory or filenames, and date-based filtering.
    *   Controls options like:
        *   `--input-structure <type>`
        *   `--input-filename-options [options...]`
        *   `--start <date>`
        *   `--end <date>`

**Example Usage:**

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

---

## Command-Line Options

Below is a summary of the main command-line flags exposed in [`src/arguments.ts`](./src/arguments.ts). All options have been verified to match the actual code behavior.

| Option                                   | Alias | Default        | Description                                                                                           |
| ---------------------------------------- | ----- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `--input-directory <path>`               | `-i`  | `./` (cwd)     | Directory to scan for files. If not specified, DreadCabinet uses the current directory.                  |
| `--output-directory <path>`              | `-o`  | `./`           | Directory where processed files will be saved. DreadCabinet creates it if necessary.                     |
| `--output-structure <type>`              |       | `month`        | Folder organization style. See [Output Structures](#output-structures) for details.                   |
| `--output-filename-options [tokens...]`  |       | `date subject` | Configure how output filenames are composed. See [Filename Options](#filename-options).               |
| `--extensions [ext...]`                  |       | `md`           | Which file extensions to process (no dots). Space-separated (e.g. `md txt`).                          |
| `--recursive`                            | `-r`  | `false`        | If specified, all subdirectories are also processed.                                                  |
| `--timezone <tz>`                        |       | `Etc/UTC`      | Timezone for date/time calculations (e.g. `America/New_York`).                                        |
| `--limit <limit>`                        |       | `undefined`    | Limit the number of files to process.                                                                 |
| `--input-structure <type>`               |       | `none`         | Input directory structure (none/year/month/day). Used if files are already in a date-based structure. |
| `--input-filename-options [options...]`  |       | `date subject` | Input filename format options (space-separated list of: date,time,subject).                           |
| `--start <date>`                         |       | `undefined`    | Start date filter (YYYY-MM-DD).                                                                       |
| `--end <date>`                           |       | `undefined`    | End date filter (YYYY-MM-DD), defaults to today.                                                      |

**Additional details**:

1. **`--input-directory`** (default = `.`)
   Reads all files in the specified directory (and subdirectories if `--recursive` is set).

2. **`--output-directory`** (default = `.`)
   Where processed files end up. By default, DreadCabinet creates an organized copy in your current directory. If `--input-directory` and `--output-directory` point to the same location, DreadCabinet renames files as needed (rather than overwriting them).

3. **`--output-structure`** (default = `month`)
   Defines how DreadCabinet organizes files into folders by date. Possible values:

   * `none`: No subfolders; all processed files go directly under `--output-directory`.
   * `year`: Folder per year (e.g. `2025/`).
   * `month`: Folders by year and month (e.g. `2025/05/`).
   * `day`: Folders by year, month, and day (e.g. `2025/05/13/`).

4. **`--output-filename-options`** (default = `date subject`)
   Controls which components appear in each filename. For example, `--output-filename-options date subject time` would produce filenames containing date, subject, and time. More details in [Filename Options](#filename-options).

5. **`--extensions`** (default = `md`)
   Only files with these extensions (no leading dot) are processed. For multiple extensions, separate them with spaces (e.g. `--extensions md txt`).

6. **`--recursive`** (default = `false`)
   When set, DreadCabinet descends into all subfolders of `--input-directory`. Otherwise, it processes only the top-level directory.

7. **`--timezone`** (default = `Etc/UTC`)
   Applies to any date/time found in file metadata or the file's last-modified timestamp. DreadCabinet will convert everything into the specified timezone for output names and folder structures.

8. **`--limit <limit>`** (default = `undefined`)
    Optionally limit the total number of files that will be processed.

9. **`--input-structure <type>`** (default = `none`)
    Describes the existing directory structure if the input files are already organized by date (e.g., `year`, `month`, `day`). This helps DreadCabinet parse dates from paths if not found in metadata or filenames.

10. **`--input-filename-options [options...]`** (default = `date subject`)
    Specifies the format of input filenames if they already contain structured information like date, time, or subject. This allows DreadCabinet to parse these details directly from the filenames.

11. **`--start <date>`** (default = `undefined`)
    Filters files to include only those with a date on or after the specified start date (format `YYYY-MM-DD`).

12. **`--end <date>`** (default = `undefined`)
    Filters files to include only those with a date on or before the specified end date (format `YYYY-MM-DD`). If not provided, it defaults to the current day.

---

## Configuration Through Files

While DreadCabinet offers a rich set of command-line arguments, for complex or frequently used configurations, you might prefer using a configuration file. This is where `@theunwalked/cardigantime`, a sister library, comes into play.

`@theunwalked/cardigantime` is designed to load configurations from various file formats (like YAML, JSON, or JS modules) and can seamlessly integrate with applications like DreadCabinet. By using both libraries, you can define all your DreadCabinet options in a configuration file and even override them with command-line arguments if needed. This provides a flexible and powerful way to manage your settings.

### Example Integration

Here's a conceptual example of how you might use `@theunwalked/cardigantime` to load settings before configuring DreadCabinet. This example is inspired by how a sister project, Cortalyne, integrates these libraries:

```js
import { Command } from 'commander';
import * as DreadCabinet from '@theunwalked/dreadcabinet';
import * as Cardigantime from '@theunwalked/cardigantime';
import { z } from 'zod'; // Assuming Zod is used for schema validation, similar to Cortalyne

// Define a Zod schema for your application-specific configurations, if any
// For this example, we'll assume no extra app-specific configs beyond DreadCabinet's.
// If you had them, you'd define them here:
const ConfigSchema = z.object({
   myCustomOption: z.string().optional()
});

const clean = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
}

type Config = z.infer<typeof ConfigSchema> & DreadCabinet.Config & Cardigantime.Config;

const DEFAULT_CONFIG =  {
  myCustomOption: 'my-default',
}

async function main() {
  // 1. Initialize DreadCabinet with its own defaults and configurations
  const dreadcabinet = DreadCabinet.create({
    defaults: {
      // Your default DreadCabinet settings
      // e.g., timezone: 'America/New_York', extensions: ['md']
      ...DreadCabinet.DEFAULT_OPTIONS, // Or use DreadCabinet's provided defaults
    },
    allowed: {
      // Define allowed values if needed, e.g., for outputStructures
      extensions: ['md', 'txt']
    },
    features: DreadCabinet.DEFAULT_FEATURES, // Specify features
    addDefaults: false, // Important for commander integration when also using cardigantime
  });

  // 2. Prepare the combined configuration shape for Cardigantime
  // This would merge DreadCabinet.ConfigSchema with any app-specific schemas
  const mergedShapeProperties = {
    ...Cardigantime.ConfigSchema.partial().shape,
    ...DreadCabinet.ConfigSchema.partial().shape, // Use DreadCabinet's Zod schema
    ...ConfigSchema.partial().shape, // Merge your app-specific schema if you have one
  };
  const combinedShape = z.object(mergedShapeProperties);

  // 3. Initialize Cardigantime
  const cardigantime = Cardigantime.create({
    defaults: {
      configDirectory: './.config', // Default directory to look for config files
      // Add other cardigantime defaults if needed
    },
    configShape: combinedShape.shape, // Provide the combined shape for validation
    isRequired: false,
    // Other cardigantime options like configName can be set here.
    // Source file paths are typically managed via CLI options added by cardigantime.configure()
    // and then used by cardigantime.read()
  });

  // 4. Configure Commander, load and merge configurations
  let program = new Command();
  program
    .name('my-dreadcabinet-app')
    .version('1.0.0');
    // Add any app-specific CLI options here if they are not managed by DreadCabinet or Cardigantime

  // Let DreadCabinet add its CLI options to commander
  await dreadcabinet.configure(program);
  // Let Cardigantime add its CLI options (e.g., --config-file <path>, --config-directory <path>)
  program = await cardigantime.configure(program);

  program.parse(process.argv);
  const cliArgs = program.opts();

  // Load configuration from files specified in cardigantime sources
  const fileConfig = await cardigantime.read(cliArgs); // cliArgs might contain path to config file

  // DreadCabinet reads its relevant options from the raw CLI args
  const dreadcabinetCliConfig = await dreadcabinet.read(cliArgs);

  // Merge configurations: app defaults -> fileConfig -> dreadcabinetDefaults -> dreadcabinetCliConfig -> cliArgs for app-specific
  // The exact merge order depends on desired precedence.
  // Cortalyne uses: CORTALYNE_DEFAULTS -> fileValues -> dreadcabinetValues (from CLI)
  // Then applies dreadcabinet.applyDefaults(mergedConfig).

  let mergedConfig = {
    ...DEFAULT_CONFIG, // Start with your application's internal defaults
    ...clean(fileConfig),             // Apply values from config file
    ...clean(dreadcabinetCliConfig),     // Apply DreadCabinet-specific CLI args
    ...clean(cliArgs),                // Apply any other app-specific CLI args
  };

  // Apply DreadCabinet's schema-based defaults and transformations again on the merged object
  mergedConfig = dreadcabinet.applyDefaults(mergedConfig);

  // 5. Validate the final configuration
  // Cardigantime can validate its part
  await cardigantime.validate(fileConfig); // Validate fileConfig against its shape
  // DreadCabinet validates its part
  const finalDreadCabinetConfig = await dreadcabinet.validate(mergedConfig);

  // If you had AppSpecificSchema, validate app-specific parts:
  // const appSpecificValidated = AppSpecificSchema.parse(mergedConfig);

  // The finalConfig for DreadCabinet operator would be finalDreadCabinetConfig
  console.log('Final configuration for DreadCabinet:', finalDreadCabinetConfig);

  // 6. Operate with DreadCabinet
  // const operator = await dreadcabinet.operate(finalDreadCabinetConfig);
  // await operator.process(async (file) => {
  //   console.log('Processing file:', file);
  //   // Your file processing logic here
  // });
}

main().catch(console.error);
```

This snippet illustrates a more robust way to load a `config.yaml` or `config.json` file using `@theunwalked/cardigantime`, integrate its settings with DreadCabinet's configuration, and manage command-line arguments. It leverages Zod for schema definition and validation, similar to the approach in `cortalyne`.

### Sample `config.yaml`

Below is an example of a `config.yaml` file that mirrors all the available command-line options for DreadCabinet:

```yaml
# DreadCabinet Configuration File Example

# Input options
inputDirectory: "./my_notes"       # Corresponds to --input-directory
recursive: true                   # Corresponds to --recursive
limit: 100                        # Corresponds to --limit (e.g., process only 100 files)
inputStructure: "none"            # Corresponds to --input-structure (e.g., none, year, month, day)
inputFilenameOptions:             # Corresponds to --input-filename-options
  - "date"
  - "subject"
start: "2023-01-01"               # Corresponds to --start
end: "2023-12-31"                 # Corresponds to --end

# Output options
outputDirectory: "./organized_notes" # Corresponds to --output-directory
outputStructure: "month"          # Corresponds to --output-structure (none, year, month, day)
outputFilenameOptions:            # Corresponds to --output-filename-options
  - "date"
  - "time"
  - "subject"

# General options
extensions:                       # Corresponds to --extensions
  - "md"
  - "txt"
  - "markdown"
timezone: "America/New_York"      # Corresponds to --timezone

# Note: For options that are simple flags (like --recursive),
# their presence in CLI implies 'true'. In a YAML file, you'd explicitly set them.
# Default values mentioned in the CLI table will be used if an option is omitted here,
# assuming the integration logic (like the example JS snippet) handles defaults correctly.
```

By maintaining such a configuration file, you can easily manage and version your DreadCabinet settings, making your file processing workflows more reproducible and easier to share.

---

## Output Structures

DreadCabinet can automatically create subdirectories based on file dates. The `--output-structure` option can be set to one of:

* **`none`**

  * All output files go directly into the output directory.
  * Example: `./organized/2025-05-13 Meeting.md`

* **`year`**

  * One subfolder per year.
  * Example: `./organized/2025/05-13 Meeting.md`
    (The year is omitted from the filename because it's already in the folder name.)

* **`month`** (default)

  * Subfolders by year and month.
  * Example: `./organized/2025/05/13 Meeting.md`
    (Since year/month are known from the path, only the day is in the filename.)

* **`day`**

  * Subfolders for year, month, **and** day.
  * Example: `./organized/2025/05/13/Meeting.md`
    (The entire date is encoded in the folder structure, so the filename might just be the subject.)

DreadCabinet's code "intelligently" removes redundant date segments from the filename if they are already reflected by the folder structure. If you **always** want a full `YYYY-MM-DD` prefix in filenames, regardless of the folder structure, remove or override that logic in the code or request that feature in an issue.

---

## Filename Options

The `--output-filename-options` flag determines what elements appear in each final filename. It can include:

* **`date`**
  Prepends the date (in `YYYY-MM-DD` or partial format) to the filename, but automatically omits redundant segments if you're using a date-based output structure.

* **`time`**
  Appends the time (HHmm in 24-hour format) after the date. E.g., `2025-05-13-1430`.

* **`subject`**
  Adds a subject string derived from the file content or metadata. See [Subject Extraction](#subject-extraction).

**Default**: `date subject`

### Subject Extraction

DreadCabinet attempts to parse a "subject" from each file by looking for:

1. **YAML front matter** – If a file has YAML at the top, and it contains a `title` or `subject` field, that is used.
2. **First line/heading** – If no YAML front matter is found, DreadCabinet uses the first non-empty line or first Markdown heading (e.g. `# Some Title`) as the subject.
3. **Fallback** – If no textual subject can be extracted, DreadCabinet either omits the subject entirely or uses a fallback (like the original filename without extension).

Any non-alphanumeric or filesystem-unsafe characters (e.g. `\`, `/`, `*`) are removed or replaced with `-`. Spaces are preserved by default, so you might see filenames like `2025-05-13 My Meeting Notes.md`.

### Date Detection

DreadCabinet determines each file's "date" as follows:

1. **Metadata or front matter** – If the YAML front matter includes a valid `date` field, use that.
2. **Inline date** – Some users place a date in the first line. If DreadCabinet can parse it (e.g., `2025-05-10`), it uses that.
3. **File timestamp** – If no date is found in the content or metadata, DreadCabinet uses the file's last-modified time.
4. **Timezone** – Whichever date is found is converted to the user-specified `--timezone` for final filenames and folder structures.

### Collision Handling

If two files end up with the **exact same** filename (e.g., same date, same subject), DreadCabinet appends a short identifier (hash or incremented counter) to one of them, ensuring no overwriting occurs. You might see something like:

```
2025-05-13 Meeting.md
2025-05-13 Meeting-1.md
```

or

```
2025-05-13 Meeting-hb72.md
```

depending on the collision resolution method. This collision-handling ensures you never lose data, even if multiple files share identical metadata.

---

## Enabled/Disabled Features

DreadCabinet includes several features that can be toggled via flags or omitted by default:

1. **Recursive Processing**:

   * **Enabled** with `--recursive`
   * **Disabled** by default
   * When enabled, DreadCabinet traverses all subdirectories under `--input-directory`.

2. **Date in Filenames**:

   * **Enabled** if `date` is included in `--output-filename-options` (default)
   * **Disabled** by removing `date` from `--output-filename-options`

3. **Time in Filenames**:

   * **Enabled** by adding `time` in `--output-filename-options`
   * **Disabled** if `time` is not listed

4. **Subject in Filenames**:

   * **Enabled** if `subject` is in `--output-filename-options` (default)
   * **Disabled** by removing `subject` from `--output-filename-options`

5. **Date-based Directory Structures**:

   * **Controlled** by `--output-structure` (`none|year|month|day`)

Each of these features corresponds to code in [`src/arguments.ts`](./src/arguments.ts) and the relevant file-handling modules. They can be combined or omitted based on your workflow.

---

## Environment Variables

Although DreadCabinet primarily uses CLI flags, it can also load environment variables if you supply a `.env` file. For example, if you want to set a default timezone, you could add:

```
DREADCABINET_TIMEZONE="America/Los_Angeles"
```

to your `.env`. (Exact variable names and usage may vary if you have code that explicitly references them. Check the code or issues for details.)

---

## FAQ

1. **Will DreadCabinet overwrite my original files?**
   No. DreadCabinet only reads your source files, creates renamed copies, and places them in the `--output-directory`. If you specify the same directory for both input and output, it will still rename files (or add suffixes) to avoid overwriting.

2. **How do I specify multiple file extensions?**
   Pass them as space-separated arguments to `--extensions`. For example:

   ```bash
   dreadcabinet --extensions md txt markdown
   ```

3. **What if two files produce the same date and subject?**
   DreadCabinet detects collisions and appends an extra identifier so files don't overwrite each other.

4. **Does DreadCabinet parse all Markdown front matter fields?**
   Currently, it specifically looks for `title` (and occasionally `date` or `subject` in front matter). Extra fields are ignored unless you modify the code or open a feature request.

5. **Why is the filename missing the full date when I use `--output-structure month/day`?**
   DreadCabinet automatically omits redundant parts of the date in filenames if it's already included in the directory path. This prevents something like `2025/05/13/2025-05-13 My Note.md`. You can customize or override this logic if you prefer.

---

## Contributing

1. **Fork** this repository and clone it locally.
2. Create a feature branch: `git checkout -b feature/myFeature`.
3. Commit your changes: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature/myFeature`.
5. Submit a **Pull Request** on GitHub.

We welcome bug fixes, new features, or general feedback. Please open an [issue](https://github.com/theunwalked/dreadcabinet/issues) first to discuss any major changes.

---

## License

[MIT License](./LICENSE) © 2025 Semicolon Ambulance