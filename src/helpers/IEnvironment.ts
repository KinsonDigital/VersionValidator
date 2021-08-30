/**
 * Represents an environment.
 */
export interface IEnvironment {
	/**
	 * Returns a value indicating if in a production environment.
	 * @returns True if the environment is production.
	 */
	isProd: () => boolean;

	/**
	 * Returns a value indicating if in a development environment.
	 * @returns True if the environment is development.
	 */
	isDevelop: () => boolean;

	/**
	 * Returns the value of a variable that matches the given name.
	 * @param varName The name of the variable.
	 * @returns The value of the given variable.
	 */
	getVarValue: (varName: string, throwErrorWhenNotFound: boolean) => string;
}