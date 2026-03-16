import { InjectionToken } from "@angular/core";
import { environment } from "@envs/environment";
import type { IEnvironment } from "./environment.model";

export const ENVIRONMENT = new InjectionToken<IEnvironment>("ENVIRONMENT", {
	providedIn: "root",
	factory: () => environment,
});
