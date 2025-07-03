# CLI Options Reference

This page provides a comprehensive reference for all command-line options that DreadCabinet exposes when integrated into your CLI application. All options have been verified to match the actual code behavior.

## Quick Reference Table

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
| `--concurrency <concurrency>`            |       | `1`            | Number of files to process simultaneously. Higher values can improve performance.                      |
| `--input-structure <type>`               |       | `month`        | Input directory structure (none/year/month/day). Used if files are already in a date-based structure. |
| `--input-filename-options [options...]`  |       | `date subject` | Input filename format options (space-separated list of: date,time,subject).                           |
| `--start <date>`                         |       | `undefined`    | Start date filter (YYYY-MM-DD).                                                                       |
| `--end <date>`                           |       | `undefined`    | End date filter (YYYY-MM-DD), defaults to today.                                                      |

## Input Options

### `--input-directory <path>` (alias: `-i`)

**Default**: `./` (current working directory)

Specifies the directory to scan for files. DreadCabinet will process all files in this directory that match your extension and other filtering criteria.

```bash
# Process files in the current directory
my-app --input-directory .

# Process files in a specific directory
my-app --input-directory ./my-notes

# Process files in an absolute path
my-app --input-directory /home/user/documents
```

### `--recursive` (alias: `-r`)

**Default**: `false`

When specified, DreadCabinet will process all subdirectories within the input directory recursively. Without this flag, only files in the top-level directory are processed.

```bash
# Process only files in the input directory
my-app --input-directory ./notes

# Process files in input directory AND all subdirectories
my-app --input-directory ./notes --recursive
```

### `--extensions [ext...]`

**Default**: `md`

Specifies which file extensions to process. Extensions should be provided without the leading dot, separated by spaces.

```bash
# Process only Markdown files
my-app --extensions md

# Process multiple file types
my-app --extensions md txt markdown

# Process text and documentation files
my-app --extensions md txt rst adoc
```

**Note**: The allowed extensions by default are `md` and `txt`, but you can configure this when creating your DreadCabinet instance.

### `--limit <limit>`

**Default**: `undefined` (no limit)

Limits the total number of files that will be processed. Useful for testing or when you want to process only a subset of files.

```bash
# Process only the first 10 files found
my-app --limit 10

# Process first 100 files for testing
my-app --limit 100
```

### `--concurrency <concurrency>`

**Default**: `1`

Sets the number of files to process simultaneously. The default value of 1 means files are processed sequentially. Increasing this value allows multiple files to be processed in parallel, which can significantly improve performance when dealing with large numbers of files.

```bash
# Process files one at a time (default)
my-app --concurrency 1

# Process 5 files simultaneously
my-app --concurrency 5

# Higher concurrency for powerful systems
my-app --concurrency 10
```

**Performance Notes**:
- Higher values can improve performance but use more system resources
- Setting it too high may lead to system resource exhaustion
- Typical values range from 2 to 10, depending on your system capabilities
- Consider the complexity of your file processing operations when choosing a value

## Output Options

### `--output-directory <path>` (alias: `-o`)

**Default**: `./` (current working directory)

Specifies where processed files will be saved. DreadCabinet creates the directory if it doesn't exist. If the input and output directories are the same, DreadCabinet will rename files as needed to avoid overwriting.

```bash
# Output to current directory
my-app --output-directory .

# Output to a specific directory
my-app --output-directory ./organized

# Output to an absolute path
my-app --output-directory /home/user/organized-notes
```

### `--output-structure <type>`

**Default**: `month`

Defines how DreadCabinet organizes files into folders by date. This creates a hierarchical directory structure based on the dates associated with your files.

**Available values**:

- `none`: No subfolders; all processed files go directly under the output directory
- `year`: One subfolder per year (e.g., `2025/`)
- `month`: Subfolders by year and month (e.g., `2025/05/`)
- `day`: Subfolders for year, month, and day (e.g., `2025/05/13/`)

```bash
# No date-based folders
my-app --output-structure none
# Result: ./organized/2025-05-13-meeting.md

# Organize by year
my-app --output-structure year
# Result: ./organized/2025/05-13-meeting.md

# Organize by month (default)
my-app --output-structure month
# Result: ./organized/2025/05/13-meeting.md

# Organize by day
my-app --output-structure day
# Result: ./organized/2025/05/13/meeting.md
```

**Smart Filename Generation**: DreadCabinet automatically removes redundant date segments from filenames when they're already reflected in the folder structure.

### `--output-filename-options [tokens...]`

**Default**: `date subject`

Controls which components appear in each output filename. You can specify multiple tokens separated by spaces.

**Available tokens**:
- `date`: Prepends the date (YYYY-MM-DD or partial format)
- `time`: Appends the time (HHMM in 24-hour format)
- `subject`: Adds a subject string derived from file content or metadata

```bash
# Default: date and subject
my-app --output-filename-options date subject
# Result: 2025-05-13-meeting-notes.md

# Include time
my-app --output-filename-options date time subject
# Result: 2025-05-13-1430-meeting-notes.md

# Only subject
my-app --output-filename-options subject
# Result: meeting-notes.md

# Only date
my-app --output-filename-options date
# Result: 2025-05-13.md
```

## Advanced Input Options

### `--input-structure <type>`

**Default**: `month`

Describes the existing directory structure if your input files are already organized by date. This helps DreadCabinet parse dates from file paths when they're not found in metadata or filenames.

**Available values**: `none`, `year`, `month`, `day`

```bash
# Input files already organized by month
my-app --input-structure month --input-directory ./archive

# Input files organized by day
my-app --input-structure day --input-directory ./daily-notes

# No existing structure
my-app --input-structure none
```

### `--input-filename-options [options...]`

**Default**: `date subject`

Specifies the format of input filenames if they already contain structured information. This allows DreadCabinet to parse dates, times, and subjects directly from existing filenames.

**Available options**: `date`, `time`, `subject`

```bash
# Parse date and subject from filenames
my-app --input-filename-options date subject

# Parse all components from filenames
my-app --input-filename-options date time subject

# Only extract subjects from filenames
my-app --input-filename-options subject
```

## Date Filtering Options

### `--start <date>`

**Default**: `undefined` (no start date filter)

Filters files to include only those with a date on or after the specified start date. Date must be in `YYYY-MM-DD` format.

```bash
# Process files from January 1, 2024 onwards
my-app --start 2024-01-01

# Process files from a specific month
my-app --start 2024-06-01 --end 2024-06-30
```

### `--end <date>`

**Default**: `undefined` (defaults to current date when start is specified)

Filters files to include only those with a date on or before the specified end date. Date must be in `YYYY-MM-DD` format.

```bash
# Process files up to December 31, 2023
my-app --end 2023-12-31

# Process files for a specific date range
my-app --start 2024-01-01 --end 2024-03-31
```

## Timezone Options

### `--timezone <tz>`

**Default**: `Etc/UTC`

Applies to any date/time found in file metadata or the file's last-modified timestamp. DreadCabinet will convert everything into the specified timezone for output names and folder structures.

```bash
# Use Eastern Time
my-app --timezone America/New_York

# Use Pacific Time
my-app --timezone America/Los_Angeles

# Use UTC (default)
my-app --timezone Etc/UTC

# Use Central European Time
my-app --timezone Europe/Berlin
```

**Valid timezone values**: Any timezone from the [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Example Combinations

### Basic Organization

```bash
# Simple monthly organization
my-app \
  --input-directory ./notes \
  --output-directory ./organized \
  --output-structure month \
  --extensions md
```

### Advanced Processing

```bash
# High-performance processing with filtering
my-app \
  --input-directory ./archive \
  --output-directory ./processed \
  --output-structure day \
  --output-filename-options date time subject \
  --extensions md txt \
  --recursive \
  --concurrency 8 \
  --start 2024-01-01 \
  --timezone America/New_York
```

### Existing Structure Migration

```bash
# Migrate from existing monthly structure to daily structure
my-app \
  --input-directory ./old-archive \
  --input-structure month \
  --output-directory ./new-archive \
  --output-structure day \
  --recursive
``` 