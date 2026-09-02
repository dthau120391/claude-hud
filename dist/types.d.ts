import type { HudConfig } from './config.js';
import type { GitStatus } from './git.js';
export interface StdinData {
    transcript_path?: string;
    cwd?: string;
    model?: {
        id?: string;
        display_name?: string;
    };
    cost?: {
        total_cost_usd?: number;
        total_duration_ms?: number;
        total_api_duration_ms?: number;
        total_lines_added?: number;
        total_lines_removed?: number;
    };
    context_window?: {
        context_window_size?: number;
        total_input_tokens?: number;
        total_output_tokens?: number;
        current_usage?: {
            input_tokens?: number;
            output_tokens?: number;
            cache_creation_input_tokens?: number;
            cache_read_input_tokens?: number;
        } | null;
        used_percentage?: number | null;
        remaining_percentage?: number | null;
    };
}
export interface ToolEntry {
    id: string;
    name: string;
    target?: string;
    status: 'running' | 'completed' | 'error';
    startTime: Date;
    endTime?: Date;
}
export interface AgentEntry {
    id: string;
    type: string;
    model?: string;
    description?: string;
    status: 'running' | 'completed';
    startTime: Date;
    endTime?: Date;
}
export interface TodoItem {
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
}
/** Usage window data from the OAuth API */
export interface UsageWindow {
    utilization: number | null;
    resetAt: Date | null;
}
export interface UsageData {
    planName: string | null;
    fiveHour: number | null;
    sevenDay: number | null;
    fiveHourResetAt: Date | null;
    sevenDayResetAt: Date | null;
    /**
     * Model-scoped weekly window — "Current week (Fable)" in /usage. The API reports it only inside
     * `limits[]` as kind 'weekly_scoped' (the legacy `seven_day_opus`-style keys are null now).
     * Optional so cache files written before 0.0.11 still hydrate; absent means "not reported".
     */
    sevenDayScopedModel?: string | null;
    sevenDayScoped?: number | null;
    sevenDayScopedResetAt?: Date | null;
    apiUnavailable?: boolean;
    apiError?: string;
}
/** Check if usage limit is reached (either window at 100%) */
export declare function isLimitReached(data: UsageData): boolean;
/**
 * Check if the model-scoped weekly window is exhausted (e.g. the Fable week at 100%).
 * Kept separate from isLimitReached: a scoped cap blocks one model, not the account, so the
 * renderers show it as its own alarm and let an account-wide cap take precedence.
 */
export declare function isScopedLimitReached(data: UsageData): boolean;
export interface TranscriptData {
    tools: ToolEntry[];
    agents: AgentEntry[];
    todos: TodoItem[];
    sessionStart?: Date;
    sessionName?: string;
    effortLevel?: string;
}
export interface RenderContext {
    stdin: StdinData;
    transcript: TranscriptData;
    claudeMdCount: number;
    rulesCount: number;
    mcpCount: number;
    hooksCount: number;
    sessionDuration: string;
    gitStatus: GitStatus | null;
    usageData: UsageData | null;
    config: HudConfig;
    extraLabel: string | null;
}
//# sourceMappingURL=types.d.ts.map