using System;

namespace Doki.Utils
{
  public static class Time
  {
    public static int NewUnixTimeFromNow => (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
    public static DateTime DateTimeFromUnixTime(int unixTime) => new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc).AddSeconds(unixTime).ToLocalTime();
  }
}