import each from "jest-each";
import { IsValidResult } from "../src/interfaces/IsValidResult";
import { NugetAPI } from "../src/NugetAPI";
import { VersionChecker } from "../src/VersionChecker";

each([
	// NO CHANGE TESTS
	["1.2.3", [ "1.2.3" ], false],
	["1.2.3-preview.1", [ "1.2.3-preview.1" ], false],

	// SYNTAX TESTS
	["1.2.3-preview.4", 	[ "1.2.3-preview.4", "1.0.0" ], false],
	["v1.2.3-preview.5",	[ "1.2.3", "1.0.0" ], false], // Preview Too Large
	["", 					[ "1.2.3", "1.0.0" ], false], // Empty Version
	[undefined, 			[ "1.2.3", "1.0.0" ], false], // Undefined Version
	[null, 					[ "1.2.3", "1.0.0" ], false], // Null Version
	["X.2.3-preview.4", 	[ "1.2.3", "1.0.0" ], false], // Non Numerical Major
	["1.X.3-preview.4", 	[ "1.2.3", "1.0.0" ], false], // Non Numerical Minor
	["1.2.X-preview.4", 	[ "1.2.3", "1.0.0" ], false], // Non Numerical Patch
	["1.2.3-preview.X", 	[ "1.2.3", "1.0.0" ], false], // Non Numerical Preview
	["1.2.3-XXXX.4", 		[ "1.2.3", "1.0.0" ], false],  // Incorrect Preview String
	["12.3-preview.4", 		[ "1.2.3", "1.0.0" ], false], // Missing Patch
	["1.23-preview.4", 		[ "1.2.3", "1.0.0" ], false], // Missing Patch
	["1.2.3preview.4", 		[ "1.2.3", "1.0.0" ], false], // Missing hyphen
	["1.2.3-preview4", 		[ "1.2.3", "1.0.0" ], false], // Missing Preview Number Delimiter
	["1.2.3-preview.", 		[ "1.2.3", "1.0.0" ], false], // Missing Preview Number
	["1.2.3-preview", 		[ "1.2.3", "1.0.0" ], false], // Missing Preview Number Delimiter & Number

	// NON-PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED DECREASE TESTS
	["0.2.3", [ "1.2.3", "1.0.0"], false], // Major ⬇
	["1.1.3", [ "1.2.3", "1.0.0"], false], // Minor ⬇
	["1.2.2", [ "1.2.3", "1.0.0"], false], // Patch ⬇
	["0.1.3", [ "1.2.3", "1.0.0"], false], // Major & Minor ⬇
	["0.2.2", [ "1.2.3", "1.0.0"], false], // Major & Patch ⬇
	["1.1.2", [ "1.2.3", "1.0.0"], false], // Minor & Patch ⬇

	// NON-PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED INCREASE TESTS
	["2.0.0", [ "1.2.3", "1.0.0"], true],
	["1.3.0", [ "1.2.3", "1.0.0"], true],
	["1.2.4", [ "1.2.3", "1.0.0"], true],
	["3.0.0", [ "1.2.3", "1.0.0"], false], // Major increase too high
	["1.4.0", [ "1.2.3", "1.0.0"], false], // Minor increase too high
	["1.2.5", [ "1.2.3", "1.0.0"], false], // Patch increase too high
	["2.1.0", [ "1.2.3", "1.0.0"], false], // Major & minor both changed
	["2.0.1", [ "1.2.3", "1.0.0"], false], // Major & patch both changed
	["1.3.1", [ "1.2.3", "1.0.0"], false], // Minor & patch both changed

	// NON-PREVIEW CURRENT & PREVIEW LATEST PUBLISHED INCREASE TESTS
	["2.0.0", [ "1.2.3-preview.4", "1.0.0"], false], // Latest is preview but major changed
	["1.3.3", [ "1.2.3-preview.4", "1.0.0"], false], // Latest is preview but minor changed
	["1.2.4", [ "1.2.3-preview.4", "1.0.0"], false], // Latest is preview but patch changed

	// PREVIEW CURRENT & NON-PREVIEW LATEST PUBLISHED INCREASE TESTS
	["2.0.0-preview.1", [ "1.2.3", "1.0.0"], true],
	["1.3.0-preview.1", [ "1.2.3", "1.0.0"], true],
	["1.2.4-preview.1", [ "1.2.3", "1.0.0"], true],
	["3.0.0-preview.1", [ "1.2.3", "1.0.0"], false], // Major increase too high
	["1.4.0-preview.1", [ "1.2.3", "1.0.0"], false], // Minor increase too high
	["1.2.5-preview.1", [ "1.2.3", "1.0.0"], false], // Patch increase too high
	["2.1.0-preview.1", [ "1.2.3", "1.0.0"], false], // Major & minor both changed
	["2.0.1-preview.1", [ "1.2.3", "1.0.0"], false], // Major & patch both changed
	["1.3.1-preview.1", [ "1.2.3", "1.0.0"], false], // Minor & patch both changed
	["2.0.0-preview.2", [ "1.2.3", "1.0.0"], false], // Preview Too Large
	
	// PREVIEW CURRENT & PREVIEW LATEST PUBLISHED DECREASE TESTS
	["1.2.3-preview.5", [ "1.2.3-preview.4", "1.0.0" ], true],
	["1.2.3-preview.6", [ "1.2.3-preview.4", "1.0.0" ], false], // Preview Too Large
	["2.0.0-preview.5", [ "1.2.3-preview.4", "1.0.0" ], false], // Latest is preview but major changed
	["1.3.3-preview.5", [ "1.2.3-preview.4", "1.0.0" ], false], // Latest is preview but minor changed
	["1.2.4-preview.5", [ "1.2.3-preview.4", "1.0.0" ], false], // Latest is preview but patch changed	
	["0.2.3-preview-1", [ "1.2.3-preview.1", "1.0.0" ], false], // Major ⬇
	["1.1.3-preview-1", [ "1.2.3-preview.1", "1.0.0" ], false], // Minor ⬇
	["1.2.2-preview-1", [ "1.2.3-preview.1", "1.0.0" ], false], // Patch ⬇
	["1.2.3-preview-1", [ "1.2.3-preview.2", "1.0.0" ], false], // Preview ⬇
	["0.1.3-preview.1", [ "1.2.3-preview.1", "1.0.0" ], false], // Major & Minor ⬇
	["0.2.2-preview.1", [ "1.2.3-preview.1", "1.0.0" ], false], // Major & Patch ⬇
	["1.1.2-preview.1", [ "1.2.3-preview.1", "1.0.0" ], false], // Minor & Patch ⬇	
])
.test("isValid() | With Preview Version \'%s\' | Returns Correct Result",
	async (version: string, publishedVersions: string[], expected: boolean) => {
	// Arrange
	const nugetAPI: NugetAPI = new NugetAPI();
	nugetAPI.getPublishedVersions = jest.fn(() => {
		return Promise.resolve(publishedVersions);
	});

	const checker: VersionChecker = new VersionChecker(nugetAPI);

	// Act
	const actual: IsValidResult = await checker.isValid(version);

	// Assert
	expect(actual.isValid).toEqual(expected);
});

// TODO: If the latest version is currently in preview, we cannot change the main version sections

// each([
// 	["2.0.0", true],
// 	["1.3.0", true],
// 	["1.2.4", true],
// 	["1.2.2", false],
// 	["1.1.2", false],
// 	["0.2.3", false],
// 	["2.1.0", false],
// 	["2.3.1", false],
// 	["1.2.3", false],
// 	["1.2.5", false],
// 	["1.0.2", false],
// 	["X.2.3", false],
// 	["1.X.3", false],
// 	["1.2.X", false],
// 	["12.3", false],
// 	["1.23", false],
// 	["123", false],
// ])
// .test("isValid() | With Production Version \'%s\' | Returns \'%s\'", async (version: string, expected: boolean) => {
// 	expect(true).toBeTruthy();
// 	return;
// 	// Arrange
// 	const nugetAPI: NugetAPI = new NugetAPI();
// 	nugetAPI.getPublishedVersions = jest.fn(() => {
// 		return Promise.resolve(["1.2.3"]);
// 	});

// 	const checker: VersionChecker = new VersionChecker(nugetAPI);

// 	// Act
// 	const actual: IsValidResult = await checker.isValid(version);

// 	// Assert
// 	expect(actual.isValid).toEqual(expected);
// });