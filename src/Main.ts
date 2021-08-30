import {Action} from "./helpers/Action";
import { IsValidResult } from "./interfaces/IsValidResult";
import IoC from "./IoC";
import { NugetAPI } from "./NugetAPI";
import {VersionChecker} from "./VersionChecker";


/**
 * The main GitHub action.
 */
export class Application {
	/**
	 * The main entry point of the GitHub action.
	 * @returns {Promise<void>} Returns just a promise with now result.
	 */
	public async main (): Promise<void> {
		const action: Action = new Action();
		
		try {
			// Refer to the action.yml file for the list of inputs setup for the action
			const version: string = action.getInput("version");
			const checkNuget: string = action.getInput("check-nuget");
			const failIfNugetVersionExists: string = action.getInput("fail-if-nuget-version-exists");

			// const nugetAPI: NugetAPI = new NugetAPI();
			const versionChecker: VersionChecker = IoC.Container.resolve(VersionChecker);

			if (checkNuget === "true") {
				const validResult: IsValidResult = await versionChecker.isValid(version);

				if (validResult.isValid) {
					action.info(validResult.message);
				} else {
					return await Promise.reject(validResult.message);
				}
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

const app: Application = new Application();
const action: Action = new Action;

app.main().then(() => {
	action.info("Action Success!!");
}, (error: Error) => {
	// Takes any incoming errors and fails the action with a message
	action.setFailed(error.message);
});
