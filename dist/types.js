/** Check if usage limit is reached (either window at 100%) */
export function isLimitReached(data) {
    return data.fiveHour === 100 || data.sevenDay === 100;
}
/**
 * Check if the model-scoped weekly window is exhausted (e.g. the Fable week at 100%).
 * Kept separate from isLimitReached: a scoped cap blocks one model, not the account, so the
 * renderers show it as its own alarm and let an account-wide cap take precedence.
 */
export function isScopedLimitReached(data) {
    return (data.sevenDayScoped ?? null) === 100 && !!data.sevenDayScopedModel;
}
//# sourceMappingURL=types.js.map