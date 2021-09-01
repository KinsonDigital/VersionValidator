export interface IFileIO {
	/**
	 * Returns a value indicating if the file at the given file path exists.
	 * @param filePath The path to the file to checks.
	 */
	exists(filePath: string): boolean;
}