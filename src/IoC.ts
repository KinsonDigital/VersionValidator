import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";
import { NugetAPI } from "./NugetAPI";

export default class IoC {
    private static containerInitialized: boolean = false;

    public static get Container() : DependencyContainer {
        if (!this.containerInitialized) {
            this.SetupContainer();
        }

        return container;
    }

    private static SetupContainer(): void {
		container.register("INugetAPI", { useClass: NugetAPI });

		this.containerInitialized = true;
    }
}