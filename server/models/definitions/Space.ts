import { Column, DataType, Table } from "sequelize-typescript";
import BaseModel from "./BaseModel";

@Table({
    timestamps: false,
    tableName: "Space"
})
export class Space extends BaseModel {
    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    public Id!: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    public Name!: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    public Description!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public Icon?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public Bg?: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public CreationDate!: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    public Private!: boolean;

    @Column({ type: DataType.TEXT, allowNull: true })
    public Token?: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    public Owner?: number;
}