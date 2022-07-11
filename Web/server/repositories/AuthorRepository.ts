import {FindOptions} from "sequelize";
import {Author} from "../models";

export default class AuthorRepository extends Author {
    public static async findAll(options?: FindOptions) {
        const data = await Author.findAll(options);
        return data.map((d) => ({
            ...d.toJSON()
        }));
    }

    public static async findOne(options?: FindOptions, ignoreError?: boolean) {
        const data = await Author.findOne(options);

        if (!data) {
            if (ignoreError) return null;
            throw Error("Not found");
        }


        return {
            ...data.toJSON()
        };
    }
}