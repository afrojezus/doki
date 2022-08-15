import SpaceRepository from "@server/repositories/SpaceRepository";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";

async function makeSpaceRoute(req: NextApiRequest, res: NextApiResponse) {
    const { space } = await req.body;
    try {
        const serverSpace = await SpaceRepository.create({
            Name: space.Name,
            Description: space.Description,
            Icon: space.Icon.length > 0 ? space.Icon : null,
            Bg: space.Bg.length > 0 ? space.Bg : null,
            CreationDate: Date.now() / 1e3,
            Private: space.Private,
            Token: space.password.length > 0 ? Buffer.from(space.password).toString('base64') : null
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