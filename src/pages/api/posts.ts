import FileRepository from "@server/repositories/FileRepository";
import {Author} from "@server/models";


export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { page } = req.query;
        try {
            const posts = await FileRepository.findAll({
                include: {
                    model: Author,
                    required: true
                },
                limit: 25,
                offset: (page > 1) ? (25 * (page - 1)) : 0
            });
            const amount = await FileRepository.findAll({
                attributes: ['Id']
            });
            console.info(`${posts.length} posts retrieved`);
            res.status(200).json({posts, amount: amount.length});
        } catch (e) {
            console.error(e);
            res.status(500)
        }

    } else {
        res.status(404)
    }
};