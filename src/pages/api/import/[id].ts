import {NextApiRequest, NextApiResponse} from "next";
import AuthorRepository from "@server/repositories/AuthorRepository";
import {fakeNames} from "../../../../utils/name";
import FileRepository from "@server/repositories/FileRepository";
import path from "path";
import getConfig from "next/config";

import ytdl from "ytdl-core";
import * as fs from "fs";
import * as client from "https";

interface ImportForm {
    Id: number;
    Title: string;
    Folder: string;
    NSFW: boolean;
    Tags: string[];
    Description: string;
    Size: number;
    File: string;
    Thumbnail: string;
}


export default async ({query: {id}, body}: NextApiRequest, res: NextApiResponse) => {
    const {serverRuntimeConfig} = getConfig();

    const dir = path.join(serverRuntimeConfig.PROJECT_ROOT, './public', 'files');

    function fetchThumbnail(info: ytdl.videoInfo) {
        return new Promise<string>((resolve, reject) => {
            client.get(`https://img.youtube.com/vi/${info.videoDetails.videoId}/hqdefault.jpg`, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fs.createWriteStream(`${dir}/${id}.mp4_thumbnail.png`));
                    res.on('error', reject)
                    res.once('close', () => resolve(`${id}.mp4_thumbnail.png`))
                } else {
                    res.resume();
                    reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
                }
            })
        })
    }

    function processYT(info: ytdl.videoInfo) {
        return new Promise<string>(async (resolve, reject) => {
            const stream = ytdl.downloadFromInfo(info).pipe(fs.createWriteStream(`${dir}/${id}.mp4`));
            stream.on('finish', () => resolve(`${id}.mp4`))
            stream.on('error', reject);
        })
    }

    const processURL = new Promise<ImportForm>(async (resolve, reject) => {
        try {
            const info = await ytdl.getInfo(id as string);
            console.log("Obtained Youtube details");
            const File = await processYT(info);

            const Thumbnail = await fetchThumbnail(info);

            console.log("File downloaded");

            const Size = (await fs.promises.stat(`${dir}/${id}.mp4`)).size;

            console.log("Size obtained");

            resolve({
                Id: parseInt(body as string),
                Title: info.videoDetails.title,
                Description: info.videoDetails.description,
                Folder: null,
                NSFW: false,
                Tags: [],
                Size,
                File,
                Thumbnail
            });
        } catch (error) {
            reject(error);
        }
    });

    return processURL.then(async (form: ImportForm) => {
        console.log("Import mode");
        try {
            let author = await AuthorRepository.findOne({
                where: {AuthorId: form.Id}
            }, true);

            if (author === null) {
                author = await AuthorRepository.create({
                    AuthorId: form.Id,
                    Name: fakeNames[~~(Math.random() * fakeNames.length)],
                    CreationDate: Date.now() / 1e3
                })
            }

            const {Title, Folder, NSFW, Tags, Description, Size, File, Thumbnail} = form;

            await FileRepository.create({
                Size: Size,
                UnixTime: Date.now() / 1e3,
                FileURL: `files/${File}`,
                Title: Title,
                Description: Description && Description.length > 0 ? Description : null,
                Thumbnail: `files/${Thumbnail}`,
                Author: author,
                AuthorId: author.AuthorId,
                Views: 0,
                Likes: 0,
                Folder,
                Tags: Tags.join(","),
                FolderId: 0,
                Report: null,
                NSFW: NSFW
            });

            console.log(`New file added:\n\tID: ${form.Id}, Author: ${author.AuthorId}\n`)

            res.status(200).json({...author});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Could not import file"});
        }
    });
}