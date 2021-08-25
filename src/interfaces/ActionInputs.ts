/**
 * Represents the inputs of the action.
 */
export interface ActionInputs {
	/**
     * The current environment.
     * @summary The values 'dev' and 'develop' are valid values for the development environment.
     * The values 'prod', 'production', undefined, or empty all represents the production environment.
     * This value is not case sensitive.
	 * 
	 * NOTE: The input 'environment' is just for testing and never exists in the YAML file.
     */
	environment: string,

	/**
	 * The name of the nuget package in nuget.org
	 */
	nugetPackageName: string,

	/**
	 * The version to validate.
	 */
	version: string,

	/**
	 * True to check if the version already exists in nuget.org
	 */
	checkNuget: boolean,

	/**
	 * True to fail the action if the version already exists in nuget.org
	 */
	failIfNugetVersionExists: false,
}