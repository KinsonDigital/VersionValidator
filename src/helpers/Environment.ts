import { ActionInputs } from "../interfaces/ActionInputs";
import { inject, injectable } from "tsyringe";
import { IFileLoader } from "./IFileLoader";
import { IEnvironment } from "./IEnvironment";
import { IFileIO } from "./IFileIO";
import { CurrentEnvironment } from "../Enums";

/**
 * Returns the current environment.
 */
@injectable()
export class Environment implements IEnvironment {
	private fileLoader: IFileLoader;

	private inputs: ActionInputs;

	private fileIO: IFileIO;

	private currentEnvironment: CurrentEnvironment = CurrentEnvironment.Development;

	/**
	 * Creates a new instance of Environment.
	 */
	constructor (@inject("IFileLoader") fileLoader: IFileLoader,
				 @inject("IFileIO") fileIO: IFileIO) {
		this.fileLoader = fileLoader;
		this.fileIO = fileIO;
		this.inputs = {
			"nuget-package-name": "",
			"version": "",
			"check-nuget": "false",
			"fail-if-nuget-version-exists": "false",
		};

		// The env.json file will not exist in production and is not
		// committed to the repository.		
		if (this.fileIO.exists("./env.json")) {
			let fileData: string = this.fileLoader.loadEnvFile("./env.json");

			try {
				this.inputs = JSON.parse(fileData);

				if (this.hasProperty(this.inputs, "nuget-package-name") &&
					this.hasProperty(this.inputs, "version") &&
					this.hasProperty(this.inputs, "check-nuget") && 
					this.hasProperty(this.inputs, "fail-if-nuget-version-exists")) {
					this.currentEnvironment = CurrentEnvironment.Development;
				} else {
					this.currentEnvironment = CurrentEnvironment.Production;	
				}
			} catch (error) {
				this.currentEnvironment = CurrentEnvironment.Production;
			}
		} else {
			this.currentEnvironment = CurrentEnvironment.Production;
		}
	}

	/**
	 * Gets the current environment.
	 */
	public get Environment (): CurrentEnvironment {
		return this.currentEnvironment;
	}

	/**
	 * @inheritdoc
	 */
	public isProd (): boolean {
		return this.currentEnvironment === CurrentEnvironment.Production;
	}

	/**
	 * @inheritdoc
	 */
	public isDevelop (): boolean {
		return this.currentEnvironment === CurrentEnvironment.Development;
	}

	/**
	 * @inheritdoc
	 */
	public getVarValue (varName: string, throwErrorWhenNotFound: boolean = true): string {
		for (const [key, value, ] of Object.entries(this.inputs)) {
			if (key === varName) {
				return value;
			}
		}

		if (throwErrorWhenNotFound) {
			throw new Error(`Could not find the environment variable '${varName}'.`);
		}

		return `! ! '${varName}' not found ! !`;
	}

	/**
	 * Returns a value indicating if the given property was found on the given object.
	 * @param obj The object to check the property for.
	 * @param name The name of the property to check for.
	 * @returns True if the given property was found on the given object.
	 */
	private hasProperty (obj: object, name: string): boolean {
		return Object.keys(obj).includes(name);
	}
}