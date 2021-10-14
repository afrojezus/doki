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
installs the required libraries and configures your server to run it.

If you prefer a quick-and-easy way of running Doki, you can also make use
of Docker to virtualize the environment needed for the platform.

You can make use of the project itself and compile it on your own.

The system running Doki must include the following libraries:
- FFmpeg
- MariaDB
- .NET Core (SDK if developing, runtime else)
- Nginx
- NodeJS (only when developing; see the section below)

These requirements are handled by the bootstrapper. That includes setting up the database.

### Web client setup
The default frontend for Doki is `doki-web-client`. The latest release of the client
is fetched upon initialization.

If you're going to develop Doki, you will need to have NodeJS installed as the client makes
use of it. Then run the following command:
```bash
$ git clone https://github.com/tokumei-gr/doki-web-client ClientApp
```
Having the client inside the project is necessary for both development and production.

### Deciding type of production runtime
Doki can be used as a public platform or as a private platform. This is
decided within `doki-web-client` rather than the core project. To switch between
the types, edit `REACT_APP_TYPE` to either `PRIVATE` or `PUBLIC` in `.env` within `ClientApp`.

Differences between these modes are availability of features. An public instance of Doki allows for the functionality of:
- Reporting files
- Sharing files directly to other social media
- Use auto-moderation tools on newly uploaded files

## Contributing
Contributors are always welcome. You can contribute by listing issues or sending pull requests.