# doki

This is the official repository for the doki project.

### Changes from the original branch

The new M2 branch has a rewritten foundation in TypeScript for the project going further. This allows us to integrate backend and frontend much easier than previously, which is also contributed by the move over to NextJS. 

This branch also includes a mobile sub-project which will serve as the primary client for mobile platforms.

### Bootstrapping

Currently there is no easy setup to create your own instance, the manual procedure (so far) is the following:

- Get NodeJS LTS, ffmpeg, and a fitting MySQL instance.
- Change the database variables in `.env` to the MySQL instance.
- `npm install`
- Then execute `npm run dev`.

This section will be updated as development continues.
