import { withDevToolsStub } from "@angular-architects/ngrx-toolkit";
import type { IEnvironment } from "./models/environment.model";

export const environment: IEnvironment = {
	production: true,
	withStoreDevTools: withDevToolsStub,
};
