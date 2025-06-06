import { Config, Feature, Logger } from "dreadcabinet";
import { process as processStructuredInput } from "./structured";
import { process as processUnstructuredInput } from "./unstructured";

export const process = async (
    config: Config,
    features: Feature[],
    logger: Logger,
    callback: (file: string) => Promise<void>,
    { start, end }: { start?: Date, end?: Date } = {}
) => {
    if (!features.includes('input')) {
        throw new Error('Input feature is not enabled, skipping input processing');
    }

    const concurrency = config.concurrency;
    if (!concurrency) {
        throw new Error('Concurrency is not configured');
    }

    const inputDirectory = config.inputDirectory;
    if (!inputDirectory) {
        throw new Error('Input directory is not configured');
    }

    let fileCount = 0;

    if (features.includes('structured-input')) {
        logger.debug('Processing Structured Input from %s with start date %s and end date %s', inputDirectory, start, end);

        if (!start || !end) {
            throw new Error('Start or end date are both required for structured input');
        } else {
            fileCount = await processStructuredInput(
                config.inputStructure!,
                config.inputFilenameOptions!,
                config.extensions!,
                config.timezone,
                start,
                end,
                config.limit,
                features,
                logger,
                inputDirectory,
                callback,
                concurrency
            )
        }


    } else {
        // Original Unstructured Input Logic
        logger.debug('Processing Unstructured Input from %s', inputDirectory);

        if (start || end) {
            throw new Error('Start or end date is not allowed for unstructured input');
        }

        fileCount = await processUnstructuredInput(
            inputDirectory,
            config.recursive || false,
            config.extensions || [],
            config.limit,
            logger,
            callback,
            concurrency
        );
    }

    logger.info('Processed %d files matching criteria.', fileCount);
};
