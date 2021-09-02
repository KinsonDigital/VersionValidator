/**
 * Provides github action functionality.
 */
export interface IAction {
	/**
	 * Returns the value of the input that matches the given input.
	 * @param name The name of the input.
	 * @returns The value of the given input.
	 */
	getInput: (name: string) => string;

	/**
	 * Sets the value of the given output to the given value.
	 * @param name The name of the output.
	 * @param value The value of the output.
	 */
	setOutput: (name: string, value: string) => void;

	/**
	 * Writes info to log with console.log. 
	 * @param message Info message.
	 */
	info: (message: string) => void;

	/**
	 * Adds a warning issue.
	 * @param message Warning issue message.  Errors will be converted to string via toString().
	 */
	warning: (message: string) => void;

	/**
	 * Adds and error issue.
	 * @param message Error issue message.  Errors will be converted to string via toString().
	 */
	setFailed: (message: string | Error) => void;
}
