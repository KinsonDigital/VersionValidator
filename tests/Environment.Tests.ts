import "reflect-metadata";
import { CurrentEnvironment } from "../src/Enums";
import { Environment } from "../src/helpers/Environment";
import { IFileIO } from "../src/helpers/IFileIO";
import { IFileLoader } from "../src/helpers/IFileLoader";
import { IActionInputs } from "../src/interfaces/IActionInputs";
import { eachParams2 } from "./utils/utils";


describe("Environment ->", () => {
	let mockLoader: IFileLoader | null = null;
	let mockFileIO: IFileIO | null = null;
	let actionInputs: IActionInputs | null = null;

	beforeEach(() => {
		mockLoader = {
			loadEnvFile: (): string => "",
		};

		mockFileIO = {
			exists: (): boolean => true,
		};

		actionInputs = {
			"nuget-package-name": "MyOrg.MyLib",
			"version": "v1.2.3-preview.4",
			"check-nuget": "true", 
			"fail-if-nuget-version-exists": "true",
		};
	});

	afterEach(() => {
		mockLoader = null;
		mockFileIO = null;
		actionInputs = null;
	});

	eachParams2([
		{
			p1: "{\"nuget-^package-^name\":\"MyOrg.MyLib\",\"version\":\"v1.2.3-preview.4\",\"check-nuget\":\"true\",\"fail-if-nuget-version-exists\":\"true\"}",
			p2: CurrentEnvironment.Production,
		},
		{
			p1: "{\"nuget-package-name\":\"MyOrg.MyLib\",\"ver^^sion\":\"v1.2.3-preview.4\",\"check-nuget\":\"true\",\"fail-if-nuget-version-exists\":\"true\"}",
			p2: CurrentEnvironment.Production,
		},
		{
			p1: "{\"nuget-package-name\":\"MyOrg.MyLib\",\"version\":\"v1.2.3-preview.4\",\"check^-^nuget\":\"true\",\"fail-if-nuget-version-exists\":\"true\"}",
			p2: CurrentEnvironment.Production,
		},
		{
			p1: "{\"nuget-package-name\":\"MyOrg.MyLib\",\"version\":\"v1.2.3-preview.4\",\"check-nuget\":\"true\",\"fail-if-^nuget-version-^exists\":\"true\"}",
			p2: CurrentEnvironment.Production,
		},
		{
			p1: "{\"nuget-package-name\":\"MyOrg.MyLib\",\"version\":\"v1.2.3-preview.4\",\"check-nuget\":\"true\",\"fail-if-nuget-version-exists\":\"true\"}",
			p2: CurrentEnvironment.Development,
		},
	], (envJSON: string, currentEnv: CurrentEnvironment) => {
		it(`Environment -> When Parsing Environment JSON -> Runs As \'${currentEnv}\'`, () => {
			// Arrange
			spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
			spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue(envJSON);
			
			const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);
			
			// Act
			const actual: CurrentEnvironment = env.Environment;
			
			// Assert
			expect(actual).toBe(currentEnv);
		});
	});

	it("isProd() -> When Environment JSON Does Not Exist -> Returns True", () => {
		// Arrange
		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(false);
		
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);
		
		// Act
		const actual: boolean = env.isProd();
		
		// Assert
		expect(actual).toBe(true);
	});

	it("isDevelop() -> When Environment Does Exist -> Returns True", () => {
		// Arrange
		const testDataJSON: string = JSON.stringify(actionInputs);
		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
		spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue(testDataJSON);
		
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);
		
		// Act
		const actual: boolean = env.isDevelop();
		
		// Assert
		expect(actual).toBe(true);
	});

	it("getVarValue() -> When Invoked -> Returns Environment Value", () => {
		// Arrange
		const actionInputsJSON: string = JSON.stringify(actionInputs);
		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
		spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue(actionInputsJSON);
		
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);

		// Act
		const actual: string = env.getVarValue("nuget-package-name");

		// Assert
		expect(actual).toBe("MyOrg.MyLib");
	});

	it("getVarValue() -> When Setup To Throw Error When Not Found -> Throws Correct Error", () => {
		// Arrange
		const actionInputsJSON: string = 
		`{
			\"nuget-package-name\":\"MyOrg.MyLib\",
			\"version\":\"v1.2.3-preview.4\",
			\"check-nuget\":\"true\",
			\"fail-if-nuget-version-exists\":\"true\"
		}`;

		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
		spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue(actionInputsJSON);
		
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);

		// Act
		try {
			env.getVarValue("unknown-key", true);
		} catch (error: Error | unknown) {
			// Assert
			expect((<Error>error).message).toBe("Could not find the environment variable 'unknown-key'.");
		}
	});

	it("getVarValue() -> When Not Setup To Throw An Error When Not Found -> Returns Correct Result", () => {
		// Arrange
		const actionInputsJSON: string = 
		`{
			\"nuget-package-name\":\"MyOrg.MyLib\",
			\"version\":\"v1.2.3-preview.4\",
			\"check-nuget\":\"true\",
			\"fail-if-nuget-version-exists\":\"true\"
		}`;

		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
		spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue(actionInputsJSON);
		
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);

		// Act
		const actual: string = env.getVarValue("unknown-key", false);

		// Assert
		expect(actual).toBe("! ! 'unknown-key' not found ! !");
	});

	it("Ctor() -> With Issue Parsing Environment JSON -> Setup As Production", () => {
		// Arrange
		spyOn(<IFileIO>mockFileIO, "exists").and.returnValue(true);
		spyOn(<IFileLoader>mockLoader, "loadEnvFile").and.returnValue("invalid-json-data");
		
		// Act
		const env: Environment = new Environment(<IFileLoader>mockLoader, <IFileIO>mockFileIO);
		const actual: CurrentEnvironment = env.Environment;

		// Assert
		expect(actual).toBe(CurrentEnvironment.Production);
	});
});
