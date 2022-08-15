import SpaceRepository from "@server/repositories/SpaceRepository";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";

async function setSpaceRoute(req: NextApiRequest, res: NextApiResponse) {
    const { space, password } = await req.body;
    try {
        const serverSpace = await SpaceRepository.findOne({
            where: {
                Id: space.Id,
                // todo: this should really be taken care of before production
                Token: space.Private && password.length > 0 ? Buffer.from(password).toString('base64') : null
            }
        });
        if (!serverSpace) throw Error("Space not found");
        req.session.space = serverSpace;
        await req.session.save();
        res.json(serverSpace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default withSessionRoute(setSpaceRoute);