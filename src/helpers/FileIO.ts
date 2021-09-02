import { IFileIO } from "./IFileIO";
import { existsSync } from "fs";
import { injectable } from "tsyringe";

/**
 * Provides simple file operations.
 */
@injectable()
export class FileIO implements IFileIO {
	/**
	 * @inheritdoc
	 */
	public exists (filePath: string): boolean {
		return existsSync(filePath);
	}
}