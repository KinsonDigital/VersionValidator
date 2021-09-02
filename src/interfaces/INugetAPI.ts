/**
 * Makes various calls to the nuget.org API to collect information about nuget packages.
 */
export interface INugetAPI {
	/**
	 * Returns the list of nuget packaged versions published on nuget.org.
	 * @returns An asynchronous operation with return type boolean that indicates if the nuget package with the version exists.
	 */
	getPublishedVersions(): Promise<string[]> 
}