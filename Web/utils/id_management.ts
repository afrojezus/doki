import {Author} from "@server/models";
import AuthorRepository from "@server/repositories/AuthorRepository";
import {CookieValueTypes} from "cookies-next/lib/types";

// returns an author object if found, else null.
export async function SeekForAuthor(id: CookieValueTypes): Promise<Author | null> {
    let author: Author | null;
    try {
        author = await AuthorRepository.findOne({
            where: {
                AuthorId: id
            }
        });
    } catch {
        author = null;
    }
    return author;
}