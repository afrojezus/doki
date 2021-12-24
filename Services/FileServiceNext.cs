using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Doki.Models;
using Doki.Utils;
using Microsoft.EntityFrameworkCore;
using DokiFile = Doki.Models.File;

namespace Doki.Services
{
    public sealed class FileServiceNext
    {
        private readonly MariaDbContext _dbContext;

        public static readonly List<string> ImageExtensions = new List<string>
            {".JPG", ".JPE", ".BMP", ".GIF", ".PNG", ".JPEG", ".WEBP"};

        public static readonly List<string> VideoExtensions = new List<string>
            {".WEBM", ".MP4", ".MOV", ".M4A", ".AVI"};

        public static readonly List<string> AudioExtensions = new List<string>
            {".MP3", ".WAV", ".AAC", ".OGG", ".FLAC"};

        public static readonly IEnumerable<string> MediaExtensions = VideoExtensions.Concat(AudioExtensions);

        public static readonly List<string> BinaryExtensions = new List<string>
{
            ".EXE", ".ELF", ".NDS", ".APPIMAGE", ".DEB", ".APP", ".IPA", ".APK", ".BIN", ".RPM", ".PKG", ".DMG", ".ISO"
};

        public readonly List<string> FakeNames = System.IO.File.ReadAllLines("Names.dokiconfig").ToList();
        public FileServiceNext(MariaDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DokiFile> FindRandom()
        {
            Random rand = new Random();
            int toSkip = rand.Next(0, _dbContext.Files.Count());
            return await _dbContext.Files.Include(f => f.Author).Skip(toSkip).Take(1).FirstOrDefaultAsync();
        }

        public async Task<int> Delete(int id, string root)
        {
            try
            {
                var file = await FindOne(id);
                var author = file.Author.AuthorId;
                foreach (var comment in _dbContext.Comments)
                {
                    if (file.Id == comment.FileId)
                    {
                        _dbContext.Comments.Remove(comment);
                    }
                }
                if (file.Thumbnail != null && file.Thumbnail.Contains("_thumbnail."))
                {
                    System.IO.File.Delete($"{root}/ClientApp/build/{file.Thumbnail}");
                }
                System.IO.File.Delete($"{root}/ClientApp/build/{file.FileURL}");
                _dbContext.Files.Remove(file);
                return await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException e)
            {
                Console.WriteLine(e);
                return 0;
            }
        }

        public async Task<DokiFile> FindRandomMedia(int currentFileId, string[] filteredFiles)
        {
            var allFiles = await this.FindAll();
            var mediaOnly = allFiles.Where(x => MediaExtensions.All(y => MediaExtensions.Contains(Path.GetExtension(x.FileURL).ToUpperInvariant()))).Where(x => filteredFiles.All(y => x.Folder != y)).Where(x => x.Id != currentFileId);
            Random rand = new Random();
            int toSkip = rand.Next(0, mediaOnly.Count());
            return mediaOnly.Skip(toSkip).Take(1).FirstOrDefault();
        }

        public async Task<int> RemoveAuthor(int id)
        {
            foreach (var af in _dbContext.Author)
            {
                if (id == af.AuthorId)
                {
                    _dbContext.Author.Remove(af);
                }
            }
            return await _dbContext.SaveChangesAsync();
        }

        public async Task<int> FindRandomMediaId(int currentFileId, string[] filteredFiles)
        {
            var allFiles = await this.FindAll();
            var mediaOnly = allFiles.Where(x => MediaExtensions.All(y => MediaExtensions.Contains(Path.GetExtension(x.FileURL).ToUpperInvariant()))).Where(x => filteredFiles.All(y => x.Folder != y)).Where(x => x.Id != currentFileId);
            Random rand = new Random();
            int toSkip = rand.Next(0, mediaOnly.Count());
            return mediaOnly.Skip(toSkip).Take(1).FirstOrDefault().Id;
        }

        public async Task<IEnumerable<DokiFile>> Search(string term)
        {
            return await _dbContext.Files.Include(f => f.Author).Where(x => x.Id.ToString().ToLower() == term.ToLower() || x.Folder.ToLower() == term.ToLower() || x.FileURL.ToLower() == term.ToLower() || x.Author.Name.ToLower() == term.ToLower()).ToListAsync();
        }

        public async Task<int> Length()
        {
            return await _dbContext.Files.CountAsync();
        }

        public async Task<IEnumerable<DokiFile>> FindAll()
        {
            return await _dbContext.Files.Include(f => f.Author).ToListAsync();
        }

        public async Task<DokiFile> FindOne(int id)
        {
            return await _dbContext.Files.Include(f => f.Author).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<Comment>> FindCommentsForFile(int id)
        {
            return await _dbContext.Comments.Where(c => c.FileId == id).Include(f => f.Author).ToListAsync();
        }

        public async Task<Comment> FindComment(Comment comment)
        {
            return await _dbContext.Comments.Where(c => c.Id == comment.Id).Include(f => f.Author)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<DokiFile>> FindFolder(string name)
        {
            return await _dbContext.Files.Include(f => f.Author).Where(x => x.Folder == name).ToListAsync();
        }

        public async Task<IEnumerable<DokiFile>> FindAllBy(int authorId)
        {
            return await _dbContext.Files.Include(f => f.Author).Where(x => x.Author.AuthorId == authorId)
                .ToListAsync();
        }

        public async Task<Author> FindAuthor(int authorId)
        {
            var author = await _dbContext.Author.FirstOrDefaultAsync(x => x.AuthorId == authorId);
            return author;
        }

        public async Task<int> Insert(DokiFile file)
        {
            _dbContext.Add(file);
            return await _dbContext.SaveChangesAsync();
        }

        /*public async Task<Folder> FindFolderData(string v)
        {
            return await _dbContext.Folders.FirstOrDefaultAsync(x => x.Name == v);
        }*/

        public async Task<int> Insert(Comment comment)
        {
            _dbContext.Add(comment);
            return await _dbContext.SaveChangesAsync();
        }

        public DokiFile CreateObjectFile(string filename, Author author, string folder, string nsfw)
        {
            var fileInfo = new FileInfo(Path.GetFullPath(filename));
            var file = new DokiFile
            {
                Size = (int)fileInfo.Length,
                UnixTime = Time.NewUnixTimeFromNow,
                Author = author,
                FileURL = Format.DokiCompatibleFileName(filename),
                Thumbnail = Format.DokiCompatibleFileName(GenerateThumbnail(filename)),
                Folder = folder == "undefined" ? null : folder,
                NSFW = nsfw == "1" ? true : false
            };

            return file;
        }

        private async Task<int> GenerateUniqueId()
        {
            var r = new Random();
            var id = r.Next(0, int.MaxValue);

            var files = await _dbContext.Files.ToListAsync();

            return files.Any(file => file.Id == id) ? r.Next(0, int.MaxValue) : id;
        }

        private static string GenerateThumbnail(string filename)
        {
            var file = Path.GetFullPath(filename);
            var thumbnailLink = "";
            var extension = Path.GetExtension(file).ToUpperInvariant();

            if (ImageExtensions.Contains(extension))
            {
                // This is handled by ImageSharp.
                thumbnailLink = $"{filename}?width=150&height=150";
            }
            else if (VideoExtensions.Contains(extension))
            {
                thumbnailLink = GetThumbnailFromVideo(filename);
            }
            else if (AudioExtensions.Contains(extension))
            {
                // There's no way to actually create an image from a sound file is there?
            }
            else
            {
            }

            return thumbnailLink;
        }

        private static string GetThumbnailFromVideo(string filename)
        {
            var output = $"{filename}_thumbnail.jpg";
            var file = Path.GetFullPath(filename);
            Console.WriteLine(output);
            Console.WriteLine(file);
            var cmd = "ffmpeg -y -itsoffset -1  -i " + '"' + file + '"' +
                      " -vcodec mjpeg -vframes 1 -an -f rawvideo -s 320x240 " + '"' + Path.GetFullPath(output) + '"';

            var startInfo = new ProcessStartInfo
            {
                WindowStyle = ProcessWindowStyle.Hidden,
                FileName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "cmd.exe" : "ffmpeg",
                Arguments = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                    ? "/C " + cmd
                    : cmd.Replace("ffmpeg", ""),
                UseShellExecute = true
            };

            var process = new Process
            {
                StartInfo = startInfo
            };

            process.Start();
            process.WaitForExit(5000);

            return output;
        }

        public async Task<int> GenerateUniqueAuthorId()
        {
            var r = new Random();
            var id = r.Next(0, int.MaxValue);

            var files = await _dbContext.Files.ToListAsync();

            return files.Any(file => file.Author.AuthorId == id) ? r.Next(0, int.MaxValue) : id;
        }

        public async Task<int> Update(DokiFile file)
        {
            try
            {
                _dbContext.Update(file);
                return await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return 0;
            }
        }

        public async Task<int> DeleteComment(Comment comment)
        {
            try
            {
                var c = await FindComment(comment);
                _dbContext.Comments.Remove(c);
                return await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException e)
            {
                Console.WriteLine(e);
                return 0;
            }
        }

        public async Task<int> Update(Comment comment)
        {
            try
            {
                _dbContext.Update(comment);
                return await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return 0;
            }
        }
    }
}