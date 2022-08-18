import SpaceRepository from "@server/repositories/SpaceRepository";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import * as bcrypt from "bcrypt";
import { Space } from "@server/models";


async function setSpaceRoute(req: NextApiRequest, res: NextApiResponse) {
    const { space, password } = await req.body;
    try {
        const serverSpace: Space = await SpaceRepository.findOne({
            where: {
                Id: space.Id
            },
        });
        if (!serverSpace) throw Error("Space not found");
        // space is found, if private, check the token
        if (serverSpace.Private) {
            const valid = await bcrypt.compare(password, serverSpace.Token);
            if (!valid) {
                throw Error("Incorrect password, access denied");
            }
        }
        req.session.space = serverSpace;
        await req.session.save();
        res.json(serverSpace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default withSessionRoute(setSpaceRoute);