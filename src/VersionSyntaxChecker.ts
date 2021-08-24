export class VersionSyntaxChecker {
	public isValid (version: string): boolean {
		if (version.startsWith("v")) {
			return false;
		}
		
		if (this.isPreview(version)) {
			return this.validPreviewVersion(version);
		} else {
			return this.validProductionVersion(version);
		}
	}

	private validProductionVersion (version: string): boolean {
		const sections: string[] = version.split(".");
		const totalSections: number = 3;

		if (sections.length != totalSections) {
			return false;
		}

		return this.isNumber(sections[0]) && this.isNumber(sections[1]) && this.isNumber(sections[2]);
	}

	private validPreviewVersion (version: string): boolean {
		const mainSections: string[] = version.split("-");
		const previewNumString: string = mainSections[1].split(".")[1];
		return this.validProductionVersion(mainSections[0]) && this.isNumber(previewNumString);
	}

	private isPreview (version: string): boolean {
		return version.includes("-preview.") &&
			!version.startsWith("-preview.") &&
			!version.endsWith("-preview.");
	}

	private isNumber(numString: string): boolean {
		return !numString.includes("-") &&
			!numString.includes(".") &&
			/\d+$/g.test(numString);
	}
}