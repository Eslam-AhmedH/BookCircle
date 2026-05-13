using BookCircle.Core.DTOs.Books;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] BookQueryParams queryParams)
    {
        var result = await _bookService.GetAllAsync(queryParams);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var book = await _bookService.GetByIdAsync(id);
        return Ok(book);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpGet("owner/{ownerId}")]
    public async Task<IActionResult> GetByOwner(string ownerId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        var books = await _bookService.GetByOwnerIdAsync(ownerId, userId, userRole);
        return Ok(books);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var book = await _bookService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        var book = await _bookService.UpdateAsync(id, userId, userRole, dto);
        return Ok(book);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        await _bookService.DeleteAsync(id, userId, userRole);
        return NoContent();
    }

    [Authorize(Roles = "Reader,Admin")]
    [HttpPost("{id:int}/reactions")]
    public async Task<IActionResult> React(int id, [FromBody] ReactBookDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _bookService.ReactAsync(id, userId, dto.Reaction);
        return Ok(result);
    }
}
