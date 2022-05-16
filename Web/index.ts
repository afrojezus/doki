import "dotenv/config";
import {createServer} from "http";
import {parse} from "url";
import next from "next";

import {initDB} from "./server/models";

const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

async function startup() {
    console.log("DOKI M2");

    try {
        await initDB();
        console.log("Connected to database");
    } catch (e) {
        console.error("Failed at connecting to database!", e);
        return -1;
    }

    const app = next({dev, hostname, port});
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer((req, res) => {
            const parsedURL = parse(req.url!, true);
            handle(req, res, parsedURL);
        }).listen(port);

        console.log(`Now listening at http://localhost:${port} in ${dev ? "development" : process.env.NODE_ENV} mode.`);
    });
}

startup();