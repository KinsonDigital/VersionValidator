import "reflect-metadata";
import { container } from "tsyringe";
import { IAction } from "../src/helpers/IAction";
import { INugetAPI } from "../src/interfaces/INugetAPI";
import { IsValidResult } from "../src/interfaces/IsValidResult";
import { VersionChecker } from "../src/VersionChecker";
import { eachParams3 } from "./utils/utils";

describe("VersionChecker ->", () => {
	eachParams3([
		// NO CHANGE TESTS
		{ p1: "1.2.3", p2: [ "1.2.3", ], p3: false, },
		{ p1: "1.2.3-preview.1", p2: ["1.2.3-preview.1", ], p3: false, },

		// SYNTAX TESTS
		{ p1: "1.2.3-preview.4", 	p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, },
		{ p1: "v1.2.3-preview.5",	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Preview Too Large
		{ p1: "", 					p2: ["1.2.3", "1.0.0", ], p3: false, }, // Empty Version
		{ p1: "X.2.3-preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Non Numerical Major
		{ p1: "1.X.3-preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Non Numerical Minor
		{ p1: "1.2.X-preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Non Numerical Patch
		{ p1: "1.2.3-preview.X", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Non Numerical Preview
		{ p1: "1.2.3-XXXX.4", 		p2: ["1.2.3", "1.0.0", ], p3: false, },  // Incorrect Preview String
		{ p1: "12.3-preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing Patch
		{ p1: "1.23-preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing Patch
		{ p1: "1.2.3preview.4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing hyphen
		{ p1: "1.2.3-preview4", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing Preview Number Delimiter
		{ p1: "1.2.3-preview.", 	p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing Preview Number
		{ p1: "1.2.3-preview", 		p2: ["1.2.3", "1.0.0", ], p3: false, }, // Missing Preview Number Delimiter & Number

		// NON-PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED DECREASE TESTS
		{ p1: "0.2.3", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major ⬇
		{ p1: "1.1.3", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor ⬇
		{ p1: "1.2.2", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Patch ⬇
		{ p1: "0.1.3", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & Minor ⬇
		{ p1: "0.2.2", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & Patch ⬇
		{ p1: "1.1.2", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor & Patch ⬇

		// NON-PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED INCREASE TESTS
		{ p1: "2.0.0", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "1.3.0", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "1.2.4", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "3.0.0", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major increase too high
		{ p1: "1.4.0", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor increase too high
		{ p1: "1.2.5", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Patch increase too high
		{ p1: "2.1.0", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & minor both changed
		{ p1: "2.0.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & patch both changed
		{ p1: "1.3.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor & patch both changed

		// NON-PREVIEW CURRENT & PREVIEW LATEST PUBLISHED INCREASE TESTS
		{ p1: "2.0.0", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but major changed
		{ p1: "1.3.3", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but minor changed
		{ p1: "1.2.4", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but patch changed

		// PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED INCREASE TESTS
		{ p1: "2.0.0-preview.1", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "1.3.0-preview.1", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "1.2.4-preview.1", p2: ["1.2.3", "1.0.0", ], p3: true, },
		{ p1: "3.0.0-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major increase too high
		{ p1: "1.4.0-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor increase too high
		{ p1: "1.2.5-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Patch increase too high
		{ p1: "2.1.0-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & minor both changed
		{ p1: "2.0.1-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Major & patch both changed
		{ p1: "1.3.1-preview.1", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Minor & patch both changed
		{ p1: "2.0.0-preview.2", p2: ["1.2.3", "1.0.0", ], p3: false, }, // Preview Too Large
		
		// PREVIEW CURRENT & PREVIEW LATEST PUBLISHED INCREASE TESTS
		{ p1: "1.2.3-preview.6", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Preview Too Large

		// PREVIEW CURRENT & PREVIEW LATEST PUBLISHED DECREASE TESTS
		{ p1: "1.2.3-preview.5", p2: ["1.2.3-preview.4", "1.0.0", ], p3: true, },

		{ p1: "1.2.3-preview.3", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Preview number too small
		
		{ p1: "2.0.0-preview.5", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but major changed
		{ p1: "1.3.3-preview.5", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but minor changed
		{ p1: "1.2.4-preview.5", p2: ["1.2.3-preview.4", "1.0.0", ], p3: false, }, // Latest is preview but patch changed	
		{ p1: "0.2.3-preview-1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Major ⬇
		{ p1: "1.1.3-preview-1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Minor ⬇
		{ p1: "1.2.2-preview-1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Patch ⬇
		{ p1: "1.2.3-preview-1", p2: ["1.2.3-preview.2", "1.0.0", ], p3: false, }, // Preview ⬇
		{ p1: "0.1.3-preview.1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Major & Minor ⬇
		{ p1: "0.2.2-preview.1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Major & Patch ⬇
		{ p1: "1.1.2-preview.1", p2: ["1.2.3-preview.1", "1.0.0", ], p3: false, }, // Minor & Patch ⬇
	], (version: string, publishedVersions: string[], expected: boolean) => {
		const publishedVersionsStr: string = publishedVersions.toString();

		it(`isValid -> With Preview Version \'${version}\' -> Returns \'${expected}\'\nPublished Versions: ${publishedVersionsStr}`, async () => {
			// Arrange
			let mockNugetAPI: INugetAPI = {
				getPublishedVersions: (): Promise<string[]> => {
					return Promise.resolve(publishedVersions);
				},
			};

			let mockAction: IAction = {
				setOutput: () =>  { },
				getInput: () =>  "",
				info: () => { },
				warning: () => { },
				setFailed: () => { },
			};
			
			container.register("INugetAPI", { useFactory: () => mockNugetAPI, });
			container.register("IAction", { useFactory: () => mockAction, });
			
			spyOn(mockAction, "getInput")
				.withArgs("version").and.returnValue(version)
				.withArgs("check-nuget").and.returnValue("true")
				.withArgs("fail-if-nuget-version-exists").and.returnValue("true");

			const checker: VersionChecker = container.resolve(VersionChecker);

			// Act
			const actual: IsValidResult = await checker.isValid(version);

			// Assert
			expect(actual.isValid).toEqual(expected);
		});
	});
});