export {
  AI_POLL_FIELDS,
  validatePollOptionCountInput,
} from "./ai-poll";
export {
  AI_CLASSIFIER_TAGGER_FIELDS,
  validateCategoryAmountInput,
  validateTagAmountInput,
} from "./ai-classifier-tagger";
export {
  AI_TITLE_GENERATION_FIELDS,
  validateTitleKeywordsInput,
} from "./ai-title-generation";
export { parsePositiveIntegerInput } from "./parse-positive-integer-input";

export type NodeFieldErrors = Record<string, Record<string, string>>;

export function hasWorkflowInputErrors(
  nodeFieldErrors: NodeFieldErrors,
): boolean {
  return Object.values(nodeFieldErrors).some(
    (fields) => Object.keys(fields).length > 0,
  );
}
