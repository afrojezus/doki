namespace Doki.Models
{
    public class UpdateForm
    {
        public string Id { get; set; }
        public string Folder { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Tags { get; set; }
        public string NSFW { get; set; }
    }
}