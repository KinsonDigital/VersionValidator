/**
 * A result if a version is valid or not and an associated message.
 */
export interface IValidResult {
	/**
	 * True if a version is valid.
	 */
	isValid: boolean,
	
	/**
	 * A misc. message.
	 */
	message: string
}