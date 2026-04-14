import { withDevtools } from "@angular-architects/ngrx-toolkit";
import type { IEnvironment } from "./models/environment.model";

export const environment: IEnvironment = {
	production: false,
	withStoreDevTools: withDevtools,
};
