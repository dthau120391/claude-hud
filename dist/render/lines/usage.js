import { isLimitReached, isScopedLimitReached } from '../../types.js';
import { getProviderLabel } from '../../stdin.js';
import { critical, warning, dim, getQuotaColor, quotaBar, RESET } from '../colors.js';
import { getAdaptiveBarWidth } from '../../utils/terminal.js';
export function renderUsageLine(ctx) {
    const display = ctx.config?.display;
    const colors = ctx.config?.colors;
    if (display?.showUsage === false) {
        return null;
    }
    if (!ctx.usageData?.planName) {
        return null;
    }
    if (getProviderLabel(ctx.stdin)) {
        return null;
    }
    const label = dim('Usage');
    if (ctx.usageData.apiUnavailable) {
        const errorHint = formatUsageError(ctx.usageData.apiError);
        return `${label} ${warning(`⚠${errorHint}`, colors)}`;
    }
    if (isLimitReached(ctx.usageData)) {
        const resetTime = ctx.usageData.fiveHour === 100
            ? formatResetTime(ctx.usageData.fiveHourResetAt)
            : formatResetTime(ctx.usageData.sevenDayResetAt);
        return `${label} ${critical(`⚠ Limit reached${resetTime ? ` (resets ${resetTime})` : ''}`, colors)}`;
    }
    // Model-scoped cap (e.g. the Fable week at 100%): its own alarm, checked AFTER the account-wide one.
    if (isScopedLimitReached(ctx.usageData)) {
        const resetTime = formatResetTime(ctx.usageData.sevenDayScopedResetAt ?? null);
        return `${label} ${critical(`⚠ ${ctx.usageData.sevenDayScopedModel} limit reached${resetTime ? ` (resets ${resetTime})` : ''}`, colors)}`;
    }
    const threshold = display?.usageThreshold ?? 0;
    const fiveHour = ctx.usageData.fiveHour;
    const sevenDay = ctx.usageData.sevenDay;
    // Model-scoped week ("Current week (Fable)") — optional fields, absent on pre-0.0.11 caches.
    const scopedModel = ctx.usageData.sevenDayScopedModel ?? null;
    const scoped = ctx.usageData.sevenDayScoped ?? null;
    const effectiveUsage = Math.max(fiveHour ?? 0, sevenDay ?? 0, scoped ?? 0);
    if (effectiveUsage < threshold) {
        return null;
    }
    const fiveHourDisplay = formatUsagePercent(ctx.usageData.fiveHour, colors);
    const fiveHourReset = formatResetTime(ctx.usageData.fiveHourResetAt);
    const usageBarEnabled = display?.usageBarEnabled ?? true;
    const fiveHourPart = usageBarEnabled
        ? (fiveHourReset
            ? `${quotaBar(fiveHour ?? 0, getAdaptiveBarWidth(), colors)} ${fiveHourDisplay} (resets in ${fiveHourReset})`
            : `${quotaBar(fiveHour ?? 0, getAdaptiveBarWidth(), colors)} ${fiveHourDisplay}`)
        : (fiveHourReset
            ? `5h: ${fiveHourDisplay} (resets in ${fiveHourReset})`
            : `5h: ${fiveHourDisplay}`);
    const sevenDayThreshold = display?.sevenDayThreshold ?? 80;
    const syncingSuffix = ctx.usageData.apiError === 'rate-limited'
        ? ` ${dim('(syncing...)')}`
        : '';
    const weeklyParts = [];
    if (sevenDay !== null && sevenDay >= sevenDayThreshold) {
        const sevenDayDisplay = formatUsagePercent(sevenDay, colors);
        const sevenDayReset = formatResetTime(ctx.usageData.sevenDayResetAt);
        weeklyParts.push(usageBarEnabled
            ? (sevenDayReset
                ? `${quotaBar(sevenDay, getAdaptiveBarWidth(), colors)} ${sevenDayDisplay} (resets in ${sevenDayReset})`
                : `${quotaBar(sevenDay, getAdaptiveBarWidth(), colors)} ${sevenDayDisplay}`)
            : (sevenDayReset
                ? `7d: ${sevenDayDisplay} (resets in ${sevenDayReset})`
                : `7d: ${sevenDayDisplay}`));
    }
    // The model-scoped week follows the same threshold: it is a weekly window too, and it is the
    // one that binds first for the model in use (e.g. Fable 29% while all-models sits at 20%).
    if (scoped !== null && scopedModel && scoped >= sevenDayThreshold) {
        const scopedDisplay = formatUsagePercent(scoped, colors);
        const scopedReset = formatResetTime(ctx.usageData.sevenDayScopedResetAt ?? null);
        weeklyParts.push(usageBarEnabled
            ? (scopedReset
                ? `${quotaBar(scoped, getAdaptiveBarWidth(), colors)} ${scopedDisplay} ${dim(scopedModel)} (resets in ${scopedReset})`
                : `${quotaBar(scoped, getAdaptiveBarWidth(), colors)} ${scopedDisplay} ${dim(scopedModel)}`)
            : (scopedReset
                ? `7d ${scopedModel}: ${scopedDisplay} (resets in ${scopedReset})`
                : `7d ${scopedModel}: ${scopedDisplay}`));
    }
    const weeklySuffix = weeklyParts.map((p) => ` | ${p}`).join('');
    return `${label} ${fiveHourPart}${weeklySuffix}${syncingSuffix}`;
}
function formatUsagePercent(percent, colors) {
    if (percent === null) {
        return dim('--');
    }
    const color = getQuotaColor(percent, colors);
    return `${color}${percent}%${RESET}`;
}
function formatUsageError(error) {
    if (!error)
        return '';
    if (error === 'rate-limited')
        return ' (syncing...)';
    if (error.startsWith('http-'))
        return ` (${error.slice(5)})`;
    return ` (${error})`;
}
function formatResetTime(resetAt) {
    if (!resetAt)
        return '';
    const now = new Date();
    const diffMs = resetAt.getTime() - now.getTime();
    if (diffMs <= 0)
        return '';
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins < 60)
        return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        if (remHours > 0)
            return `${days}d ${remHours}h`;
        return `${days}d`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
//# sourceMappingURL=usage.js.map