import { Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { Author } from "./Author";

import BaseModel from "./BaseModel";
import { File } from "./File";
import { Space } from "./Space";

@Table({
    timestamps: false,
    tableName: "Comments"
})
export class Comment extends BaseModel {
    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    public Id!: number;

    @ForeignKey(() => File)
    @Column({ type: DataType.INTEGER, allowNull: false })
    public FileId!: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    public Content!: string;

    @ForeignKey(() => Author)
    @Column({ type: DataType.INTEGER, allowNull: true })
    public AuthorId?: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    public AuthorName!: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public Date!: number;

    @ForeignKey(() => Space)
    @Column({ type: DataType.INTEGER, allowNull: false })
    public Space!: number;
}