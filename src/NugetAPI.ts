import axios, {AxiosResponse} from "axios";
import { Action } from "./helpers/Action";
import {PackageVersionResponse} from "./interfaces/PackageVersionResponse";

/**
 * Makes various calls to the nuget.org API to collect information about nuget packages.
 */
export class NugetAPI {
	/**
	 * Returns the list of nuget packaged versions published on nuget.org.
	 * @returns An asynchronous operation with return type boolean that indicates if the nuget package with the version exists.
	 */
	public async getPublishedVersions (): Promise<string[]> {
		console.log("I HAVE BEEN INVOOOOOKED!!!");
		
		return await new Promise<string[]>((resolve, reject) => {
			const action: Action = new Action();
			const packageName: string = action.getInput("nuget-package-name");

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