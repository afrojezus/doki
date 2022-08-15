import { Column, DataType, Table } from "sequelize-typescript";

import BaseModel from "./BaseModel";

@Table({
    timestamps: false,
    tableName: "Author"
})
export class Author extends BaseModel {
    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
    public AuthorId!: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    public Name!: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public CreationDate!: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public Space!: number;
}