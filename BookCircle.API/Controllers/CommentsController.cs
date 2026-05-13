using BookCircle.Core.DTOs.Comments;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("books/{bookId:int}/comments")]
    public async Task<IActionResult> GetByBook(int bookId)
    {
        var comments = await _commentService.GetByBookIdAsync(bookId);
        return Ok(comments);
    }

    [Authorize]
    [HttpPost("books/{bookId:int}/comments")]
    public async Task<IActionResult> Create(int bookId, [FromBody] CreateCommentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var comment = await _commentService.CreateAsync(bookId, userId, dto);
        return Ok(comment);
    }

    [Authorize]
    [HttpDelete("comments/{commentId:int}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        await _commentService.DeleteAsync(commentId, userId, userRole);
        return NoContent();
    }
}
