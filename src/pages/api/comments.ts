import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import CommentRepository from "@server/repositories/CommentRepository";
import { Comment } from "@server/models";
export default withSessionRoute(handler);
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const space = req.session.space;
    if (space === undefined) {
        return res.status(500);
    }
    if (req.method === 'GET') {
        const { id }: { id: string; } = req.query as any;
        try {
            const comments: Comment[] = await CommentRepository.findAll({
                where: {
                    Space: space.Id,
                    FileId: id
                }
            });
            return res.status(200).json(comments);
        } catch (e) {
            console.error(e);
            return res.status(500);
        }

    } else if (req.method === "POST") {
        console.info(req.query);
        const { id, authorName, fileId }: { id: string; fileId: string; authorName: string; } = req.query as any;
        try {
            const comment = await CommentRepository.create({
                FileId: fileId,
                AuthorId: id.length > 0 ? id : null,
                AuthorName: id.length > 0 ? authorName : "Anon",
                Content: req.body as string,
                Date: Date.now() / 1e3,
                Space: space.Id
            });
            console.info(`New comment from user ${id}:${authorName} from space ${space.Id}:${space.Name} for file ${fileId}`);
            return res.status(200).json(comment);
        } catch (e) {
            console.error(e);
            return res.status(500);
        }
    } else {
        return res.status(404);
    }
};