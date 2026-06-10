import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import * as modelSecurityScan from "../model/SecurityScan.js";

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
            const body = request.body as modelSecurityScan.IapiCheckBody;

            const mode = body.mode;
            const target = body.target;

            const uniqueId = helperSrc.generateUniqueId();

            const execCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const execArgumentList = [execCommand, mode, target, uniqueId];

            helperSrc.executionFile(execArgumentList).then(async (result) => {
                if (result.error) {
                    helperSrc.writeLog(`SecurityScan.ts - api() - post(/api/check) - executionFile() - error`, result.error.message);

                    helperSrc.responseBody("", "ko", response, 500);
                } else {
                    const fileReadStream = await helperSrc.fileReadStream(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`);

                    if (Buffer.isBuffer(fileReadStream)) {
                        helperSrc.responseBody(fileReadStream.toString("base64"), "", response, 200);
                    } else {
                        helperSrc.writeLog(
                            `SecurityScan.ts - api() - post(/api/check) - executionFile() - fileReadStream()`,
                            fileReadStream.toString()
                        );

                        helperSrc.responseBody("", "ko", response, 500);
                    }
                }

                const fileOrFolderDelete = await helperSrc.fileOrFolderDelete(`${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}.log`);

                if (typeof fileOrFolderDelete !== "boolean") {
                    helperSrc.writeLog(
                        `SecurityScan.ts - api() - post(/api/check) - executionFile() - fileOrFolderDelete()`,
                        fileOrFolderDelete.toString()
                    );
                }
            });
        });
    };
}
