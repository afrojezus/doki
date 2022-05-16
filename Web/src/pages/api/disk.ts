import disk from 'diskusage';
import os from 'os';

let path = os.platform() === 'win32' ? 'c:' : '/';

export default async function handler(req, res) {
    if (req.method === 'GET') {

        try {
            const {available, total} = await disk.check(path);
            res.status(200).json({
                freeSpace: available, totalSpace: total
            });
        } catch (e) {
            console.error(e);
            res.status(500)
        }


    } else {
        res.status(404)
    }
};