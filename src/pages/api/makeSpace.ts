import SpaceRepository from "@server/repositories/SpaceRepository";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import * as bcrypt from 'bcrypt';

async function makeSpaceRoute(req: NextApiRequest, res: NextApiResponse) {
    const { space } = await req.body;
    try {
        const hashed = space.password.length > 0 ? await bcrypt.hash(space.password, 10) : null;
        const serverSpace = await SpaceRepository.create({
            Name: space.Name,
            Description: space.Description,
            Icon: space.Icon.length > 0 ? space.Icon : null,
            Bg: space.Bg.length > 0 ? space.Bg : null,
            CreationDate: Date.now() / 1e3,
            Private: space.Private,
            Token: hashed
        });
        if (!serverSpace) throw Error("Space could not be created");
        req.session.space = serverSpace;
        await req.session.save();
        res.json(serverSpace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default withSessionRoute(makeSpaceRoute);