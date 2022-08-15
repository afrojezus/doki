﻿import { Sequelize } from "sequelize-typescript";
import { File } from "./definitions/File";
import { Author } from "./definitions/Author";
import { Space } from "./definitions/Space";

const sequelize =
    new Sequelize({
        host: process.env.DB_HOST,
        dialect: "mysql",
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        logging: false
    });

sequelize.addModels([File, Author, Space]);


export { File, Author, Space };

export const initDB = async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

};