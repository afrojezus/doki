using System.Collections.Generic;
using System.Linq;
using Doki.Models;

namespace Doki.Services
{
    public static class CommentService
    {
        private static List<Comment[]> FileComments { get; }

        static CommentService()
        {
            FileComments = GetAllCommentFiles();
        }

        public static Comment[] Get(long id) => FileComments.Find(x => x.Any(y => y.FileId == id));

        private static List<Comment[]> GetAllCommentFiles()
        {
            var ret = new List<Comment[]>();


            return ret;
        }
    }
}