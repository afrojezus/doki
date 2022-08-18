import { Column, DataType, Table, ForeignKey } from "sequelize-typescript";

import BaseModel from "./BaseModel";
import { Space } from "./Space";

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

    @ForeignKey(() => Space)
    @Column({ type: DataType.INTEGER, allowNull: false })
    public Space!: number;
}