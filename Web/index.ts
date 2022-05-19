import "dotenv/config";
import next from "next";
import express from "express";
import * as QueryString from "querystring";
import figlet from "figlet";

import {initDB} from "./server/models";
import path from "path";

const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

async function startup() {
    figlet("doki", {
      font: "Slant Relief"
    }, (err, data) => {
        if (err) {
            console.dir(err);
            return;
        }
        console.log(data);
        console.log("Milestone 2 :: Version 1");
        console.log("Maintainer: th.eq.th@pm.me\n\n");
    })

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
        const server = express();

        server.get("/files/*", (req, res) => {
            const target = QueryString.unescape(req.originalUrl);
            if (process.env.NODE_ENV === "production") {
                return res.sendFile(path.resolve('./') + "/public" + target);
            }
            return res.sendFile(__dirname + "/public" + target);
        });

        server.all("*", (req, res) =>
            handle(req, res));

        server.listen(port, () => {
            console.log(`Now listening at http://localhost:${port} in ${dev ? "development" : process.env.NODE_ENV} mode.`);
        });
    });
}

startup();