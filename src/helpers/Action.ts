import { getInput, setOutput, info, warning, setFailed, InputOptions } from "@actions/core";
import { inject, injectable } from "tsyringe";
import { IAction } from "./IAction";
import { IEnvironment } from "./IEnvironment";

/**
 * Represents different action functionality.
 * This wraps @action/github functionality for the purpose of testing in the DEV environment.
 */
@injectable()
export class Action implements IAction {
	private environment: IEnvironment;

	private devEnvOutputs: Record<string, any> = {};

	private requiredInputs: string[] = ["nuget-package-name", "version", ];

	/**
	 * Creates a new instance of ActionInputs
	 */
	constructor (@inject("IEnvironment") environment: IEnvironment) {
		this.environment = environment;
	}

	/**
	 * Returns the value of the input that matches the given input.
	 * @param name The name of the input.
	 * @returns The value of the given input.
	 */
	public getInput (name: string): string {
		if (this.environment.isDevelop()) {
			// Development version pulls from the 'env.json' file for testing
			let isRequired: boolean = this.requiredInputs.includes(name);

			return this.environment.getVarValue(name, isRequired);
		} else if (this.environment.isProd()) {
			// Production version pulls the inputs from the YAML file
			let options: InputOptions = {
				required: this.requiredInputs.includes(name),
			};

			return getInput(name, options);
		} else {
			throw new Error("Unknown environment.");
		}
	}

	/**
	 * Sets the value of the given output to the given value.
	 * @param name The name of the output.
	 * @param value The value of the output.
	 */
	public setOutput (name: string, value: string): void {
		if (this.environment.isDevelop()) {
			this.devEnvOutputs[name] = value;
		} else if (this.environment.isProd()) {
			setOutput(name, value);
		} else {
			throw new Error("Unknown environment.");
		}
	}

	/**
	 * Writes info to log with console.log. 
	 * @param message Info message.
	 */
	public info (message: string): void {
		if (this.environment.isDevelop()) {
			console.info(message);
		} else if (this.environment.isProd()) {
			info(message);
		} else {
			throw new Error("Unknown environment.");
		}
	}

	/**
	 * Adds a warning issue.
	 * @param message Warning issue message.  Errors will be converted to string via toString().
	 */
	public warning (message: string): void {
		if (this.environment.isDevelop()) {
			console.warn(message);
		} else if (this.environment.isProd()) {
			warning(message);
		} else {
			throw new Error("Unknown environment");
		}
	}

	/**
	 * Adds and error issue.
	 * @param message Error issue message.  Errors will be converted to string via toString().
	 */
	public setFailed (message: string | Error): void {
		if (this.environment.isDevelop()) {
			let errorMessage: string = "";
			const paramType: string = typeof message;

			if (paramType === "string") {
				errorMessage = <string>message;
			} else if (paramType === "Error") {
				errorMessage = (<Error>message).message;
			} else {
				errorMessage = "unknown error";
			}

			console.error(errorMessage);
		} else if (this.environment.isProd()) {
			setFailed(message);
		} else {
			throw new Error("Unknown environment.");
		}
	}
}