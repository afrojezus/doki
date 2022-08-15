import SpaceRepository from "@server/repositories/SpaceRepository";
import { withSessionRoute } from "@src/lib/session";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const space = req.session.space;
    if (space === undefined) {
        res.status(500);
    }
    try {
        const serverSpace = await SpaceRepository.destroy({
            where: {
                Id: space.Id
            }
        });
        if (!serverSpace) throw Error("Space could not be destroyed");
        await req.session.destroy();
        res.status(200).json({ message: "The space is now gone!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default withSessionRoute(handler);