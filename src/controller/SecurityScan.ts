import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { execFile } from "child_process";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";

export default class SecurityScan {
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
            const requestBody = request.body;

            const mode = requestBody.mode;
            const target = requestBody.target;

            const uniqueId = helperSrc.generateUniqueId();

            const execCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const execArgumentList = [execCommand, mode, target, uniqueId];

            execFile("/bin/bash", execArgumentList, { encoding: "utf8" }, () => {
                helperSrc.fileReadStream(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`, (resultFileReadStream) => {
                    if (Buffer.isBuffer(resultFileReadStream)) {
                        helperSrc.responseBody(resultFileReadStream.toString("base64"), "", response, 200);
                    } else {
                        helperSrc.writeLog(
                            `SecurityScan.ts - api() - post(/api/check) - execFile() - fileReadStream()`,
                            resultFileReadStream.toString()
                        );

                        helperSrc.responseBody("", resultFileReadStream.toString(), response, 500);
                    }
                });

                helperSrc.fileOrFolderDelete(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`, (resultFileDelete) => {
                    if (typeof resultFileDelete !== "boolean") {
                        helperSrc.writeLog(
                            `SecurityScan.ts - api() - post(/api/check) - execFile() - fileOrFolderDelete()`,
                            resultFileDelete.toString()
                        );
                    }
                });
            });
        });
    };
}
