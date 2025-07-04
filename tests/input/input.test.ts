import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { Config, Args, Options, Logger, Feature } from '../../src/dreadcabinet';
import type * as ProcessModule from '../../src/input/process';

// Mock the process function from the './process' module
const mockProcess = vi.fn<typeof ProcessModule.process>();

vi.mock('../../src/input/process', () => ({
    process: mockProcess,
}));

// Dynamically import the module under test after mocking
const { create } = await import('../../src/input/input');

describe('Input: Create', () => {
    let mockConfig: Config;
    let mockArgs: Args;
    let mockOptions: Options;
    let mockLogger: Logger;
    let mockFeatures: Feature[];
    let mockCallback: ReturnType<typeof vi.fn<(file: string, date?: Date) => Promise<void>>>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock objects for each test
        mockLogger = {
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            verbose: vi.fn(),
            silly: vi.fn(),
        };

        mockFeatures = ['input']; // Provide a basic mock features object


        mockConfig = { // Provide a basic mock config object
            timezone: 'UTC',
            inputDirectory: '/input',
            inputStructure: 'none',
            inputFilenameOptions: [],
            extensions: [],
            // Add other necessary config properties
        };

        // @ts-ignore - Mock the callback function passed to the process method
        mockArgs = { // Provide a basic mock args object
            start: undefined,
            end: undefined,
            // Add other necessary args properties
        };

        // @ts-ignore - Mock the callback function passed to the process method
        mockOptions = {
            logger: mockLogger,
            features: mockFeatures,
            // Add other necessary options properties
        };

        // @ts-ignore - Mock the callback function passed to the process method
        mockCallback = vi.fn().mockResolvedValue(undefined);
    });

    test('should return an object with a process method', () => {
        const inputModule = create(mockConfig, mockOptions);
        expect(inputModule).toHaveProperty('process');
        expect(typeof inputModule.process).toBe('function');
    });

    test('process method should call the imported process function with correct arguments', async () => {
        const inputModule = create(mockConfig, mockOptions);
        await inputModule.process(mockCallback);

        expect(mockProcess).toHaveBeenCalledTimes(1);
        expect(mockProcess).toHaveBeenCalledWith(
            mockConfig,
            mockOptions.features,
            mockOptions.logger,
            mockCallback,
            {
                start: undefined,
                end: undefined,
            }
        );
    });

    test('process method should propagate arguments correctly', async () => {
        // Modify args or options for this specific test if needed
        const specificArgs: Args = { ...mockArgs, recursive: true };
        const specificOptions: Options = { ...mockOptions, features: [...mockFeatures, 'structured-input'] };

        const inputModule = create(mockConfig, specificOptions);
        await inputModule.process(mockCallback);

        expect(mockProcess).toHaveBeenCalledWith(
            mockConfig,
            specificOptions.features,
            specificOptions.logger,
            mockCallback,
            {
                start: undefined,
                end: undefined,
            }
        );
    });

    test('process method should pass concurrency option when provided', async () => {
        const inputModule = create(mockConfig, mockOptions);
        await inputModule.process(mockCallback, {});

        expect(mockProcess).toHaveBeenCalledWith(
            mockConfig,
            mockOptions.features,
            mockOptions.logger,
            mockCallback,
            {
                start: undefined,
                end: undefined,
            }
        );
    });

    test('process method should pass concurrency as undefined when not provided', async () => {
        const inputModule = create(mockConfig, mockOptions);
        await inputModule.process(mockCallback);

        expect(mockProcess).toHaveBeenCalledWith(
            mockConfig,
            mockOptions.features,
            mockOptions.logger,
            mockCallback,
            {
                start: undefined,
                end: undefined,
                concurrency: undefined,
            }
        );
    });
});
