using System.ComponentModel.DataAnnotations.Schema;

namespace Doki.Models
{
  public class File
  {
    public int Id { get; set; }

    public int UnixTime { get; set; }
    public int Size { get; set; }
    [ForeignKey("AuthorId")] public Author Author { get; set; }
    public string FileURL { get; set; }
    public string Thumbnail { get; set; }

    public string Folder { get; set; }
    public int Likes { get; set; }
  }
}