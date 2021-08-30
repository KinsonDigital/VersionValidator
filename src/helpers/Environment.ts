import { existsSync } from "fs";
import { ActionInputs } from "../interfaces/ActionInputs";
import { inject, injectable } from "tsyringe";
import { IFileLoader } from "./IFileLoader";
import { IEnvironment } from "./IEnvironment";

/**
 * Returns the current environment.
 */
@injectable()
export class Environment implements IEnvironment {
	/* eslint-disable @typescript-eslint/lines-between-class-members */
	private fileLoader: IFileLoader;
	private inputs: ActionInputs;
	/* eslint-enable @typescript-eslint/lines-between-class-members */

	/**
	 * Creates a new instance of Environment.
	 */
	constructor (@inject("IFileLoader") fileLoader: IFileLoader) {
		this.fileLoader = fileLoader;
		let fileData: string = "";

		// The env.json file will not exist in production and is not
		// committed to the repository.		
		if (existsSync("./env.json")) {
			fileData = this.fileLoader.loadEnvFile("./env.json");
			this.inputs = JSON.parse(fileData);
		} else {
			// This branch only runs if a production version.
			// Set to environment value of production			
			this.inputs = {
				environment: "production",
				nugetPackageName: "",
				version: "",
				checkNuget: false,
				failIfNugetVersionExists: false,
			};
		}
	}

	/**
	 * @inheritdoc
	 */
	public isProd (): boolean {
		/* eslint-disable @typescript-eslint/no-unsafe-member-access */
		/* eslint-disable @typescript-eslint/indent */
		for (const [key, value, ] of Object.entries(this.inputs)) {
			if (key === "environment") {
				switch (value.toString().toLowerCase()) {
					case "prod":
					case "production":
					case "":
					case null:
					case undefined:
						return true;
					default:
						return false;
				}
			}
		}

		return false;
		/* eslint-enable @typescript-eslint/no-unsafe-member-access */
		/* eslint-enable @typescript-eslint/indent */
	}

	/**
	 * @inheritdoc
	 */
	public isDevelop (): boolean {
		/* eslint-disable @typescript-eslint/no-unsafe-member-access */
		for (const [key, value, ] of Object.entries(this.inputs)) {
			if (key === "environment") {
				let stringValue: string = value.toString().toLowerCase();
				return stringValue === "dev" || stringValue === "develop";
			}
		}

		return false;
		/* eslint-enable @typescript-eslint/no-unsafe-member-access */
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

		return "";
	}
}