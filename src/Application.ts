import { container } from "tsyringe";
import { Action } from "./helpers/Action";
import { Environment } from "./helpers/Environment";
import { FileLoader } from "./helpers/FileLoader";
import { IsValidResult } from "./interfaces/IsValidResult";
import { NugetAPI } from "./NugetAPI";
import { VersionChecker } from "./VersionChecker";

/**
 * The main GitHub action.
 */
export class Application {
	/**
	 * Creates a new instance of Application.
	 */
	constructor () {
		container.register("INugetAPI", {useClass: NugetAPI, });
		container.register("IFileLoader", {useClass: FileLoader, });
		container.register("IEnvironment", {useClass: Environment, });
		container.register("IAction", {useClass: Action, });
		container.register("VersionChecker", {useClass: VersionChecker, });
		container.register("Application", {useClass: Application, });
	}

	/**
	 * The main entry point of the GitHub action.
	 * @returns {Promise<void>} Returns just a promise with now result.
	 */
	public async run (): Promise<void> {
		const action: Action = container.resolve(Action);

		try {
			// Refer to the action.yml file for the list of inputs setup for the action
			const version: string = action.getInput("version");
			
			const versionChecker: VersionChecker = container.resolve(VersionChecker);
			const validResult: IsValidResult = await versionChecker.isValid(version);

			if (validResult.isValid) {
				action.info(validResult.message);
			} else {
				return await Promise.reject(validResult.message);
			}

			return await Promise.resolve();
		} catch (error) {
			if (typeof error === "string") {
				return await Promise.reject(new Error(error.toString()));
			} else {
				return await Promise.reject(error);
			}
		}
	}
}
