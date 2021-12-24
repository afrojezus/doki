#!/usr/bin/python3
import sys


def main():
    if sys.platform != "linux":
        if sys.platform == "win32":
            print(
                "It appears you are running Windows. Here's the steps needed to install the needed tools")
        if sys.platform == "mac":
            print(
                "It appears you are running macOS. Here's the steps needed to install the needed tools")
        return

    print("Fetching details on about your system...")


if __name__ == "__main__":
    print("Setting up your environment for developing with Doki...")
    print("We'll install dotnet, nodejs (and npm) and docker (for simulating a db) on your development machine. We'll also fetch the latest branch of doki-web-client. If you agree to this, type Yes. Otherwise the script will terminate.")
    print("Notice: this script is meant to be used on GNU/Linux systems. If you happen to use Windows or Mac, it will instead provide you steps to obtain the needed tools.")
    user = input()
    if user != "Yes":
        sys.exit(0)
    main()
