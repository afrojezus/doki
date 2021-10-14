using System.Collections.Generic;
using Newtonsoft.Json;

namespace Doki.Models
{
  public class Author
  {
    public int AuthorId { get; set; }
    public string Name { get; set; }
    public int CreationDate { get; set; }
    [JsonIgnore] public ICollection<File> Files { get; set; }
  }
}