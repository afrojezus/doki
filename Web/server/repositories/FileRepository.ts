import {FindOptions} from "sequelize";
import {File} from "@server/models";

export default class FileRepository extends File {
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