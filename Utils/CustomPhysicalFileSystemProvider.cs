using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp.Web;
using SixLabors.ImageSharp.Web.Providers;
using SixLabors.ImageSharp.Web.Resolvers;

namespace Doki.Utils
{
  public static class PathStringExtensions
  {
    public static bool StartsWithNormalizedSegments(this PathString path, PathString other)
    {
      if (other.Value != null && other.HasValue && other.Value.EndsWith('/'))
      {
        return path.StartsWithSegments(other.Value[..^1]);
      }

      return path.StartsWithSegments(other);
    }

    public static bool StartsWithNormalizedSegments(this PathString path, PathString other, StringComparison comparisonType)
    {
      if (other.Value != null && other.HasValue && other.Value.EndsWith('/'))
      {
        return path.StartsWithSegments(other.Value[..^1], comparisonType);
      }

      return path.StartsWithSegments(other, comparisonType);
    }

    public static bool StartsWithNormalizedSegments(this PathString path, PathString other, out PathString remaining)
    {
      if (other.Value != null && other.HasValue && other.Value.EndsWith('/'))
      {
        return path.StartsWithSegments(other.Value[..^1], out remaining);
      }

      return path.StartsWithSegments(other, out remaining);
    }

    public static bool StartsWithNormalizedSegments(this PathString path, PathString other, StringComparison comparisonType, out PathString remaining)
    {
      if (other.Value != null && other.HasValue && other.Value.EndsWith('/'))
      {
        return path.StartsWithSegments(other.Value[..^1], comparisonType, out remaining);
      }

      return path.StartsWithSegments(other, comparisonType, out remaining);
    }
  }

  public class CustomPhysicalFileSystemProviderOptions
  {
    public string RequestPath { get; set; }
    public string ContentPath { get; set; }
  }
  /// <summary>
  /// Returns images stored in the local physical file system.
  /// </summary>
  public class CustomPhysicalFileSystemProvider : IImageProvider
  {
    /// <summary>
    /// The file provider abstraction.
    /// </summary>
    private readonly IFileProvider _fileProvider;

    /// <summary>
    /// Contains various format helper methods based on the current configuration.
    /// </summary>
    private readonly FormatUtilities _formatUtilities;

    /// <summary>
    /// Request base request path.
    /// </summary>
    private readonly PathString _requestPath;

    /// <summary>
    /// A match function used by the resolver to identify itself as the correct resolver to use.
    /// </summary>
    private Func<HttpContext, bool> _match;

    /// <summary>
    /// Initializes a new instance of the <see cref="PhysicalFileSystemProvider"/> class.
    /// </summary>
    /// <param name="environment">The environment used by this middleware.</param>
    /// <param name="formatUtilities">Contains various format helper methods based on the current configuration.</param>
    public CustomPhysicalFileSystemProvider(IWebHostEnvironment environment, FormatUtilities formatUtilities, IOptions<CustomPhysicalFileSystemProviderOptions> mediaOptions)
    {
      this._fileProvider = new PhysicalFileProvider(mediaOptions.Value.ContentPath);
      this._formatUtilities = formatUtilities;

      this._requestPath = mediaOptions.Value.RequestPath;
    }

    /// <inheritdoc/>
    public ProcessingBehavior ProcessingBehavior { get; } = ProcessingBehavior.CommandOnly;

    /// <inheritdoc/>
    public Func<HttpContext, bool> Match
    {
      get { return string.IsNullOrEmpty(_requestPath) ? _ => true : _match ?? IsMatch; }

      set => _match = value;
    }

    /// <inheritdoc/>
    public bool IsValidRequest(HttpContext context) => this._formatUtilities.GetExtensionFromUri(context.Request.GetDisplayUrl()) != null;

    /// <inheritdoc/>
    public Task<IImageResolver> GetAsync(HttpContext context)
    {
      // Remove assets request path if it's set.
      Debug.Assert(_requestPath.Value != null, "_requestPath.Value != null");
      string path = string.IsNullOrEmpty(_requestPath) ? context.Request.Path.Value : context.Request.Path.Value?[_requestPath.Value.Length..];

      // Path has already been correctly parsed before here.
      IFileInfo fileInfo = this._fileProvider.GetFileInfo(path);

      // Check to see if the file exists.
      if (!fileInfo.Exists)
      {
        return Task.FromResult<IImageResolver>(null);
      }

      var metadata = new ImageMetadata(fileInfo.LastModified.UtcDateTime, fileInfo.Length);
      return Task.FromResult<IImageResolver>(new PhysicalFileSystemResolver(fileInfo, metadata));
    }

    private bool IsMatch(HttpContext context)
    {
      if (!context.Request.Path.StartsWithNormalizedSegments(_requestPath, StringComparison.OrdinalIgnoreCase))
      {
        return false;
      }

      return true;
    }
  }
}