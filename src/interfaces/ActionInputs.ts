/**
 * Represents the inputs of the action.
 */
export interface ActionInputs {
	/**
	 * The name of the nuget package in nuget.org
	 */
	"nuget-package-name": string,

	/**
	 * The version to validate.
	 */
	"version": string,

	/**
	 * True to check if the version already exists in nuget.org
	 */
	"check-nuget": string,

	/**
	 * True to fail the action if the version already exists in nuget.org
	 */
	"fail-if-nuget-version-exists": string,
}