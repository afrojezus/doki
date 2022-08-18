import { FindOptions } from "sequelize/types";
import { Comment } from "../models";

export default class CommentRepository extends Comment {
    public static async findAll(options?: FindOptions) {
        const data = await Comment.findAll(options);
        return data.map((d) => ({
            ...d.toJSON()
        }));
    }

    public static async findOne(options?: FindOptions) {
        const data = await Comment.findOne(options);

        if (!data) {
            throw Error("Not found");
        }


        return {
            ...data.toJSON()
        };
    }
}