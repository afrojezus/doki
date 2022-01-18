using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Doki.Models
{
    public class UploadForm
    {
        public List<IFormFile> File { get; set; }
        public List<string> Folder { get; set; }
        public List<string> NSFW { get; set; }
        public List<string> Tags { get; set; }
        public List<string> Title { get; set; }
        public List<string> Description { get; set; }
        public string Id { get; set; }
    }
}