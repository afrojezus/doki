using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Doki.Models
{
  public class UploadForm
  {
    public List<IFormFile> File { get; set; }
    public List<string> Folder { get; set; }
    public List<string> NSFW { get; set; }
    public string Id { get; set; }
  }
}