using Doki.Models;
using Microsoft.EntityFrameworkCore;

namespace Doki.Services
{
    public class MariaDbContext : DbContext
    {
        public MariaDbContext(DbContextOptions<MariaDbContext> options) : base(options)
        {
        }

        public virtual DbSet<File> Files { get; set; }
        public virtual DbSet<Author> Author { get; set; }
        public virtual DbSet<Comment> Comments { get; set; }
    }
}