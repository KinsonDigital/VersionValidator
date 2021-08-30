import fs from "fs";
import { injectable } from "tsyringe";
import { IFileLoader } from "./IFileLoader";

/**
 * Loads data from a file.
 */
 @injectable()
export class FileLoader implements IFileLoader {
	/**
     * @inheritdoc
     */
	public loadEnvFile (filePath: string): string {
		if (fs.existsSync(filePath)) {
			const rawData: Buffer = fs.readFileSync(filePath);

			return rawData.toString();
		}

		throw new Error(`Could find the file '${filePath}'.`);
	}
}
