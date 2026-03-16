import type { withDevtools } from "@angular-architects/ngrx-toolkit";
import type {
	EmptyFeatureResult,
	SignalStoreFeature,
	SignalStoreFeatureResult,
} from "@ngrx/signals";

/**
 * Type definition for the Redux DevTools SignalStore feature factory.
 *
 * @remarks
 * To ensure tree-shakable and strictly typed DevTools, we define this as a
 * SignalStoreFeature that passes through the Input state without modifications.
 */
export type WithStoreDevToolsFeature = <Input extends SignalStoreFeatureResult>(
	...args: Parameters<typeof withDevtools>
) => SignalStoreFeature<Input, EmptyFeatureResult>;

/**
 * Interface for the environment configuration.
 */
export interface IEnvironment {
	readonly production: boolean;
	readonly withStoreDevTools: WithStoreDevToolsFeature;
}
