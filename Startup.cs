using System;
using System.IO;
using Doki.Services;
using Doki.Utils;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using SixLabors.ImageSharp.Web.DependencyInjection;
using SixLabors.ImageSharp.Web.Providers;

namespace Doki
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<MariaDbContext>(option =>
          option
              .UseMySql(
                  Configuration["ConnectionStrings:Database"],
                  new MariaDbServerVersion(new Version(10, 3, 30))
              )
      );
      services.AddScoped<PrimaryService>();
      services.Configure<CookiePolicyOptions>(options => { options.CheckConsentNeeded = context => true; });
      services.AddControllersWithViews().AddNewtonsoftJson(o =>
          o.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);
      services.AddControllersWithViews();
      services.AddSpaStaticFiles(configuration => { configuration.RootPath = "app/build"; });

      services.AddImageSharp()
       .RemoveProvider<PhysicalFileSystemProvider>()
      .AddProvider<CustomPhysicalFileSystemProvider>()
      .Configure<CustomPhysicalFileSystemProviderOptions>(options =>
    {
      options.RequestPath = "/files";
      options.ContentPath = Path.GetFullPath("app/build/files");
    });

    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      else
      {
        app.UseExceptionHandler("/Error");
        app.UseHsts();
      }

      app.UseHttpsRedirection();
      app.UseImageSharp();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseRouting();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllerRoute(
                  name: "default",
                  pattern: "{controller}/{action=Index}/{id?}");
      });

      app.UseSpa(spa =>
      {
        spa.Options.SourcePath = "app";

        if (env.IsDevelopment())
        {
          spa.UseReactDevelopmentServer(npmScript: "start");
        }
      });
    }
  }
}