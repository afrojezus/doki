<p>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge" alt="MIT License"></a>
  <a><img src="https://img.shields.io/badge/OS-Any-blue.svg?style=for-the-badge" alt="Any"></a>
  <a><img src="https://img.shields.io/badge/Platform-ASP.NET-blue.svg?style=for-the-badge" alt="ASP.NET"></a>
  <a><img src="https://img.shields.io/badge/Build-11.10--2021-blue.svg?style=for-the-badge" alt="11.10-2021"></a>
</p>

# doki

File hosting platform for the viewers

This is the core repository for the project.

## Installation

Doki can be set up easily by running `bootstrapper.sh` which
installs the required libraries and configures your server to run it. Available in the releases.

If you prefer a quick-and-easy way of running Doki, you can also make use
of Docker to virtualize the environment needed for the platform. A docker compose file is included.

You can make use of the project itself and compile it on your own.

The system running Doki must include the following libraries:

- FFmpeg
- MariaDB
- .NET Core (SDK if developing, runtime else)
- Nginx
- NodeJS (only when developing; see the section below)

These requirements are handled by the bootstrapper. That includes setting up the database.

### Deciding type of production runtime

Doki can be used as a public platform or as a private platform. This is
decided within `app`. To switch between the types, edit  `REACT_APP_TYPE` to either `PRIVATE` or `PUBLIC` in `.env` within `app`.

Differences between these modes are availability of features. A public instance of Doki allows for the functionality of:

- Reporting files
- Sharing files directly to other social media
- Use auto-moderation tools on newly uploaded files

Both production runtime types allow for changing the visible name of the instance by changing `REACT_APP_NAME` in `.env`

## Contributing

Contributors are always welcome. You can contribute by listing issues or sending pull requests.
