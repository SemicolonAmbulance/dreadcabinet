# Configuration Through Files

While DreadCabinet offers a rich set of command-line arguments, for complex or frequently used configurations, you might prefer using a configuration file. This is where `@theunwalked/cardigantime`, a sister library, comes into play.

`@theunwalked/cardigantime` is designed to load configurations from various file formats (like YAML, JSON, or JS modules) and can seamlessly integrate with applications like DreadCabinet. By using both libraries, you can define all your DreadCabinet options in a configuration file and even override them with command-line arguments if needed. This provides a flexible and powerful way to manage your settings.

## Why Use Configuration Files?

Configuration files provide several advantages over command-line arguments alone:

- **Reproducibility**: Save complex configurations and share them with your team
- **Version Control**: Track configuration changes in your repository
- **Environment-Specific Settings**: Different configs for development, staging, and production
- **Complex Configurations**: Easier to manage than long command-line arguments
- **Documentation**: Self-documenting configurations with comments

## Integration with Cardigantime

Here's a comprehensive example of how you might use `@theunwalked/cardigantime` to load settings before configuring DreadCabinet. This example is inspired by how a sister project, Cortalyne, integrates these libraries:

```js
import { Command } from 'commander';
import * as DreadCabinet from '@theunwalked/dreadcabinet';
import * as Cardigantime from '@theunwalked/cardigantime';
import { z } from 'zod'; // Assuming Zod is used for schema validation, similar to Cortalyne

// Define a Zod schema for your application-specific configurations, if any
// For this example, we'll assume no extra app-specific configs beyond DreadCabinet's.
// If you had them, you'd define them here:
const ConfigSchema = z.object({
   myCustomOption: z.string().optional(),
   verbose: z.boolean().optional(),
});

const clean = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
}

type Config = z.infer<typeof ConfigSchema> & DreadCabinet.Config & Cardigantime.Config;

const DEFAULT_CONFIG =  {
  myCustomOption: 'my-default',
  verbose: false,
}

async function main() {
  // 1. Initialize DreadCabinet with its own defaults and configurations
  const dreadcabinet = DreadCabinet.create({
    defaults: {
      // Your default DreadCabinet settings
      // e.g., timezone: 'America/New_York', extensions: ['md']
      ...DreadCabinet.DEFAULT_OPTIONS.defaults, // Or use DreadCabinet's provided defaults
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

## Sample Configuration Files

### Complete YAML Configuration

Below is an example of a `config.yaml` file that mirrors all the available command-line options for DreadCabinet:

```yaml
# DreadCabinet Configuration File Example

# Input options
inputDirectory: "./my_notes"       # Corresponds to --input-directory
recursive: true                   # Corresponds to --recursive
limit: 100                        # Corresponds to --limit (e.g., process only 100 files)
concurrency: 5                    # Corresponds to --concurrency (e.g., process 5 files simultaneously)
inputStructure: "month"           # Corresponds to --input-structure (e.g., none, year, month, day)
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
timezone: "America/New_York"      # Corresponds to --timezone

# Note: For options that are simple flags (like --recursive),
# their presence in CLI implies 'true'. In a YAML file, you'd explicitly set them.
# Default values mentioned in the CLI table will be used if an option is omitted here,
# assuming the integration logic (like the example JS snippet) handles defaults correctly.
```

### JSON Configuration

The same configuration can be expressed in JSON format:

```json
{
  "inputDirectory": "./my_notes",
  "recursive": true,
  "limit": 100,
  "concurrency": 5,
  "inputStructure": "month",
  "inputFilenameOptions": ["date", "subject"],
  "start": "2023-01-01",
  "end": "2023-12-31",
  "outputDirectory": "./organized_notes",
  "outputStructure": "month",
  "outputFilenameOptions": ["date", "time", "subject"],
  "extensions": ["md", "txt"],
  "timezone": "America/New_York"
}
```

### Environment-Specific Configurations

You can maintain different configurations for different environments:

#### `config.development.yaml`
```yaml
inputDirectory: "./test-notes"
outputDirectory: "./test-output"
limit: 10
concurrency: 1
timezone: "Etc/UTC"
extensions: ["md"]
```

#### `config.production.yaml`
```yaml
inputDirectory: "/data/notes"
outputDirectory: "/data/organized"
concurrency: 8
recursive: true
timezone: "America/New_York"
extensions: ["md", "txt", "markdown"]
```

## Configuration Precedence

When using both configuration files and command-line arguments, the typical precedence order is:

1. **Application defaults** (lowest precedence)
2. **Configuration file values**
3. **Environment variables** (if implemented)
4. **Command-line arguments** (highest precedence)

This means command-line arguments will always override configuration file settings, allowing for flexible overrides during development or one-off executions.

## Using Configuration Files

Once you've set up the integration, you can use configuration files like this:

```bash
# Use default config file location (./.config/config.yaml)
my-app

# Specify a custom config file
my-app --config-file ./my-config.yaml

# Use config file but override specific options
my-app --config-file ./production.yaml --limit 50 --concurrency 4

# Use config directory with multiple files
my-app --config-directory ./configs
```

## Best Practices

### 1. Structure Your Configurations

Organize your configuration files in a logical structure:

```
.config/
├── config.yaml              # Default configuration
├── environments/
│   ├── development.yaml     # Development-specific settings
│   ├── staging.yaml         # Staging-specific settings
│   └── production.yaml      # Production-specific settings
└── templates/
    └── config.template.yaml # Template for new configurations
```

### 2. Document Your Configurations

Use comments to document your configuration choices:

```yaml
# Processing Configuration
inputDirectory: "./notes"
# Process subdirectories for comprehensive organization
recursive: true
# Limit for testing - remove in production
limit: 100
# Optimized for 8-core system
concurrency: 6

# Output Organization
outputStructure: "month"    # Monthly folders: 2025/01/
outputFilenameOptions:      # Include date and subject in filenames
  - "date"
  - "subject"

# Performance Settings
timezone: "America/New_York"  # Convert all timestamps to Eastern Time
```

### 3. Version Control Your Configurations

Include configuration files in version control but be careful with sensitive information:

```gitignore
# Include configuration templates and defaults
.config/config.yaml
.config/templates/

# Exclude environment-specific or sensitive configs
.config/environments/local.yaml
.config/secrets.yaml
```

### 4. Validate Your Configurations

Use schema validation to catch configuration errors early:

```javascript
// Define strict validation for your configs
const ConfigSchema = z.object({
  inputDirectory: z.string().min(1),
  outputDirectory: z.string().min(1),
  extensions: z.array(z.string()).min(1),
  concurrency: z.number().min(1).max(20),
  // ... other validations
});

// Validate before processing
const validatedConfig = ConfigSchema.parse(fileConfig);
```

By maintaining such a configuration file, you can easily manage and version your DreadCabinet settings, making your file processing workflows more reproducible and easier to share. 