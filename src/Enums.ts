/**
 * The different sections of a version.
 */
export enum VersionNumber {
	/**
	 * The major number of a version.
	 */
	Major = 1,

	/**
	 * The minor number of a version.
	 */
	Minor = 2,

	/**
	 * The patch number of a version.
	 */
	Patch = 3,

	/**
	 * The preview number of a preview version.
	 */
	Preview = 4,
}

/**
 * Represents the current environment that the action is running in.
 */
export enum CurrentEnvironment {
	/**
	 * Development environment for the purpose of development and testing.
	 */
	Development = "Development",

	/**
	 * Production environment.
	 */
	Production = "Production",
}
