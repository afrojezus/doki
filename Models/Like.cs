
namespace Doki.Models
{
  public class Like
  {
    public string Id { get; set; }

    public int FileId { get; set; }
    public Author Author { get; set; }
  }
}