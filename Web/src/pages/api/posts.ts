import FileRepository from "@server/repositories/FileRepository";
import {Author} from "@server/models";


export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const posts = await FileRepository.findAll({
                include: {
                    model: Author,
                    required: true
                }
            });
            console.info(`${posts.length} posts retrieved`);
            res.status(200).json(posts);
        } catch (e) {
            console.error(e);
            res.status(500)
        }

    } else {
        res.status(404)
    }
};