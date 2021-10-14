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

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<MariaDbContext>(option =>
          option
              .UseMySql(
                  Configuration["ConnectionStrings:Database"],
                  new MariaDbServerVersion(new Version(10, 3, 30))
              )
      );
      services.AddScoped<FileServiceNext>();
      services.Configure<CookiePolicyOptions>(options => { options.CheckConsentNeeded = context => true; });
      services.AddControllersWithViews().AddNewtonsoftJson(o =>
          o.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);
      services.AddControllersWithViews();

      // In production, the React files will be served from this directory
      services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/build"; });

      services.AddImageSharp()
       .RemoveProvider<PhysicalFileSystemProvider>()
      .AddProvider<CustomPhysicalFileSystemProvider>()
      .Configure<CustomPhysicalFileSystemProviderOptions>(options =>
    {
      options.RequestPath = "/files";
      options.ContentPath = Path.GetFullPath("ClientApp/build/files");
    });

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      else
      {
        app.UseExceptionHandler("/Error");
        // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
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
        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
        {
          spa.UseReactDevelopmentServer(npmScript: "start");
        }
      });
    }
  }
}