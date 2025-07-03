# Frequently Asked Questions

Common questions and answers about using DreadCabinet.

## General Questions

### What is DreadCabinet?

DreadCabinet is a TypeScript/JavaScript library that brings order to your digital chaos by organizing, renaming, and transforming files based on date, subject, and other metadata. It's designed to be integrated into your own CLI applications rather than being a standalone tool.

### Is DreadCabinet a standalone CLI tool?

No, DreadCabinet is a library that you integrate into your own CLI applications. This design gives you maximum flexibility to customize the file processing logic for your specific needs and integrate with your existing workflows.

### Why should I use DreadCabinet instead of writing my own file organization script?

DreadCabinet provides:
- Battle-tested file organization patterns
- Robust date and timezone handling
- Intelligent filename generation with collision handling
- Concurrent processing capabilities
- Comprehensive CLI option management
- TypeScript support with full type definitions
- Integration with configuration file libraries

## File Processing

### Will DreadCabinet overwrite my original files?

No. DreadCabinet only reads your source files and creates renamed copies in the output directory. Your original files remain completely untouched. If you specify the same directory for both input and output, DreadCabinet will rename files (or add suffixes) to avoid overwriting.

### What file types does DreadCabinet support?

DreadCabinet can process any file type, but by default it's configured to handle Markdown (`.md`) files. You can configure it to process any file extensions you need:

```bash
my-app --extensions md txt json yaml
```

### How do I specify multiple file extensions?

Pass them as space-separated arguments to `--extensions`:

```bash
my-app --extensions md txt markdown rst
```

Or in a configuration file:
```yaml
extensions:
  - md
  - txt
  - markdown
```

### What happens if two files produce the same date and subject?

DreadCabinet automatically detects collisions and appends an extra identifier so files don't overwrite each other. You might see:

```
2025-05-13-meeting.md
2025-05-13-meeting-1.md
2025-05-13-meeting-a7b9.md
```

## Date and Time Handling

### How does DreadCabinet detect dates in files?

DreadCabinet uses a hierarchical approach:

1. **File metadata/front matter** (if your application implements parsing)
2. **Filename patterns** (e.g., `2025-01-15-notes.md`)
3. **File modification timestamp** (as fallback)

The exact implementation depends on how you integrate DreadCabinet into your application.

### Does DreadCabinet parse YAML front matter automatically?

DreadCabinet provides the framework, but you implement the parsing logic. This gives you full control over how metadata is extracted from your files. See the [Advanced Usage](advanced-usage.md#subject-extraction-strategies) guide for examples.

### Why is the filename missing the full date when I use `--output-structure month`?

DreadCabinet automatically omits redundant parts of the date in filenames if they're already included in the directory path. This prevents something like `2025/05/13/2025-05-13-my-note.md`.

For example:
- With `--output-structure month`: `2025/05/13-meeting.md`
- With `--output-structure day`: `2025/05/13/meeting.md`

This is by design to keep filenames clean and avoid redundancy.

### Can I force DreadCabinet to always include the full date in filenames?

Currently, DreadCabinet automatically handles date redundancy. If you need different behavior, you can implement custom filename generation in your processing function or request this as a feature enhancement.

### What timezone formats does DreadCabinet support?

DreadCabinet supports any timezone from the [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Examples:

- `America/New_York`
- `Europe/London` 
- `Asia/Tokyo`
- `Etc/UTC`

## Performance and Concurrency

### How many files can DreadCabinet process concurrently?

By default, DreadCabinet processes files sequentially (`--concurrency 1`). You can increase this based on your system capabilities:

```bash
# Process 5 files simultaneously
my-app --concurrency 5

# For powerful systems
my-app --concurrency 10
```

A good rule of thumb is to set concurrency between 2-10 depending on your system and the complexity of your file processing operations.

### Will high concurrency improve performance?

It depends on your workload:

- **I/O-bound operations** (copying, reading files): Higher concurrency usually helps
- **CPU-bound operations** (text processing, image manipulation): Concurrency equal to CPU cores is often optimal
- **Memory-intensive operations**: Lower concurrency to avoid exhausting system memory

Start with a low value and experiment to find the optimal setting for your use case.

### How do I process only a subset of files for testing?

Use the `--limit` option:

```bash
# Process only the first 10 files found
my-app --limit 10

# Test with 50 files
my-app --limit 50
```

This is useful for testing configurations on large file collections.

## Configuration

### Can I use configuration files instead of command-line arguments?

Yes! DreadCabinet integrates well with `@theunwalked/cardigantime` for configuration file support. You can use YAML, JSON, or JavaScript configuration files. See the [Configuration Files](configuration-files.md) guide for detailed examples.

### How do command-line arguments override configuration files?

The typical precedence order is:

1. Application defaults (lowest)
2. Configuration file values
3. Environment variables (if implemented)
4. Command-line arguments (highest)

This means CLI arguments always win, allowing for flexible overrides.

### Can I have different configurations for different environments?

Yes! You can maintain separate configuration files:

```
.config/
├── development.yaml
├── staging.yaml
└── production.yaml
```

Then specify which one to use:
```bash
my-app --config-file .config/production.yaml
```

## Integration and Development

### How do I integrate DreadCabinet with my existing CLI tool?

Follow these basic steps:

1. Install DreadCabinet: `npm install @theunwalked/dreadcabinet`
2. Create a DreadCabinet instance with your defaults
3. Configure your Commander.js program with DreadCabinet options
4. Parse CLI arguments and validate configuration
5. Create an operator and implement your file processing logic

See the [Getting Started](getting-started.md) guide for a complete example.

### Can I customize which CLI options are available?

Yes! Use the `features` array when creating your DreadCabinet instance:

```javascript
const instance = DreadCabinet.create({
  features: ['input', 'output', 'extensions']
  // This only enables basic input/output and extension filtering
});
```

See [Advanced Usage](advanced-usage.md#features-configuration) for all available features.

### How do I implement custom subject extraction?

Implement your own logic in the processing function:

```javascript
await operator.process(async (file) => {
  const content = await fs.readFile(file.path, 'utf8');
  
  // Custom subject extraction logic
  const subject = extractSubjectFromContent(content);
  
  // Use the subject in your processing
  console.log(`Processing: ${subject}`);
});
```

### Can I use DreadCabinet with languages other than JavaScript/TypeScript?

DreadCabinet is specifically designed for Node.js/JavaScript/TypeScript applications. For other languages, you might consider:

1. Creating a Node.js wrapper that calls your main application
2. Using DreadCabinet as inspiration to implement similar functionality in your language
3. Creating a standalone CLI tool with DreadCabinet and calling it from your application

## Troubleshooting

### I'm getting "Configuration validation failed" errors

This usually means:

1. **Invalid option values**: Check that your extensions, timezone, or structure values are valid
2. **Type mismatches**: Ensure numbers are numbers, booleans are booleans, etc.
3. **Missing required fields**: Some combinations of features require certain options

Enable detailed logging to see exactly what's failing:

```javascript
try {
  await instance.validate(config);
} catch (error) {
  console.error('Validation details:', error.issues); // For Zod validation errors
}
```

### Files aren't being found

Check these common issues:

1. **File extensions**: Make sure your `--extensions` setting includes the files you want to process
2. **Directory structure**: Verify the `--input-directory` path is correct
3. **Recursive processing**: Add `--recursive` if your files are in subdirectories
4. **File permissions**: Ensure DreadCabinet can read the input directory

### Output files are going to unexpected locations

1. **Check output structure**: The `--output-structure` setting affects where files are placed
2. **Verify output directory**: Make sure `--output-directory` is set correctly
3. **Date detection**: If dates aren't being detected properly, files might be organized by their modification time

### Performance is slower than expected

1. **Reduce concurrency**: High concurrency can sometimes hurt performance
2. **Check file processing logic**: Complex processing functions will be slower
3. **Use selective processing**: Skip unchanged files or add filters
4. **Profile your code**: Use Node.js profiling tools to find bottlenecks

## Getting Help

### Where can I find more examples?

- Check the [Getting Started](getting-started.md) guide for basic examples
- See [Advanced Usage](advanced-usage.md) for complex scenarios
- Review the [API Reference](api-reference.md) for complete documentation

### How do I report bugs or request features?

1. Check the [GitHub issues](https://github.com/SemicolonAmbulance/dreadcabinet/issues) for existing reports
2. Create a new issue with:
   - Clear description of the problem or feature request
   - Code examples demonstrating the issue
   - Your environment details (Node.js version, OS, etc.)
   - Steps to reproduce

### Can I contribute to DreadCabinet?

Yes! Contributions are welcome. See the [Contributing Guide](contributing.md) for details on:

- Setting up the development environment
- Running tests
- Submitting pull requests
- Code style guidelines 