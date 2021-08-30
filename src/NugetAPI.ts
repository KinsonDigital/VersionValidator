import axios, { AxiosResponse } from "axios";
import { inject, injectable } from "tsyringe";
import { IAction } from "./helpers/IAction";
import { INugetAPI } from "./interfaces/INugetAPI";
import { PackageVersionResponse } from "./interfaces/PackageVersionResponse";

/**
 * Makes various calls to the nuget.org API to collect information about nuget packages.
 */
@injectable()
export class NugetAPI implements INugetAPI {
	private action: IAction;

	constructor (@inject("IAction") action: IAction) {
		this.action = action;
	}

	/**
	 * Returns the list of nuget packaged versions published on nuget.org.
	 * @returns An asynchronous operation with return type boolean that indicates if the nuget package with the version exists.
	 */
	public async getPublishedVersions (): Promise<string[]> {
		return await new Promise<string[]>((resolve, reject) => {
			const packageName: string = this.action.getInput("nuget-package-name");

			let url: string = `https://api.nuget.org/v3-flatcontainer/${packageName}/index.json`;

			axios.get<PackageVersionResponse>(url)
				.then((response: AxiosResponse<PackageVersionResponse>)  => {
					let versions: string[] = response.data.versions;
					
					resolve(versions);
				}, error => {
					reject(error);
				});
		});
	}
}