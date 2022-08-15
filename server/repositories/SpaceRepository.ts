import { Space } from "../models";
import { FindOptions } from "sequelize";

export default class SpaceRepository extends Space {
    public static async findAll(options?: FindOptions) {
        const data = await Space.findAll(options);
        return data.map((d) => ({
            ...d.toJSON()
        }));
    }

    public static async findOne(options?: FindOptions) {
        const data = await Space.findOne(options);

        if (!data) {
            throw Error("Not found");
        }


        return {
            ...data.toJSON()
        };
    }
}