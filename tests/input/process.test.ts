import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Config, Feature, Logger, Args } from '../../src/dreadcabinet';

// Mock dependencies using vi.mock
const mockProcessStructuredInput = vi.fn<() => Promise<number>>();
const mockProcessUnstructuredInput = vi.fn<() => Promise<number>>();

vi.mock('../../src/input/structured', () => ({
    process: mockProcessStructuredInput,
}));

vi.mock('../../src/input/unstructured', () => ({
    process: mockProcessUnstructuredInput,
}));

// Dynamically import the module under test AFTER mocks are defined
const { process } = await import('../../src/input/process');

describe('Input Processing', () => {
    let mockConfig: Partial<Config>;
    let mockArgs: Partial<Args>;
    let mockFeatures: Feature[];
    let mockLogger: Logger;
    let mockCallback: ReturnType<typeof vi.fn<(file: string) => Promise<void>>>;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        // Default mock setup
        mockConfig = {
            inputDirectory: '/fake/input',
            inputStructure: 'none', // Add necessary mock structure properties
            inputFilenameOptions: ['date', 'subject'], // Add necessary mock filename options
            extensions: ['txt'],
            timezone: 'UTC',
            recursive: false,
            concurrency: 1,
        };
        mockArgs = {
            start: undefined,
            end: undefined,
        };
        mockFeatures = ['input']; // Default feature set
        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            verbose: vi.fn(),
            silly: vi.fn(),
        };
        // @ts-ignore - Ignore type error for jest mock compatibility if necessary
        mockCallback = vi.fn().mockResolvedValue(undefined);

        // Mock the sub-processors to return a file count
        mockProcessStructuredInput.mockResolvedValue(5);
        mockProcessUnstructuredInput.mockResolvedValue(10);
    });

    it('should throw an error if the input feature is not enabled', async () => {
        mockFeatures = []; // No features
        await expect(
            process(mockConfig as Config, mockFeatures, mockLogger, mockCallback)
        ).rejects.toThrow('Input feature is not enabled, skipping input processing');
    });

    it('should throw an error if inputDirectory is not configured', async () => {
        delete mockConfig.inputDirectory;
        await expect(
            process(mockConfig as Config, mockFeatures, mockLogger, mockCallback)
        ).rejects.toThrow('Input directory is not configured');
    });

    it('should call processStructuredInput when structured-input feature is enabled', async () => {
        mockFeatures = ['input', 'structured-input'];
        const expectedFileCount = 5;
        // No need to mock resolved value here again if set in beforeEach
        // mockProcessStructuredInput.mockResolvedValue(expectedFileCount);

        const start = new Date('2023-01-01');
        const end = new Date('2023-01-31');

        await process(mockConfig as Config, mockFeatures, mockLogger, mockCallback, { start, end });

        expect(mockLogger.debug).toHaveBeenCalledWith('Processing Structured Input from %s with start date %s and end date %s', '/fake/input', start, end);
        expect(mockProcessStructuredInput).toHaveBeenCalledTimes(1);
        expect(mockProcessStructuredInput).toHaveBeenCalledWith(
            mockConfig.inputStructure,
            mockConfig.inputFilenameOptions,
            mockConfig.extensions,
            mockConfig.timezone,
            start,
            end,
            undefined,
            mockFeatures,
            mockLogger,
            mockConfig.inputDirectory,
            mockCallback,
            1,
        );
        expect(mockProcessUnstructuredInput).not.toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith('Processed %d files matching criteria.', expectedFileCount);
    });

    it('should call processUnstructuredInput when structured-input feature is NOT enabled', async () => {
        mockFeatures = ['input']; // Only base input feature
        const expectedFileCount = 10;
        // No need to mock resolved value here again if set in beforeEach
        // mockProcessUnstructuredInput.mockResolvedValue(expectedFileCount);

        await process(mockConfig as Config, mockFeatures, mockLogger, mockCallback);

        expect(mockLogger.debug).toHaveBeenCalledWith('Processing Unstructured Input from %s', '/fake/input');
        expect(mockProcessUnstructuredInput).toHaveBeenCalledTimes(1);
        expect(mockProcessUnstructuredInput).toHaveBeenCalledWith(
            mockConfig.inputDirectory,
            mockConfig.recursive,
            mockConfig.extensions,
            undefined,
            mockLogger,
            mockCallback,
            1,
        );
        expect(mockProcessStructuredInput).not.toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith('Processed %d files matching criteria.', expectedFileCount);
    });

    it('should pass start and end args correctly to processStructuredInput', async () => {
        mockFeatures = ['input', 'structured-input'];

        await process(mockConfig as Config, mockFeatures, mockLogger, mockCallback, { start: new Date('2023-01-01'), end: new Date('2023-01-31') });

        expect(mockProcessStructuredInput).toHaveBeenCalledWith(
            expect.anything(), // config.inputStructure
            expect.anything(), // config.inputFilenameOptions
            expect.anything(), // config.extensions
            expect.anything(), // config.timezone
            new Date('2023-01-01'),      // start arg
            new Date('2023-01-31'),      // end arg
            undefined, // limit
            expect.anything(), // features
            expect.anything(), // logger
            expect.anything(), // inputDirectory
            expect.anything(), // callback
            1,
        );
    });

    it('should pass recursive and extensions args correctly to processUnstructuredInput', async () => {
        mockFeatures = ['input'];
        mockConfig.recursive = true;
        mockConfig.extensions = ['.csv', '.json']; // Keep dots if source expects them

        await process(mockConfig as Config, mockFeatures, mockLogger, mockCallback);

        expect(mockProcessUnstructuredInput).toHaveBeenCalledWith(
            expect.anything(), // inputDirectory
            true,              // recursive
            ['.csv', '.json'], // extensions
            undefined, // limit
            expect.anything(), // logger
            expect.anything(), // callback
            1,
        );
    });
});
