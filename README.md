<p>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-black.svg" alt="MIT License"></a>
  <a><img src="https://img.shields.io/badge/OS-Linux first-blue.svg" alt="Linux"></a>
  <a><img src="https://img.shields.io/badge/Platform-ASP.NET+React-blue.svg" alt="ASP.NET"></a>
  <a><img src="https://img.shields.io/badge/Build-15.01--2022-blue.svg" alt="15.01-2022"></a>
</p>

# doki

This is the core repository for the project.

## Installation

Doki can be set up easily by running `bootstrapper.sh` which
installs the required libraries and configures your server to run it. Available in the releases.

The system running Doki must include the following libraries:

- FFmpeg (for generating thumbnails)
- MariaDB
- Nginx (or any other form of web server)

These requirements are handled by the bootstrapper. That includes setting up the database.

For development you will need .NET Core and NodeJS (unless you decide to replace the `app` frontend with something else)

### Deciding type of production runtime

Doki can be used as a public platform or as a private platform. This is
decided within `app`. To switch between the types, edit  `REACT_APP_TYPE` to either `PRIVATE` or `PUBLIC` in `.env` within `app`.

Differences between these modes are availability of features. A public instance of Doki allows for the functionality of:

- Reporting files
- Fixed amount of channels that can be used
- Additional client-side security hardening
- Use auto-moderation tools on newly uploaded files

Both production runtime types allow for changing the visible name of the instance by changing `REACT_APP_NAME` in `.env`

## Contributing

Contributors are always welcome. You can contribute by listing issues or sending pull requests.
