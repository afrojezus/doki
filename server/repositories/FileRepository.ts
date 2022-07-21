import {FindOptions} from "sequelize";
import {File} from "../models";

export default class FileRepository extends File {
    public static async deleteAll(files: File[]) {
        try {
            return await File.destroy({
                where: {
                    Id: files.map(x => x.Id)
                }
            });
        } catch (error) {
            console.error(error);
            throw new Error("could not delete all files specified");
        }
    }

    public static async findAll(options?: FindOptions) {
        const data = await File.findAll(options);
        return data.map((d) => ({
            ...d.toJSON()
        }));
    }

    public static async findOne(options?: FindOptions) {
        const data = await File.findOne(options);

        if (!data) {
            throw Error("Not found");
        }

        return {
            ...data.toJSON()
        };
    }
}