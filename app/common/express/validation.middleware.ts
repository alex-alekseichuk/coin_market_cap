import {NextFunction, Request, Response} from "express";
import {HttpApiError} from "#app/common/errors.js";
import {ZodType} from "zod";
import {readdir} from "node:fs/promises";
import {join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

export type ValidationSchemas = {
    body?: ZodType<any, any>;
    params?: ZodType<any, any>;
    query?: ZodType<any, any>;
};

const SCHEMA_FILE_EXT = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/i;

const validationRootPath = fileURLToPath(new URL("../../validation", import.meta.url));

let schemaFilesPromise: Promise<string[]> | undefined;

async function listSchemaFiles(dir: string, base: string): Promise<string[]> {
    let entries;
    try {
        entries = await readdir(dir, {withFileTypes: true});
    } catch {
        return []; // the validation/ sub-tree is missing -> nothing to validate against
    }

    const out: string[] = [];
    for (const entry of entries) {
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            out.push(...await listSchemaFiles(join(dir, entry.name), rel));
        } else if (entry.isFile()) {
            out.push(rel);
        }
    }
    return out;
}

function getSchemaFiles(): Promise<string[]> {
    schemaFilesPromise ??= listSchemaFiles(validationRootPath, "");
    return schemaFilesPromise;
}

function findSchemaFile(files: string[], segments: string[], method: string): string | undefined {
    const m = method.toLowerCase();

    return files.find((rel) => {
        const parts = rel.split("/");
        const fileName = parts[parts.length - 1].replace(SCHEMA_FILE_EXT, "");
        if (fileName !== m) return false;

        const dirs = parts.slice(0, -1);
        if (dirs.length !== segments.length) return false;

        return dirs.every((dir, i) =>
            dir === segments[i] || (dir.startsWith(":") && segments[i].length > 0));
    });
}

function extractParams(dirs: string[], segments: string[]): Record<string, string> {
    const params: Record<string, string> = {};
    dirs.forEach((dir, i) => {
        if (dir.startsWith(":")) {
            params[dir.slice(1)] = segments[i];
        }
    });
    return params;
}

const schemaModules = new Map<string, Promise<ValidationSchemas>>();

function loadSchemaFile(rel: string): Promise<ValidationSchemas> {
    let loaded = schemaModules.get(rel);
    if (!loaded) {
        const url = pathToFileURL(join(validationRootPath, rel)).href;
        loaded = import(url)
            .then((mod) => mod.default as ValidationSchemas)
            .catch((err) => {
                throw new HttpApiError(500, 5000, `Failed to load validation schema ${rel}`, err);
            });
        schemaModules.set(rel, loaded);
    }
    return loaded;
}

type IssueBag = Record<string, string[]>;

function collectIssues(source: unknown, schema: ZodType<any, any>, label: string, issues: IssueBag) {
    const result = schema.safeParse(source);
    if (result.success) return;

    for (const issue of result.error.issues) {
        const key = issue.path.length > 0 ? `${label}.${issue.path.join(".")}` : label;
        (issues[key] ??= []).push(issue.message);
    }
}

export function schemaValidationMiddleware() {
    return async function _schemaValidationMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const files = await getSchemaFiles();

            const pathname = req.originalUrl.split("?")[0];
            const segments = pathname
                .split("/")
                .filter((s) => s.length > 0)
                .map((s) => decodeURI(s));

            const schemaFile = findSchemaFile(files, segments, req.method);
            if (!schemaFile) {
                next();
                return;
            }

            const schemas = await loadSchemaFile(schemaFile);
            const dirs = schemaFile.split("/").slice(0, -1);
            const params = extractParams(dirs, segments);

            const issues: IssueBag = {};

            if (schemas.params) collectIssues(params, schemas.params, "params", issues);
            if (schemas.query) collectIssues(req.query, schemas.query, "query", issues);
            if (schemas.body) collectIssues(req.body, schemas.body, "body", issues);

            if (Object.keys(issues).length > 0) {
                throw new HttpApiError(400, 4000, "Validation failed", issues);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
