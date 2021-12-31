using System;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Doki
{
  public class Program
  {
    public static void Main(string[] args)
    {
      Console.WriteLine($"DOKI {Assembly.GetExecutingAssembly().GetName().Version.ToString()}");
      CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); });
  }
}