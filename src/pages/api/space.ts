import { withSessionRoute } from "@src/lib/session";

export default withSessionRoute(spaceRoute);

async function spaceRoute(req, res) {
    if (req.session.space) {
        res.json({
            space: req.session.space,
            isLoggedIn: true,
        });
    } else {
        res.json({
            isLoggedIn: false,
            space: null
        });
    }
}