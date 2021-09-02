/**
 * Loads data from a file.
 */
export interface IFileLoader {
	/**
	 * Loads the data from a file at the given file path.
	 * @param filePath The path to the file to load.
	 * @returns The file data.
	 */
	loadEnvFile: (filePath: string) => string;
}