export namespace SandpackRepository {
    export interface SandpackFileConfig {
        active?: boolean,
        hidden?: boolean,
        readOnly?: boolean,
    }

    export type StorableSandpackFileConfig = Omit<SandpackFileConfig, "active">;

    export interface SandpackFileConfigWithCode extends SandpackFileConfig {
        code: string,
    }

    export interface SandpackSetupData {
        template?: string;
        initialActiveFile?: string;
        environment?: string;
        files?: Record<string, SandpackFileConfig>;
        externalResources?: string[];
    }

    export interface SandpackPackageData {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        sandpack?: SandpackSetupData;
    }

    export interface SandpackRepositoryData {
        package: SandpackPackageData;
        files: Record<string, SandpackFileConfigWithCode>;
    }
}

