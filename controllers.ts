import {cache} from "./utils";
import * as fs from "fs";
import * as path from "path";
import type {SandpackRepository} from "./types";
import typeIs from 'type-is';
import mimeTypes from 'mime-types';

const CONTENT_ROOT = "./repositories";
const ACCEPTED_TYPES = ["image/svg+xml", "text/*", "application/html", "application/json", "application/javascript"]

async function _loadRepository(repoName: string) {
    const promises: Promise<void>[] = [];
    const virtualPaths = await getRecursiveFiles(repoName);
    const fileMapping: Record<string, string> = {};

    async function processFile(virtualPath: string) {
        try {
            fileMapping[virtualPath] = await readFile(repoName, virtualPath);
        } catch (e) {
        }
    }

    for (let virtualPath of virtualPaths) {
        promises.push(processFile(virtualPath));
    }

    await Promise.allSettled(promises);
    const json = JSON.parse(fileMapping["/package.json"]);

    let initialActiveFile: string|undefined;
    if (json.sandpack?.initialActiveFile) {
        initialActiveFile = path.join("/", json.sandpack?.initialActiveFile).replaceAll("\\", "/");
    }

    const fileMappingWithConfig: Record<string, SandpackRepository.SandpackFileConfigWithCode> = {};
    for (let file in fileMapping) {
        const sandpackFileConfig = json.sandpack?.files?.[file] as SandpackRepository.StorableSandpackFileConfig | undefined;
        fileMappingWithConfig[file] = {
            code: fileMapping[file],
            active: initialActiveFile === file,
            hidden: sandpackFileConfig?.hidden ?? false,
            readOnly: sandpackFileConfig?.readOnly ?? false,
        }
    }

    return {
        files: fileMappingWithConfig,
        package: json,
    } as SandpackRepository.SandpackRepositoryData;
}

async function readFile(repoName: string, virtualPath: string) {
    const realPath = path.join(CONTENT_ROOT, repoName, virtualPath);
    const extension = path.parse(realPath).ext;
    const mimeType = mimeTypes.lookup(extension);
    const typing = typeIs.is(mimeType || '', ACCEPTED_TYPES);
    if (!typing) {
        throw new Error("This type is not supported.");
    }
    return (await fs.promises.readFile(realPath)).toString();
}

async function getRecursiveFiles(repoName: string) {
    let files: string[] = [];

    function getRealPath(dir: string) {
        return path.join(CONTENT_ROOT, repoName, dir).replaceAll("\\", "/");
    }

    async function _getRecursiveFileInFolder(dir = "/") {
        // Do not scan the node_modules path LOL.
        if (dir === "/node_modules") return;

        let promises = [];
        async function processEntry(entry: string) {
            const virtualEntryPath = path.join(dir, entry).replaceAll("\\", "/");
            const realEntryPath = getRealPath(virtualEntryPath);
            const stats = await fs.promises.stat(realEntryPath);
            if (stats.isFile()) {
                files.push(virtualEntryPath);
            } else {
                await _getRecursiveFileInFolder(virtualEntryPath);
            }
        }

        for (let entry of await fs.promises.readdir(getRealPath(dir))) {
            promises.push(processEntry(entry));
        }

        await Promise.all(promises);
    }

    await _getRecursiveFileInFolder();
    return files;
}

export const loadRepository = cache(_loadRepository, {
    revalidate: 0,
});
