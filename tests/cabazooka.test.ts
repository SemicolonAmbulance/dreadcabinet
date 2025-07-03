import { vi, describe, test, beforeEach, expect } from 'vitest';
import type { Command } from 'commander';
import type { Config, Args, Feature, FilesystemStructure, Logger, Operator } from '../src/dreadcabinet';
import type * as ConfigureModule from '../src/configure';
import type * as DefaultsModule from '../src/defaults';
import type * as ReadModule from '../src/read';
import type * as ValidateModule from '../src/validate';
import type * as OperateModule from '../src/operate';

// --- Mock Dependencies ---

const mockConfigure = vi.fn<typeof ConfigureModule.configure>();
const mockApplyDefaults = vi.fn<typeof DefaultsModule.applyDefaults>();
const mockRead = vi.fn<typeof ReadModule.read>();
const mockValidate = vi.fn<typeof ValidateModule.validate>();
const mockCreateOperator = vi.fn<typeof OperateModule.create>();
const mockOperatorInstance = { /* Mock operator instance methods if needed */ } as Operator;

// Mock the modules
vi.mock('../src/configure', () => ({
    configure: mockConfigure,
}));

vi.mock('../src/defaults', () => ({
    applyDefaults: mockApplyDefaults,
}));

vi.mock('../src/read', () => ({
    read: mockRead,
}));

vi.mock('../src/validate', () => ({
    validate: mockValidate,
    // Add ArgumentError mock if needed by tests
}));

// Mock the operate module
vi.mock('../src/operate', () => ({
    create: mockCreateOperator,
}));

// --- Dynamically Import Module Under Test ---

const { create, DEFAULT_APP_OPTIONS, DEFAULT_ALLOWED_OPTIONS, DEFAULT_FEATURES, DEFAULT_OPTIONS } = await import('../src/dreadcabinet');

// --- Test Suite ---

describe('DreadCabinet Factory (`create`)', () => {
    let mockCommand: Command;
    let mockLogger: Logger;

    beforeEach(() => {
        vi.clearAllMocks();

        mockCommand = {
            // Mock commander methods used by configure if necessary
        } as Command;

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            verbose: vi.fn(),
            silly: vi.fn(),
        };

        // Setup default return values for mocks
        mockApplyDefaults.mockImplementation((config: any) => config as Config); // Pass through config by default
        mockRead.mockResolvedValue({});
        mockValidate.mockResolvedValue(undefined);
        mockCreateOperator.mockResolvedValue(mockOperatorInstance);
    });

    test('should create instance with default options when no overrides provided', () => {
        const dreadcabinet = create();
        expect(dreadcabinet).toBeDefined();
        // We can't directly inspect internal options easily,
        // so we test the behavior of the methods that use them.
    });

    test('should create instance with overridden options', () => {
        const customDefaults = { inputDirectory: '/custom/input' };
        const customAllowed = { extensions: ['txt'] };
        const customFeatures: Feature[] = ['input'];
        const customAddDefaults = false;

        const dreadcabinet = create({
            defaults: customDefaults,
            allowed: customAllowed,
            features: customFeatures,
            addDefaults: customAddDefaults,
            logger: mockLogger,
        });

        expect(dreadcabinet).toBeDefined();
        // Further tests will verify these options are used
    });

    describe('DreadCabinet Instance Methods', () => {
        let dreadcabinet: ReturnType<typeof create>;
        const testArgs: Args = {
            recursive: false,
            timezone: 'UTC',
            inputDirectory: '/in',
            outputDirectory: '/out',
            extensions: ['.eml'],
        };
        const testConfig: Partial<Config> = { inputDirectory: '/in', outputDirectory: '/out' };
        const fullConfig: Config = { ...DEFAULT_APP_OPTIONS, ...testConfig } as Config;

        beforeEach(() => {
            dreadcabinet = create({ logger: mockLogger });
            mockApplyDefaults.mockReturnValue(fullConfig);
            mockRead.mockResolvedValue(testConfig);
        });

        test('`configure` should call the configure module', async () => {
            await dreadcabinet.configure(mockCommand);
            expect(mockConfigure).toHaveBeenCalledTimes(1);
            expect(mockConfigure).toHaveBeenCalledWith(
                mockCommand,
                DEFAULT_APP_OPTIONS,
                DEFAULT_OPTIONS.addDefaults,
                DEFAULT_FEATURES
            );
        });

        test('`configure` should use overridden options', async () => {
            const customDefaults = { timezone: 'EST' };
            const customFeatures: Feature[] = ['output'];
            const customAddDefaults = false;
            const dreadcabinetCustom = create({
                defaults: customDefaults,
                features: customFeatures,
                addDefaults: customAddDefaults,
            });

            await dreadcabinetCustom.configure(mockCommand);
            expect(mockConfigure).toHaveBeenCalledWith(
                mockCommand,
                expect.objectContaining(customDefaults),
                customAddDefaults,
                customFeatures
            );
        });

        test('`setLogger` should update the logger used internally', async () => {
            const newLogger: Logger = {
                debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(),
                verbose: vi.fn(), silly: vi.fn()
            };
            dreadcabinet.setLogger(newLogger);

            await dreadcabinet.validate(fullConfig);
            expect(mockValidate).toHaveBeenCalledWith(fullConfig, expect.any(Object));
        });

        test('`read` should call the read module and store args', async () => {
            const result = await dreadcabinet.read(testArgs);
            expect(mockRead).toHaveBeenCalledTimes(1);
            expect(mockRead).toHaveBeenCalledWith(testArgs, DEFAULT_FEATURES);
            expect(result).toEqual(testConfig);

            await dreadcabinet.operate(fullConfig);
            expect(mockCreateOperator).toHaveBeenCalledWith(
                fullConfig,
                testArgs,
                expect.any(Object)
            );
        });

        test('`read` should use overridden features', async () => {
            const customFeatures: Feature[] = ['input', 'output'];
            const dreadcabinetCustom = create({ features: customFeatures });
            await dreadcabinetCustom.read(testArgs);
            expect(mockRead).toHaveBeenCalledWith(testArgs, customFeatures);
        });

        test('`applyDefaults` should call the defaults module', () => {
            const result = dreadcabinet.applyDefaults(testConfig);
            expect(mockApplyDefaults).toHaveBeenCalledTimes(1);
            expect(mockApplyDefaults).toHaveBeenCalledWith(
                testConfig,
                DEFAULT_FEATURES,
                DEFAULT_APP_OPTIONS
            );
            expect(result).toEqual(fullConfig);
        });

        test('`applyDefaults` should use overridden features and defaults', () => {
            const customDefaults = { recursive: true };
            const customFeatures: Feature[] = ['input'];
            const dreadcabinetCustom = create({ defaults: customDefaults, features: customFeatures });

            dreadcabinetCustom.applyDefaults(testConfig);
            expect(mockApplyDefaults).toHaveBeenCalledWith(
                testConfig,
                customFeatures,
                expect.objectContaining(customDefaults)
            );
        });

        test('`validate` should call the validate module', async () => {
            await dreadcabinet.validate(fullConfig);
            expect(mockValidate).toHaveBeenCalledTimes(1);
            expect(mockValidate).toHaveBeenCalledWith(fullConfig, expect.any(Object));
        });

        test('`validate` should use overridden options', async () => {
            const customAllowed = { extensions: ['md'] };
            const customFeatures: Feature[] = ['input'];
            const dreadcabinetCustom = create({ allowed: customAllowed, features: customFeatures, logger: mockLogger });

            await dreadcabinetCustom.validate(fullConfig);
            expect(mockValidate).toHaveBeenCalledWith(fullConfig, expect.any(Object));
        });

        test('`operate` should call the operate module with config and stored args', async () => {
            await dreadcabinet.read(testArgs);
            const operator = await dreadcabinet.operate(fullConfig);

            expect(mockCreateOperator).toHaveBeenCalledTimes(1);
            expect(mockCreateOperator).toHaveBeenCalledWith(
                fullConfig,
                testArgs,
                expect.any(Object)
            );
            expect(operator).toBe(mockOperatorInstance);
            expect(operator).toBe(mockOperatorInstance);
        });

        test('`operate` should use overridden options', async () => {
            const customDefaults = { outputDirectory: '/custom/out' };
            const customAllowed = { inputStructures: ['none'] as FilesystemStructure[] };
            const customFeatures: Feature[] = ['output'];
            const dreadcabinetCustom = create({
                defaults: customDefaults,
                allowed: customAllowed,
                features: customFeatures,
                logger: mockLogger
            });

            await dreadcabinetCustom.read(testArgs);
            await dreadcabinetCustom.operate(fullConfig);

            expect(mockCreateOperator).toHaveBeenCalledWith(
                fullConfig,
                testArgs,
                expect.any(Object)
            );
        });
    });
});
