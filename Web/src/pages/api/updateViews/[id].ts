import FileRepository from "@server/repositories/FileRepository";
import {NextApiRequest, NextApiResponse} from "next";

export default async ({query: {id}, method}: NextApiRequest, res: NextApiResponse) => {
    if (method === 'POST') {
        try {
            await FileRepository.increment('Views', {by: 1, where: {Id: id}});
            console.log(`One new view for file ${id}`);
            return res.status(200).json({message: `One new view for file ${id}`});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: "Could not update view count"});
        }
    }
}