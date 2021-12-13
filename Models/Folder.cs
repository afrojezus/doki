using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Doki.Models
{
    public class Folder
        {
            public string Id { get; set; }

            [JsonIgnore] public ICollection<File> Files { get; set; }
            [ForeignKey("AuthorId")] public Author Author { get; set; }

            public string Background { get; set; }

            public string Name { get; set; }
    
        }
}