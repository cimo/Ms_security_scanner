import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import * as modelService from "../model/Service.js";

export default class Service {
    // Variable
    private app: Express.Express;
    private limiter: RateLimitRequestHandler;

    // Method
    constructor(app: Express.Express, limiter: RateLimitRequestHandler) {
        this.app = app;
        this.limiter = limiter;
    }

    api = (): void => {
        this.app.post("/api/check", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            const body = request.body as modelService.IapiCheckBody;

            const mode = body.mode;
            const target = body.target;

            const uniqueId = helperSrc.generateUniqueId();

            const pathExecutionCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const executionArgumentList = [pathExecutionCommand, mode, target, uniqueId];

            helperSrc.executionFile(executionArgumentList).then(async (result) => {
                if (result.error) {
                    helperSrc.writeLog(`Service.ts - api() - post(/api/check) - executionFile() - error`, result.error.message);

                    helperSrc.responseBody({ state: "ko", message: result.error.message }, response, 500);
                } else {
                    const fileReadStream = await helperSrc.fileReadStream(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`);

                    if (!Buffer.isBuffer(fileReadStream)) {
                        helperSrc.writeLog(`Service.ts - api() - post(/api/check) - executionFile() - fileReadStream()`, fileReadStream.toString());

                        helperSrc.responseBody({ state: "ko", message: fileReadStream.toString() }, response, 500);
                    } else {
                        helperSrc.responseBody({ state: "ok", message: "", data: fileReadStream.toString("base64") }, response, 200);
                    }
                }

                const fileOrFolderDelete = await helperSrc.fileOrFolderDelete(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`);

                if (typeof fileOrFolderDelete !== "boolean") {
                    helperSrc.writeLog(
                        `Service.ts - api() - post(/api/check) - executionFile() - fileOrFolderDelete()`,
                        fileOrFolderDelete.toString()
                    );
                }
            });
        });
    };
}
