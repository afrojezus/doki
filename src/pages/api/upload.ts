import {NextApiRequest, NextApiResponse} from "next";
import formidable from "formidable";
import ffmpeg from "fluent-ffmpeg";
import AuthorRepository from "@server/repositories/AuthorRepository";
import {fakeNames} from "../../../utils/name";
import FileRepository from "@server/repositories/FileRepository";
import path from "path";
import getConfig from "next/config";
import {getExt, videoFormats} from "../../../utils/file";

export const config = {
    api: {
        bodyParser: false
    }
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {serverRuntimeConfig} = getConfig();

    const dir = path.join(serverRuntimeConfig.PROJECT_ROOT, './public', 'files');

    function processThumbs(file) {
        return new Promise<void>((resolve, reject) => {
            ffmpeg(dir + "/" + file.newFilename)
                .on('error', (err) => reject(err))
                .on('filenames', (filenames) => console.log(`Generating ${filenames.join(", ")}`))
                .on('end', () => {
                    console.log(`Generated thumbnails`)
                    resolve();
                })
                .screenshot({
                    count: 1,
                    filename: `${file.newFilename}_thumbnail.png`,
                    folder: dir,
                    size: "1280x720"
                });
        })
    }

    const processForm = new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            multiples: true, maxFileSize: 5 * 1e3 * 1e3 * 1e3, uploadDir: dir,
            keepExtensions: true
        });

        form.on('progress', function (bytesReceived, bytesExpected) {
            let percent = (bytesReceived / bytesExpected * 100) | 0;
            process.stdout.write('Uploading: %' + percent + '\r');
        });

        form.parse(req, async (err, fields, files) => {
            if (err)
                reject(err);
            resolve({fields, files});
        });

    });

    return processForm.then(async ({fields, files}) => {
        // Is this stupid? Yes, yes it is.
        if (files.File.length > 0) {
            console.log("Multiple file mode");
            let author = await AuthorRepository.findOne({
                where: {AuthorId: fields.Id[0]}
            }, true);

            if (author === null) {
                author = await AuthorRepository.create({
                    AuthorId: fields.Id[0],
                    Name: fakeNames[~~(Math.random() * fakeNames.length)],
                    CreationDate: Date.now() / 1e3
                })
            }

            for (let i = 0; i < files.File.length; i++) {
                const {Title, Folder, NSFW, Tags, Description} = fields;

                const file = await FileRepository.create({
                    Size: files.File[i].size,
                    UnixTime: Date.now() / 1e3,
                    FileURL: `files/${files.File[i].newFilename}`,
                    Title: Title[i],
                    Description: Description[i].length > 0 ? Description[i] : null,
                    Thumbnail: `files/${files.File[i].newFilename}_thumbnail.png`,
                    Author: author,
                    AuthorId: author.AuthorId,
                    Views: 0,
                    Likes: 0,
                    Folder: Folder[i].length > 0 ? Folder[i] : null,
                    Tags: Tags[i],
                    FolderId: 0,
                    Report: null,
                    NSFW: NSFW[i]
                });

                console.log(`New file added:\n\tID: ${file.Id}, Filename: ${file.FileURL}, Author: ${author.AuthorId}, NSFW: ${file.NSFW}\n`)

                if (videoFormats.includes(getExt(files.File[i].newFilename)))
                    await processThumbs(files.File[i]);
            }
            res.status(200).json({...author});
        } else {
            console.log("Singular file mode");
            let author = await AuthorRepository.findOne({
                where: {AuthorId: fields.Id}
            }, true);

            if (author === null) {
                author = await AuthorRepository.create({
                    AuthorId: fields.Id,
                    Name: fakeNames[~~(Math.random() * fakeNames.length)],
                    CreationDate: Date.now() / 1e3
                })
            }

            const {Title, Folder, NSFW, Tags, Description} = fields;

            const file = await FileRepository.create({
                Size: files.File.size,
                UnixTime: Date.now() / 1e3,
                FileURL: `files/${files.File.newFilename}`,
                Title: Title,
                Description: Description.length > 0 ? Description : null,
                Thumbnail: `files/${files.File.newFilename}_thumbnail.png`,
                Author: author,
                AuthorId: author.AuthorId,
                Views: 0,
                Likes: 0,
                Folder: Folder.length > 0 ? Folder : null,
                Tags: Tags,
                FolderId: 0,
                Report: null,
                NSFW: NSFW
            });

            console.log(`New file added:\n\tID: ${file.Id}, Author: ${author.AuthorId}\n`)

            if (videoFormats.includes(getExt(files.File.newFilename)))
                await processThumbs(files.File);

            res.status(200).json({...author});
        }
    });


}