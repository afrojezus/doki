import FileRepository from "@server/repositories/FileRepository";
import { Author } from "@server/models";
import { retrieveAllFileTypes, retrieveAllFolders, retrieveAllTags } from "utils/file";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
const { Op } = require("sequelize");
export default withSessionRoute(handler);
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const space = req.session.space;
    if (space === undefined) {
        res.status(500);
    }
    if (req.method === 'GET') {
        console.info(req.query);
        const { page, tag, category, type, author, order, nsfw }: { page: number, tag: string, category: string, type: string, author: string, order: string; nsfw: string; } = req.query as any;
        try {
            const posts =
                tag ?
                    await FileRepository.findAll({
                        where: {
                            Tags: { [Op.like]: `%${tag}%` },
                            Space: space.Id,
                            ...(nsfw === 'true' ? undefined : {
                                NSFW: 0
                            })
                        },
                        include: {
                            model: Author,
                            required: true
                        },
                        limit: 25,
                        offset: (page > 1) ? (25 * (page - 1)) : 0
                    })
                    : category ? await FileRepository.findAll({
                        where: {
                            Folder: category,
                            Space: space.Id,
                            ...(nsfw === 'true' ? undefined : {
                                NSFW: 0
                            })
                        },
                        include: {
                            model: Author,
                            required: true
                        },
                        limit: 25,
                        offset: (page > 1) ? (25 * (page - 1)) : 0
                    }) : type ? await FileRepository.findAll({
                        where: {
                            FileURL: { [Op.like]: '%.' + type.toLowerCase() },
                            Space: space.Id,
                            ...(nsfw === 'true' ? undefined : {
                                NSFW: 0
                            })
                        },
                        include: {
                            model: Author,
                            required: true
                        },
                        limit: 25,
                        offset: (page > 1) ? (25 * (page - 1)) : 0
                    }) : await FileRepository.findAll({
                        where: {
                            Space: space.Id,
                            ...(nsfw === 'true' ? undefined : {
                                NSFW: 0
                            })
                        },
                        include: {
                            model: Author,
                            required: true
                        },
                        order: [
                            order === 'Time' ? ['UnixTime', 'DESC'] :
                                order === 'Views' ? ['Views', 'DESC'] :
                                    order === 'Size' ? ['Size', 'DESC'] :
                                        ['Id', 'DESC']
                        ],
                        limit: 25,
                        offset: (page > 1) ? (25 * (page - 1)) : 0
                    });
            const total = await FileRepository.findAll({
                where: {
                    Space: space.Id,
                    ...(nsfw === 'true' ? undefined : {
                        NSFW: 0
                    })
                },
                attributes: ['Id', 'Tags', 'Folder', 'FileURL', 'AuthorId']
            });
            console.info(`${posts.length} posts retrieved`);
            res.status(200).json({
                posts: posts.filter(f => author ? f.AuthorId === parseInt(author) : f),
                all: total,
                allTags: retrieveAllTags(total.filter(f => author ? f.AuthorId === parseInt(author) : f)),
                allCategories: retrieveAllFolders(total.filter(f => author ? f.AuthorId === parseInt(author) : f)),
                allTypes: retrieveAllFileTypes(total.filter(f => author ? f.AuthorId === parseInt(author) : f))
            });
        } catch (e) {
            console.error(e);
            res.status(500);
        }

    } else {
        res.status(404);
    }
};