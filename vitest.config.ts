import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        setupFiles: ['tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        exclude: ['node_modules/**/*', 'docs/**/*'],
        testTimeout: 30000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*'],
            exclude: ['docs/**/*', 'node_modules/**/*'],
            thresholds: {
                lines: 87,
                statements: 85,
                branches: 72,
                functions: 97,
            },
        },
    },
}); 