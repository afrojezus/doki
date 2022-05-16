import {AllowNull, BelongsTo, Column, DataType, ForeignKey, Table} from "sequelize-typescript";
import {Author} from "./Author";

import BaseModel from "./BaseModel";

@Table({
    timestamps: false,
    tableName: "Files"
})
export class File extends BaseModel {
    @Column({type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true})
    public Id!: number;

    @Column({type: DataType.INTEGER, allowNull: false})
    public Size!: number;

    @Column({type: DataType.INTEGER, allowNull: false})
    public UnixTime!: number;

    @Column({type: DataType.STRING, allowNull: false})
    public FileURL!: string;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Title?: string;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Description?: string;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Thumbnail?: string;

    @BelongsTo(() => Author)
    public Author!: Author;

    @ForeignKey(() => Author)
    @Column({type: DataType.INTEGER, allowNull: false})
    public AuthorId!: number;

    @Column({type: DataType.INTEGER, allowNull: false})
    public Views!: number;

    @Column({type: DataType.INTEGER, allowNull: false})
    public Likes!: number;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Folder?: string;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Tags?: string;

    @AllowNull
    @Column({type: DataType.INTEGER})
    public FolderId?: number;

    @AllowNull
    @Column({type: DataType.TEXT})
    public Report: string;

    @Column({type: DataType.TINYINT, allowNull: false})
    public NSFW!: boolean;
}