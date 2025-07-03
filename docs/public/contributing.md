# Contributing to DreadCabinet

We welcome contributions to DreadCabinet! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Git** for version control
- **TypeScript** knowledge (the project is written in TypeScript)

### Setting Up the Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/SemicolonAmbulance/dreadcabinet.git
   cd dreadcabinet
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the project**:
   ```bash
   pnpm run build
   ```

4. **Run tests**:
   ```bash
   pnpm run test
   ```

5. **Start development mode**:
   ```bash
   pnpm run dev
   ```

### Project Structure

```
dreadcabinet/
├── src/                    # Source code
│   ├── configure.ts        # CLI configuration
│   ├── dreadcabinet.ts     # Main library entry
│   ├── input/              # Input processing
│   ├── output.ts           # Output handling
│   ├── operate.ts          # File operations
│   ├── validate.ts         # Configuration validation
│   └── util/               # Utility functions
├── tests/                  # Test files
├── docs/                   # Documentation site
├── dist/                   # Compiled output
└── coverage/               # Test coverage reports
```

## Development Workflow

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, well-documented TypeScript code
- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

Run the full test suite:

```bash
# Run tests with coverage
pnpm run test

# Run tests in watch mode during development
pnpm run test:watch

# Run linting
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix
```

### 4. Update Documentation

If your changes affect the API or user-facing features:

- Update relevant documentation in `docs/public/`
- Add examples to demonstrate new features
- Update the README if needed

### 5. Commit Your Changes

We use conventional commits. Format your commit messages like:

```bash
# Features
git commit -m "feat: add support for custom date patterns"

# Bug fixes
git commit -m "fix: handle timezone conversion edge cases"

# Documentation
git commit -m "docs: add examples for advanced filename options"

# Tests
git commit -m "test: add coverage for collision handling"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear description of changes
- Reference to any related issues
- Screenshots or examples if applicable

## Code Style Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Processes files based on the provided configuration
 * @param config - The validated DreadCabinet configuration
 * @returns Promise that resolves to an operator instance
 */
export async function operate(config: Config): Promise<Operator> {
  // Implementation
}
```

### Error Handling

- Use custom error classes from `src/error/`
- Provide helpful error messages
- Include context in error messages

```typescript
import { ArgumentError } from './error/ArgumentError';

if (!isValidTimezone(timezone)) {
  throw new ArgumentError(`Invalid timezone: ${timezone}. Must be a valid IANA timezone identifier.`);
}
```

### Testing Style

- Write descriptive test names
- Use `describe` blocks to group related tests
- Test both success and error cases
- Mock external dependencies

```typescript
describe('operate', () => {
  describe('when configuration is valid', () => {
    it('should return an operator instance', async () => {
      const config = createValidConfig();
      const operator = await operate(config);
      expect(operator).toBeDefined();
    });
  });

  describe('when configuration is invalid', () => {
    it('should throw ConfigurationError', async () => {
      const invalidConfig = createInvalidConfig();
      await expect(operate(invalidConfig)).rejects.toThrow(ConfigurationError);
    });
  });
});
```

## Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Minimal steps to trigger the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Node.js version, OS, DreadCabinet version
- **Code example**: Minimal code that reproduces the issue

### ✨ Feature Requests

For feature requests, please include:

- **Use case**: Why this feature would be valuable
- **Proposed API**: How you imagine the feature would work
- **Alternatives**: Other ways to achieve the same goal
- **Breaking changes**: Whether this would break existing code

### 📚 Documentation Improvements

Documentation contributions are always welcome:

- Fix typos and grammar
- Improve existing examples
- Add new examples for complex use cases
- Translate documentation (if supported in the future)

### 🧪 Tests

Help improve test coverage:

- Add tests for edge cases
- Improve existing test descriptions
- Add integration tests
- Performance tests for large file sets

## Development Guidelines

### Adding New Features

1. **Start with an issue**: Discuss the feature before implementing
2. **Design the API**: Consider how it fits with existing patterns
3. **Write tests first**: Consider TDD approach
4. **Implement incrementally**: Small, focused commits
5. **Update documentation**: Include examples and API docs

### Modifying Existing Features

1. **Understand the impact**: Consider backwards compatibility
2. **Add deprecation warnings**: If changing existing APIs
3. **Update all affected tests**: Ensure comprehensive coverage
4. **Update documentation**: Reflect all changes

### Performance Considerations

- Profile performance-critical code
- Consider memory usage for large file sets
- Test with realistic data sizes
- Document performance characteristics

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass locally
- [ ] Code is properly formatted (`pnpm run lint:fix`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### Pull Request Description

Include:

- **Summary**: Brief description of changes
- **Motivation**: Why this change is needed
- **Testing**: How you tested the changes
- **Breaking changes**: Any backwards incompatible changes
- **Related issues**: Link to GitHub issues

### Review Process

1. **Automated checks**: CI tests must pass
2. **Code review**: At least one maintainer review
3. **Documentation review**: For user-facing changes
4. **Final testing**: Maintainers may do additional testing

## Release Process

Releases are handled by maintainers:

1. Version bump following semantic versioning
2. Update changelog
3. Create GitHub release
4. Publish to npm
5. Update documentation site

## Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Focus on what's best for the community
- Show empathy towards other contributors

### Be Constructive

- Provide helpful feedback in reviews
- Suggest improvements rather than just pointing out problems
- Help newcomers get started
- Share knowledge and best practices

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Requests**: Code contributions, reviews

## Getting Help

### Development Questions

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Reach out to maintainers for complex issues

### Contribution Questions

- Review this contributing guide
- Look at recent pull requests for examples
- Ask in GitHub Discussions

### Technical Support

- Check the documentation first
- Search existing issues
- Create a new issue with detailed information

## Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Documentation acknowledgments

Thank you for contributing to DreadCabinet! 🎉 