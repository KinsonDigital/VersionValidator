import "reflect-metadata";
import { container } from "tsyringe";
import { Application } from "./Application";
import { Action } from "./helpers/Action";

const app: Application = new Application();
const action: Action = container.resolve(Action);

app.run().then(() => {
	action.info("Action Success!!");
}, (error: Error) => {
	// Takes any incoming errors and fails the action with a message
	action.setFailed(error.message);
});
