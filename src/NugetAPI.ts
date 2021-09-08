import axios, { AxiosResponse, AxiosError } from "axios";
import { inject, injectable } from "tsyringe";
import { IAction } from "./helpers/IAction";
import { INugetAPI } from "./interfaces/INugetAPI";
import { IPackageVersionResponse } from "./interfaces/IPackageVersionResponse";

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

			axios.get<IPackageVersionResponse>(url)
				.then((response: AxiosResponse<IPackageVersionResponse>)  => {
					let versions: string[] = response.data.versions;
					
					resolve(versions);
				}, (error: AxiosError) => {
					const notFound: number = 404;

					if (error.response?.status === notFound) {
						const noVersions: string[] = [];
						resolve(noVersions);
					} else {
						reject(error);
					}
				});
		});
	}
}
