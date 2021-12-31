using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Doki.Models;
using Doki.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using File = Doki.Models.File;

namespace Doki.Controllers
{
  [ApiController]
  [Route("api")]
  public class FileServiceController : Controller
  {
    private readonly ILogger<FileServiceController> _logger;
    private readonly FileServiceNext _fileService;
    private IWebHostEnvironment HostingEnvironment;

    public FileServiceController(IWebHostEnvironment environment, ILogger<FileServiceController> logger,
        FileServiceNext fileService)
    {
      HostingEnvironment = environment;
      _logger = logger;
      _fileService = fileService;
    }

    [Route("all/length")]
    [HttpGet]
    public async Task<int> GetLength()
    {
      return await _fileService.Length();
    }

    [Route("all")]
    [HttpGet]
    public async Task<IEnumerable<File>> Get()
    {
      return await _fileService.FindAll();
    }

    [Route("random")]
    [HttpGet]
    public async Task<ActionResult<File>> GetRandom()
    {
      var result = await _fileService.FindRandom();
      if (result != default)
        return Ok(result);
      else
      {
        return NotFound();
      }
    }

    [Route("random/media")]
    [HttpPost]
    public async Task<ActionResult<File>> GetRandomMedia([FromBody] RandomForm random)
    {
      var result = await _fileService.FindRandomMedia(random.FileId, random.Filter);
      if (result != default)
        return Ok(result);
      else
      {
        return NotFound();
      }
    }

    [Route("random/media/id")]
    [HttpPost]
    public async Task<ActionResult<int>> GetRandomMediaId([FromBody] RandomForm random)
    {
      var result = await _fileService.FindRandomMediaId(random.FileId, random.Filter);
      if (result != default)
        return Ok(result);
      else
      {
        return NotFound();
      }
    }

    [Route("authors/delete")]
    [HttpPost]
    public async Task<ActionResult<int>> DeleteAuthorAndFiles([FromBody] RemovalForm r)
    {
      try
      {
        var authorFiles = await _fileService.FindAllBy(r.Id);
        foreach (var file in authorFiles)
        {
          await _fileService.Delete(file.Id, HostingEnvironment.ContentRootPath);
        }
        await _fileService.RemoveAuthor(r.Id);
        return Ok(await Get());
      }
      catch (Exception)
      {
        return NotFound();
      }
    }

    [Route("names/{id}")]
    [HttpGet]
    public async Task<ActionResult<int>> GetAuthor(int id)
    {
      try
      {
        var authorFiles = await _fileService.FindAllBy(id);
        var author = authorFiles.FirstOrDefault()?.Author;
        return Ok(author);
      }
      catch (Exception)
      {
        return NotFound();
      }
    }


    [Route("comments/{id}/all")]
    [HttpGet]
    public async Task<IEnumerable<Comment>> GetComments(int id)
    {
      return await _fileService.FindCommentsForFile(id);
    }

    [Route("file/{id}")]
    [HttpGet]
    public async Task<ActionResult<File>> GetFile(int id)
    {
      var result = await _fileService.FindOne(id);
      if (result != default)
        return Ok(result);
      else
      {
        return NotFound();
      }
    }

    [Route("folder/{name}")]
    [HttpGet]
    public ActionResult<IEnumerable<File>> GetFolder(string name)
    {
      var result = _fileService.FindFolder(name);
      return Ok(result);
    }

    [Route("all/search/{term}")]
    [HttpGet]
    public async Task<IEnumerable<File>> GetFilesBySearchTerm(string term)
    {
      return await _fileService.Search(term);
    }

    [Route("all/by/{id}")]
    [HttpGet]
    public async Task<IEnumerable<File>> GetFilesByAuthor(int id)
    {
      return await _fileService.FindAllBy(id);
    }

    [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
    [DisableRequestSizeLimit]
    [Route("upload")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<File>>> UploadFile([FromForm] UploadForm upload)
    {
      _logger.LogInformation($"Upload request with ID {upload.Id}");
      if (upload.File == null || upload.File.Count == 0)
      {
        return NotFound();
      }

      var author = await _fileService.FindAuthor(int.Parse(upload.Id));
      if (author == null)
      {
        var newId = int.Parse(upload.Id);
        var name = _fileService.FakeNames[new Random().Next(_fileService.FakeNames.Count)];
        var creationDate = (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
        author = new Author
        {
          AuthorId = newId,
          Name = name,
          CreationDate = creationDate
        };
      }

      //var realLocation = HostingEnvironment.IsDevelopment() ? "build" : "public";
      int i = 0;
      foreach (var file in upload.File)
      {
        _logger.LogInformation($"uploading {file.FileName}");
        var sanitizedFileName = Regex.Replace(file.FileName.Trim(), @"\s+", "");
        var targetFileName =
            $"{HostingEnvironment.ContentRootPath}/ClientApp/build/files/{sanitizedFileName}";
        await using var fileStream = new FileStream(targetFileName, FileMode.Create);
        await file.CopyToAsync(fileStream);

        _logger.LogInformation(
            $"uploader id {author.AuthorId}, name {author.Name}, creation_date {author.CreationDate}");

        /*Folder folder = null;
        if (upload.Folder[i] == "undefined")
        {
            folder = await _fileService.FindFolderData(upload.Folder[i]);
            if (folder == null)
            {
                var name = upload.Folder[i];
                folder = new Folder
                {
                    Name = name
                };
            }
        }*/

        var newFile = _fileService.CreateObjectFile($"ClientApp/build/files/{sanitizedFileName}",
            author,
            upload.Folder[i],
            upload.NSFW[i]);
        await _fileService.Insert(newFile);
        i++;
      }

      return Ok(await Get());
    }

    [Route("delete/{id}")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<File>>> DeleteFile(int id, [FromForm] DeleteForm delete)
    {
      if (delete.Id != null)
      {
        var result = await _fileService.Delete(id, HostingEnvironment.ContentRootPath);
        if (result > 0)
          return Ok(await Get());
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("update/{id}")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<File>>> UpdateFolderForFile(int id, [FromForm] UpdateForm update)
    {
      if (update.Id != null)
      {
        var result = await _fileService.FindOne(id);
        if (result != default)
        {
          result.Folder = update.Folder;
          await _fileService.Update(result);
          return Ok(await Get());
        }
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("update/like/{id}")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<File>>> UpdateLikesForFile(int id, [FromForm] LikeForm like)
    {
      if (like.Id != null)
      {
        var result = await _fileService.FindOne(id);
        if (result != default)
        {
          result.Likes++;
          await _fileService.Update(result);
          return Ok(await Get());
        }
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("update/views/{id}")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<File>>> UpdateViewsForFile(int id, [FromForm] ViewForm view)
    {
      if (view.Id != null)
      {
        var result = await _fileService.FindOne(id);
        if (result != default)
        {
          result.Views++;
          await _fileService.Update(result);
          return Ok(await Get());
        }
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("comments/{id}")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Comment>>> AddComment(int id, [FromForm] CommentForm comment)
    {
      if (comment.Id != null)
      {
        var result = await _fileService.FindOne(id);
        if (result != default)
        {
          var author = await _fileService.FindAuthor(int.Parse(comment.Id)) ?? new Author
          {
            Name = "Anonymous",
            CreationDate = (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds
          };

          await _fileService.Insert(new Comment
          {
            Author = author,
            Content = comment.Content,
            Date = int.Parse(comment.Date),
            FileId = id
          });
          return Ok(await GetComments(id));
        }
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("comments/{id}/delete")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Comment>>> DeleteComment(int id, [FromForm] CommentForm comment)
    {
      if (comment.Id != null)
      {
        var result = await _fileService.FindOne(id);
        if (result != default)
        {
          await _fileService.DeleteComment(new Comment
          {
            Id = int.Parse(comment.Id)
          });
          return Ok(await GetComments(id));
        }
        else
          return NotFound();
      }
      else
      {
        return NotFound();
      }
    }

    [Route("server/space")]
    [HttpGet]
    public ActionResult<int> GetFreeSpace()
    {
      var allDrives = DriveInfo.GetDrives();
      var drive = allDrives.FirstOrDefault();
      if (drive != null)
      {
        return Ok(drive.AvailableFreeSpace.ToString());
      }
      else
      {
        return NotFound();
      }
    }
  }
}