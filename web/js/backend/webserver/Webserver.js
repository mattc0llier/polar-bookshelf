"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../../logger/Logger");
const Preconditions_1 = require("../../Preconditions");
const Paths_1 = require("../../util/Paths");
const express = require("express");
const serveStatic = require("serve-static");
const log = Logger_1.Logger.create();
class Webserver {
    constructor(webserverConfig, fileRegistry) {
        this.webserverConfig = Preconditions_1.Preconditions.assertNotNull(webserverConfig, "webserverConfig");
        this.fileRegistry = Preconditions_1.Preconditions.assertNotNull(fileRegistry, "fileRegistry");
        ;
    }
    start() {
        express.static.mime.define({ 'text/html': ['chtml'] });
        this.app = express();
        this.app.use(serveStatic(this.webserverConfig.dir));
        this.server = this.app.listen(this.webserverConfig.port, "127.0.0.1");
        this.app.get(/files\/.*/, (req, res) => {
            try {
                log.info("Handling data at path: " + req.path);
                let hashcode = Paths_1.Paths.basename(req.path);
                if (!hashcode) {
                    let msg = "No key given for /file";
                    console.error(msg);
                    res.status(404).send(msg);
                }
                else if (!this.fileRegistry.hasKey(hashcode)) {
                    let msg = "File not found with hashcode: " + hashcode;
                    console.error(msg);
                    res.status(404).send(msg);
                }
                else {
                    let keyMeta = this.fileRegistry.get(hashcode);
                    let filename = keyMeta.filename;
                    log.info(`Serving file at ${req.path} from ${filename}`);
                    return res.sendFile(filename);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
        log.info(`Webserver up and running on port ${this.webserverConfig.port}`);
    }
    stop() {
        this.server.close();
    }
}
exports.Webserver = Webserver;
//# sourceMappingURL=Webserver.js.map