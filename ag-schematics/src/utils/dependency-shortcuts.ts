import { addDependency, DependencyType, ExistingBehavior, InstallBehavior } from "./dependency";

export function installDevDependency(
    name: string,
    version: string
) {
    return addDependency(name, version, {
        install: InstallBehavior.Auto,
        type: DependencyType.Dev,
        existing: ExistingBehavior.Skip
    });
}
export function installRegularDependency(
    name: string,
    version: string
) {
    return addDependency(name, version, {
        install: InstallBehavior.Auto,
        type: DependencyType.Default,
        existing: ExistingBehavior.Skip
    });
}