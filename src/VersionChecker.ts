import { IValidResult } from "./interfaces/IValidResult";
import { VersionNumber } from "./Enums";
import { inject, injectable } from "tsyringe";
import { INugetAPI } from "./interfaces/INugetAPI";
import { IAction } from "./helpers/IAction";

/**
 * Checks versions to verify if they are the correct syntax, obey
 * the rules of semantic versioning, and do not conflict with currently
 * published version on nuget.org
 */
@injectable()
export class VersionChecker {
	private readonly numbers: string[] = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ];
	
	private readonly nugetAPI: INugetAPI;
	
	private readonly action: IAction;

	private publishedVersions: string[] = [];

	/**
	 * Creates a new instance of VersionChecker.
	 * @param nugetAPI Gets information from nuget.org
	 */
	constructor (@inject("INugetAPI") nugetAPI: INugetAPI,
		@inject("IAction") action: IAction) {
		this.nugetAPI = nugetAPI;
		this.action = action;
	}
	
	/**
	 * Returns a value indicating if the given version is valid.
	 * @param version The version to check.
	 * @returns True if the version is valid.
	 */
	public async isValid (version: string): Promise<IValidResult> {
		const isValidSyntax: boolean = this.isValidSyntax(version);
		this.publishedVersions = await this.nugetAPI.getPublishedVersions();

		const isValidResult: IValidResult = {
			isValid: true,
			message: "Version Valid",
		};

		if (isValidSyntax) {
			const alreadyExistsResult: IValidResult = this.versionAlreadyExists(version);

			if (alreadyExistsResult.isValid) {
				/* eslint-disable @typescript-eslint/quotes */
				isValidResult.message = `\n💡 - To check if the version already exists in nuget.org,`;
				isValidResult.message += `\nmake sure to set the 'check-nuget' and 'fail-if-nuget-version-exists'`;
				isValidResult.message += ` action inputs to 'true'.\n`;
				/* eslint-enable @typescript-eslint/quotes */				
			} else {
				return await Promise.resolve(alreadyExistsResult);
			}
			
			const tooLargeResult: IValidResult = this.isVersionTooLarge(version);

			if (!tooLargeResult.isValid) {
				return await Promise.resolve(tooLargeResult);
			}
			
			const tooSmallResult: IValidResult = this.isVersionTooSmall(version);

			if (!tooSmallResult.isValid) {
				return await Promise.resolve(tooSmallResult);
			}

			return await Promise.resolve(isValidResult);
		} else {
			let validSyntaxMsg: string = "Valid syntax is as follows:";
			validSyntaxMsg += "\n\tProduction Version: <major>.<minor>.<patch>";
			validSyntaxMsg += "\n\tPreview Version: <major>.<minor>.<patch>-preview.<preview-number>";
			validSyntaxMsg += "\n\tProduction Example: 1.2.3";
			validSyntaxMsg += "\n\tPreview Example: 1.2.3-preview.4";

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
	 * Returns a value indicating if the given version already exists in nuget.org.
	 * @param version The version to check.
	 * @returns True if the given version already is published to nuget.org.
	 */
	private versionAlreadyExists (version: string): IValidResult {
		const result: IValidResult = {
			isValid: true,
			message: "",
		};

		const checkNuget: string = this.action.getInput("check-nuget");
		const failIfNugetVersionExists: string = this.action.getInput("fail-if-nuget-version-exists");

		if (checkNuget === "true" &&
			failIfNugetVersionExists === "true" &&
			this.publishedVersions.includes(version)) {
			result.isValid = false;
			result.message = `The version '${version}' has already been published to nuget.org.`;

			return result;
		}

		return result;
	}

	/**
	 * Returns a value indicating if the given version is too large compared to
	 * the latest version currently published in nuget.org
	 * @param version The version to check against what is currently published.
	 * @returns True if the version is too large.
	 */
	private isVersionTooLarge (version: string): IValidResult {
		const result: IValidResult = {
			isValid: true,
			message: "",
		};

		const checkNuget: string = this.action.getInput("check-nuget");

		if (checkNuget === "false") {
			return result;
		}

		const latestVersion: string = this.getLatestVersion();

		const latestInPreview: boolean = this.isPreview(latestVersion);
		const currentInPreview: boolean = this.isPreview(version);

		const latestMajor: number = this.getVersionNum(latestVersion, VersionNumber.Major);
		const latestMinor: number = this.getVersionNum(latestVersion, VersionNumber.Minor);
		const latestPatch: number = this.getVersionNum(latestVersion, VersionNumber.Patch);
		const latestPrevNum: number = latestInPreview
			? this.getPreviewNumber(latestVersion)
			: 0;

		const currentMajor: number = this.getVersionNum(version, VersionNumber.Major);
		const currentMinor: number = this.getVersionNum(version, VersionNumber.Minor);
		const currentPatch: number = this.getVersionNum(version, VersionNumber.Patch);
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
				result.isValid = false;
				
				result.message = "Cannot change the major, minor, or patch while the latest is in preview.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;
			}
		}

		// If the major, minor, patch section has not been changed, check preview changes
		if (isMajorUnchanged && isMinorUnchanged && isPatchUnchanged) {
			// If the attempted preview number increase is too large
			if (currentPrevNum - latestPrevNum > 1) {
				result.isValid = false;
				result.message = "The preview number is too large.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;
			}
		} else {
			if (isMajorIncremented) {
				// If the major is too large, or the minor or patch have been incremented,
				// of the preview number is too large.
				if (currentMajor - latestMajor > 1 ||
					currentMinor > 0 || currentPatch > 0 ||
					currentPrevNum - latestPrevNum > 1) {
					result.isValid = false;

					result.message = "When incrementing the major, it can only be increased by 1.";
					result.message += "\nWhen incrementing the major, the minor and patch must must be 0.";
					result.message += "\nWhen incrementing the major, can only increased the preview number by 1.";
					result.message += `\nLatest Published Preview Version: ${latestVersion}`;
					result.message += `\nAttempted Version: ${version}`;

					return result;
				}
			}
	
			if (isMinorIncremented) {
				if (currentMinor - latestMinor > 1 || currentPatch > 0 ||
					currentPrevNum - latestPrevNum > 1) {
					result.isValid = false;

					result.message = "When incrementing the minor, it can only be increased by 1.";
					result.message += "\nWhen incrementing the minor, the patch must be 0.";
					result.message += "\nWhen incrementing the minor, can only increased the preview number by 1.";
					result.message += `\nLatest Published Preview Version: ${latestVersion}`;
					result.message += `\nAttempted Version: ${version}`;

					return result;
				}
			}
	
			if (isPatchIncremented) {
				if (currentPatch - latestPatch > 1 ||
					currentPrevNum - latestPrevNum > 1) {
					result.isValid = false;

					result.message = "When incrementing the patch, it can only be increased by 1.";
					result.message += "\nWhen incrementing the minor, can only increased the preview number by 1.";
					result.message += `\nLatest Published Preview Version: ${latestVersion}`;
					result.message += `\nAttempted Version: ${version}`;

					return result;
				}
			}
		}

		return result;
	}

	/**
	 * Returns a value indicating if the given version is too small compared to
	 * the latest version currently published in nuget.org
	 * @param version The version to check against what is currently published.
	 * @returns True if the version is too small.
	 */
	private isVersionTooSmall (version: string): IValidResult {
		const result: IValidResult = {
			isValid: true,
			message: "",
		};

		const checkNuget: string = this.action.getInput("check-nuget");

		if (checkNuget === "false") {
			return result;
		}

		const latestVersion: string = this.getLatestVersion();

		const latestMajor: number = this.getVersionNum(latestVersion, VersionNumber.Major);
		const latestMinor: number = this.getVersionNum(latestVersion, VersionNumber.Minor);
		const latestPatch: number = this.getVersionNum(latestVersion, VersionNumber.Patch);
		const latestPrevNum: number = this.isPreview(latestVersion)
			? this.getPreviewNumber(latestVersion)
			: 0;

		const currentMajor: number = this.getVersionNum(version, VersionNumber.Major);
		const currentMinor: number = this.getVersionNum(version, VersionNumber.Minor);
		const currentPatch: number = this.getVersionNum(version, VersionNumber.Patch);
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
			// If preview number is smaller then the latest published
			if (currentPrevNum < latestPrevNum) {
				result.isValid = false;
				result.message = "The version is smaller then the latest published version.";
				result.message += "\nThe preview number is too small.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;
			}
		} else {
			if (isMajorDecremented) {
				result.isValid = false;
				result.message = "The version is smaller then the latest published version.";
				result.message += "\nThe major number is too small.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;
			}
			
			if (isMajorUnchanged && isMinorDecremented) {
				result.isValid = false;
				result.message = "The version is smaller then the latest published version.";
				result.message += "\nThe minor number is too small.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;			
			}
			
			if (isMajorUnchanged && isMinorUnchanged && isPatchDecremented) {
				result.isValid = false;
				result.message = "The version is smaller then the latest published version.";
				result.message += "\nThe patch number is too small.";
				result.message += `\nLatest Published Preview Version: ${latestVersion}`;
				result.message += `\nAttempted Version: ${version}`;

				return result;
			}
		}

		return result;
	}

	/**
	 * The latest version currently published in nuget.or
	 * @returns The latest version.
	 */
	private getLatestVersion (): string {
		let filteredVersions: string[] = [];

		// Filter out major versions
		filteredVersions = this.filterByVersionNumber(this.publishedVersions, VersionNumber.Major);

		// Filter out minor versions
		filteredVersions = this.filterByVersionNumber(filteredVersions, VersionNumber.Minor);

		// Filter out patch versions
		filteredVersions = this.filterByVersionNumber(filteredVersions, VersionNumber.Patch);

		// If any preview versions are left, filter out preview versions
		if (filteredVersions.some(v => v.includes("-preview."))) {
			filteredVersions = this.filterByVersionNumber(filteredVersions, VersionNumber.Preview);
		}

		return filteredVersions[0];
	}

	/**
	 * Returns a filtered list of versions where all versions with the largest number by
	 * the given version number.
	 * @param versions The version to filter through.
	 * @param number The number to use to filter.
	 * @returns The filtered result of the versions.
	 * @example
	 * ``` ts
	 * // The example below would return the a list with the largest patch number.
	 * const versions: string[] = [ "1.2.3", "1.2.4" ];
	 * this.filterByVersionNumber(versions, VersionNumber.Patch); 
	 * ```
	 */
	private filterByVersionNumber (versions: string[], number: VersionNumber): string[] {
		let largest: number = 0;

		versions.forEach(v => {
			const current: number = this.getVersionNum(v, number);

			largest = current > largest
				? current
				: largest;
		});

		return versions.filter(v => {
			return this.getVersionNum(v, number) === largest;
		});
	}

	/**
	 * Returns the given extracted number from the given version.
	 * @param version The version to extract the number from.
	 * @param number The number to extract.
	 * @returns The extracted number.
	 * @example
	 * ``` ts
	 * // Returns the value '2'
	 * this.getVersionNum ("1.2.3-preview.4", VersionNumber.Minor);
	 * ```
	 */
	private getVersionNum (version: string, number: VersionNumber): number {
		let mainSection: string = version;

		const numberSections: string[] = mainSection.split(".");

		switch (number) {
			case VersionNumber.Major:
				return parseInt(numberSections[0]);
			case VersionNumber.Minor:
				return parseInt(numberSections[1]);
			case VersionNumber.Patch:
				return parseInt(numberSections[2]);
			case VersionNumber.Preview:
				if (this.isPreview(version)) {
					return this.getPreviewNumber(version);
				} else  {
					return -1;
				}
		}
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
