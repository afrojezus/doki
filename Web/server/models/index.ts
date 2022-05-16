import {Sequelize} from "sequelize-typescript";
import {File} from "./definitions/File";
import {Author} from "./definitions/Author";

const sequelize =
    new Sequelize({
        host: process.env.DB_HOST,
        dialect: "mysql",
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS
    });

sequelize.addModels([File, Author]);

export {File, Author};

export const initDB = async () => {
    await sequelize.authenticate();
    await sequelize.sync({alter: true});

}