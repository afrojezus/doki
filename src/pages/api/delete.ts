import { Author, File } from "@server/models";
import AuthorRepository from "@server/repositories/AuthorRepository";
import FileRepository from "@server/repositories/FileRepository";
import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import getConfig from "next/config";
import * as path from "path";
import { withSessionRoute } from "@src/lib/session";

const verifyAuthor = async (author?: Author) => {
    try {
        if (!author) return;
        return await AuthorRepository.findOne({
            where: { AuthorId: author.AuthorId }
        }, false);
    } catch (err) {
        console.error(err);
        return new Error("could not verify author");
    }
};

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.session.space === undefined) {
        return res.status(500);
    }

    const { serverRuntimeConfig } = getConfig();

    const dir = path.join(serverRuntimeConfig.PROJECT_ROOT, './public/');
    if (req.method === 'POST') {
        try {
            const { author, files } = await JSON.parse(req.body);
            await verifyAuthor(author);
            const num = await FileRepository.deleteAll(files);
            for (let i = 0; i < files.length; i++) {
                const file: File = files[i];
                // delete the file on disk
                if (fs.existsSync(dir + file.FileURL)) {
                    fs.unlink(dir + file.FileURL, (err) => err && console.error(err));
                }
                // if video, delete the thumbnail on disk
                if (file.Thumbnail && file.Thumbnail.length > 0 && fs.existsSync(dir + file.Thumbnail)) {
                    fs.unlink(dir + file.Thumbnail, (err) => err && console.error(err));
                }
            }
            console.log(`${num} files deleted`);
            return res.status(200).json({ message: `${num} files deleted.` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Could not delete, missing author." });
        }
    }
};

export default withSessionRoute(handler);