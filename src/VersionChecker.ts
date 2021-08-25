import { IsValidResult } from "./interfaces/IsValidResult";
import { NugetAPI } from "./NugetAPI";

/**
 * Checks versions to verify if they are the correct syntax, obey
 * the rules of semantic versioning, and do not conflict with currently
 * published version on nuget.org
 */
export class VersionChecker {
	private readonly numbers: string[] = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
	private readonly nugetAPI: NugetAPI;
	private publishedVersions: string[] = [];

	/**
	 * Creates a new instance of VersionChecker.
	 * @param nugetAPI Gets information from nuget.org
	 */
	constructor (nugetAPI: NugetAPI) {
		this.nugetAPI = nugetAPI;
	}
	
	/**
	 * Returns a value indicating if the given version is valid.
	 * @param version The version to check.
	 * @returns True if the version is valid.
	 */
	public async isValid (version: string): Promise<IsValidResult> {
		const isValidSyntax: boolean = this.isValidSyntax(version);
		this.publishedVersions = await this.nugetAPI.getPublishedVersions();
		const isValidResult: IsValidResult = {
			isValid: false,
			message: "NOT SET"
		};
		
		if (isValidSyntax) {
			if (this.publishedVersions.includes(version)) {
				isValidResult.message = `The version '${version}' has already been published to nuget.org.`;
			} else if (this.isVersionTooLarge(version)) {
				isValidResult.message = `The version '${version}' is too large.`;
			} else if (this.isVersionTooSmall(version)) {
				isValidResult.message = `The version '${version}' is too small.`;
			} else {
				isValidResult.isValid = true;
				isValidResult.message = "Version Valid";
			}

			return await Promise.resolve(isValidResult);
		} else {
			let validSyntaxMsg: string = "";
			validSyntaxMsg = "Valid syntax is as follows:";
			validSyntaxMsg += "\n\tProduction Version: <major>.<minor>.<patch>";
			validSyntaxMsg += "\n\tPreview Version: <major>.<minor>.<patch>-preview.<preview-number>";
			validSyntaxMsg += "\n\tExample: 1.2.3-preview.4";

			isValidResult.isValid = false;
			isValidResult.message = `The version '${version}' syntax is invalid.\n${validSyntaxMsg}`;

			return await Promise.resolve(isValidResult);
		}
	}

	/**
	 * Returns a value indicating if the given version is the correct syntax.
	 * @param version The version to check.
	 * @returns True if the version is the correct syntax.
	 */
	private isValidSyntax (version: string): boolean {
		if (version === undefined || version === null || version === "") {
			return false;
		}
		
		if (this.isPreview(version)) {
			return this.validPreviewSyntax(version);
		} else {
			return this.validProductionSyntax(version);
		}
	}

	/**
	 * Returns a value indicating if the given version is too large compared to
	 * the latest version currently published in nuget.org
	 * @param version The version to check against what is currently published.
	 * @returns True if the version is too large.
	 */
	private isVersionTooLarge (version: string): boolean {
		const latestVersion: string = this.getLatestVersion();

		const latestInPreview: boolean = this.isPreview(latestVersion);
		const currentInPreview: boolean = this.isPreview(version);

		const latestMajor: number = this.getMajorNumber(latestVersion);
		const latestMinor: number = this.getMinorNumber(latestVersion);
		const latestPatch: number = this.getPatchNumber(latestVersion);
		const latestPrevNum: number = latestInPreview
			? this.getPreviewNumber(latestVersion)
			: 0;

		const currentMajor: number = this.getMajorNumber(version);
		const currentMinor: number = this.getMinorNumber(version);
		const currentPatch: number = this.getPatchNumber(version);
		const currentPrevNum: number = currentInPreview
			? this.getPreviewNumber(version)
			: 0;

		const isMajorUnchanged: boolean = currentMajor === latestMajor;
		const isMinorUnchanged: boolean = currentMinor === latestMinor;
		const isPatchUnchanged: boolean = currentPatch === latestPatch;

		const isMajorIncremented: boolean = currentMajor > latestMajor;
		const isMinorIncremented: boolean = currentMinor > latestMinor;
		const isPatchIncremented: boolean = currentPatch > latestPatch;

		// If both the current and latest are in preview
		if (latestInPreview) {
			// If the major, minor, or patch has changed
			if (!isMajorUnchanged || !isMinorUnchanged || !isPatchUnchanged) {
				return true;
			}
		}

		// If the major, minor, patch section has not been changed, check preview changes
		if (isMajorUnchanged && isMinorUnchanged && isPatchUnchanged) {
			return currentPrevNum - latestPrevNum > 1;
		} else {
			if (isMajorIncremented) {
				return currentMajor - latestMajor > 1 ||
					currentMinor > 0 ||
					currentPatch > 0 ||
					currentPrevNum - latestPrevNum > 1;
			}
	
			if (isMinorIncremented) {
				return currentMinor - latestMinor > 1 ||
					currentPatch > 0 ||
					currentPrevNum - latestPrevNum > 1;
			}
	
			if (isPatchIncremented) {
				return currentPatch - latestPatch > 1 ||
				currentPrevNum - latestPrevNum > 1;
			}
		}

		return false;
	}

	/**
	 * Returns a value indicating if the given version is too small compared to
	 * the latest version currently published in nuget.org
	 * @param version The version to check against what is currently published.
	 * @returns True if the version is too small.
	 */
	private isVersionTooSmall(version: string): boolean {
		const latestVersion: string = this.getLatestVersion();

		const latestMajor: number = this.getMajorNumber(latestVersion);
		const latestMinor: number = this.getMinorNumber(latestVersion);
		const latestPatch: number = this.getPatchNumber(latestVersion);
		const latestPrevNum: number = this.isPreview(latestVersion)
			? this.getPreviewNumber(latestVersion)
			: 0;

		const currentMajor: number = this.getMajorNumber(version);
		const currentMinor: number = this.getMinorNumber(version);
		const currentPatch: number = this.getPatchNumber(version);
		const currentPrevNum: number = this.isPreview(version)
			? this.getPreviewNumber(version)
			: 0;

		const isMajorUnchanged: boolean = currentMajor === latestMajor;
		const isMinorUnchanged: boolean = currentMinor === latestMinor;
		const isPatchUnchanged: boolean = currentPatch === latestPatch;

		const isMajorDecremented: boolean = currentMajor < latestMajor;
		const isMinorDecremented: boolean = currentMinor < latestMinor;
		const isPatchDecremented: boolean = currentPatch < latestPatch;

		// If the major, minor, patch section has not been changed, check preview changes
		if (isMajorUnchanged && isMinorUnchanged && isPatchUnchanged) {
			return currentPrevNum < latestPrevNum;
		} else {
			if (isMajorDecremented) {
				return true;
			}
			
			if (isMajorUnchanged && isMinorDecremented) {
				return true;
			}
			
			if (isMajorUnchanged && isMinorUnchanged && isPatchDecremented) {
				return true;
			}
		}

		return false;
	}

	/**
	 * The latest version currently published in nuget.or
	 * @returns The latest version.
	 */
	private getLatestVersion (): string {
		let filteredVersions: string[];
		let largestMajor: number = 0;

		this.publishedVersions.forEach(v => {
			const currentMajor: number = this.getMajorNumber(v);

			largestMajor = currentMajor > largestMajor
				? currentMajor
				: largestMajor;
		});

		filteredVersions = this.publishedVersions.filter(v => {
			return this.getMajorNumber(v) === largestMajor;
		});

		let largestMinor: number = 0;

		filteredVersions.forEach(v => {
			const currentMinor: number = this.getMinorNumber(v);

			largestMinor = currentMinor > largestMinor
				? currentMinor
				: largestMinor;
		});

		filteredVersions = filteredVersions.filter(v => {
			return this.getMinorNumber(v) === largestMinor;
		});

		let largestPatch: number = 0;

		filteredVersions.forEach(v => {
			const currentPatch: number = this.getPatchNumber(v);

			largestPatch = currentPatch > largestPatch
				? currentPatch
				: largestPatch;
		});

		filteredVersions = filteredVersions.filter(v => {
			return this.getPatchNumber(v) === largestPatch;
		});

		// If there are any preview versions
		if (filteredVersions.some(v => v.includes("-preview."))) {
			filteredVersions = filteredVersions.filter(v => v.includes("-preview."));

			let largestPrevNum: number = 0;

			filteredVersions.forEach(v => {
				const currentPrevNum: number = this.getPreviewNumber(v);

				largestPrevNum = currentPrevNum > largestPrevNum
					? currentPrevNum
					: largestPrevNum;
			});

			filteredVersions = filteredVersions.filter(v => {
				return this.getPreviewNumber(v) === largestPrevNum;
			});
		}

		return filteredVersions[0];
	}

	/**
	 * Gets the main section from the version.
	 * @param version The version to get the main version section from.
	 * @returns The main version section.
	 * @summary The main section of '1.2.3' or '1.2.3-preview.4' would be '1.2.3'
	 */
	private getMainVersionSection (version: string): string {
		return version.includes("-preview.") ? version.split("-")[0] : version;
	}

	/**
	 * Gets the major number from the version.
	 * @param version The version to get the major number from.
	 * @returns The major number from the version.
	 * @summary The major number of '1.2.3-preview.4' or '1.2.3' would be '1'.
	 */
	private getMajorNumber (version: string): number {
		let mainSection: string = version;

		if (this.isPreview(version)) {
			mainSection = this.getMainVersionSection(version);
		}

		const numberSections: string[] = mainSection.split(".");

		return parseInt(numberSections[0]);
	}

	/**
	 * Gets the minor number from the version.
	 * @param version The version to get the minor number from.
	 * @returns The minor number from the version.
	 * @summary The minor number of '1.2.3-preview.4' or '1.2.3' would be '2'.
	 */
	private getMinorNumber (version: string): number {
		let mainSection: string = version;

		if (this.isPreview(version)) {
			mainSection = this.getMainVersionSection(version);
		}

		const numberSections: string[] = mainSection.split(".");

		return parseInt(numberSections[1]);
	}

	/**
	 * Gets the patch number from the version.
	 * @param version The version to get the patch number from.
	 * @returns The patch number from the version.
	 * @summary The patch number of '1.2.3-preview.4' or '1.2.3' would be '3'.
	 */
	private getPatchNumber (version: string): number {
		let mainSection: string = version;

		if (this.isPreview(version)) {
			mainSection = this.getMainVersionSection(version);
		}

		const numberSections: string[] = mainSection.split(".");

		return parseInt(numberSections[2]);
	}

	/**
	 * Gets the preview number from the preview version.
	 * @param version The preview version to get the number from.
	 * @returns The preview number.
	 * @summary The preview number of '1.2.3-preview.4' would be '4'.  Assumes that the version is a preview version.
	 */
	private getPreviewNumber (version: string): number {
		const previewSection: string = version.split("-")[1];
		const sections: string[] = previewSection.split(".");

		return parseInt(sections[1]);
	}

	/**
	 * Returns a value indicating if the version syntax is valid for a production version.
	 * @param mainVersionSection The main section of a version.
	 * @returns True if the version is valid for a production version.
	 * @summary With the preview version '1.2.3-preview.4', the main section would be '1.2.3'
	 */
	private validProductionSyntax (mainVersionSection: string): boolean {
		const sections: string[] = mainVersionSection.split(".");
		const totalSections: number = 3;

		if (sections.length != totalSections) {
			return false;
		}

		return this.isNumber(sections[0]) && this.isNumber(sections[1]) && this.isNumber(sections[2]);
	}

	/**
	 * Returns a value indicating if the version syntax is valid for a preview version.
	 * @param version The version to check.
	 * @returns True if the version syntax is valid for a preview version.
	 */
	private validPreviewSyntax (version: string): boolean {
		const sections: string[] = version.split("-");
		const prevNumStr: string = sections[1].split(".")[1];

		return this.validProductionSyntax(sections[0]) && this.isNumber(prevNumStr);
	}

	/**
	 * Returns a value indicating if the version is a preview version.
	 * @param version The version to check.
	 * @returns True if the version is a preview version.
	 */
	private isPreview (version: string): boolean {
		return version.includes("-preview.") &&
			!version.startsWith("-preview.") &&
			!version.endsWith("-preview.");
	}

	/**
	 * Returns a value indicating if the number string is a valid number.
	 * @param numStr The string representation of a number.
	 * @returns True if the string value is a number.
	 */
	private isNumber (numStr: string): boolean {
		let isNumberCharacter: boolean = true;

		for (const v of numStr) {
			if (!this.numbers.includes(v)) {
				isNumberCharacter = false;
				break;
			}
		}

		return !numStr.includes("-") &&
			!numStr.includes(".") &&
			isNumberCharacter;
	}
}