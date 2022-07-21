import {Author} from "@server/models";
import AuthorRepository from "@server/repositories/AuthorRepository";
import FileRepository from "@server/repositories/FileRepository";
import {NextApiRequest, NextApiResponse} from "next";

const verifyAuthor = async (author?: Author) => {
    try {
        if (!author) return;
        return await AuthorRepository.findOne({
            where: {AuthorId: author.AuthorId}
        }, false);
    } catch (err) {
        console.error(err);
        return new Error("could not verify author");
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            const {author, files} = await JSON.parse(req.body);
            await verifyAuthor(author);
            const num = await FileRepository.deleteAll(files);
            console.log(`${num} files deleted`);
            return res.status(200).json({message: `${num} files deleted.`});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: "Could not delete, missing author."});
        }
    }
}