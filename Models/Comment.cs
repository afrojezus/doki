namespace Doki.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int FileId { get; set; }
        public Author Author { get; set; }
        public string Content { get; set; }
        public int Date { get; set; }
    }
}