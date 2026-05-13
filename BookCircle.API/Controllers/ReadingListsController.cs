using BookCircle.Core.DTOs.ReadingLists;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api/reading-lists")]
[Authorize(Roles = "Reader,Admin")]
public class ReadingListsController : ControllerBase
{
    private readonly IReadingListService _readingListService;

    public ReadingListsController(IReadingListService readingListService)
    {
        _readingListService = readingListService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var lists = await _readingListService.GetByUserIdAsync(userId);
        return Ok(lists);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReadingListDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var list = await _readingListService.CreateAsync(userId, dto);
        return Ok(list);
    }

    [HttpGet("{listId:int}/items")]
    public async Task<IActionResult> GetItems(int listId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var items = await _readingListService.GetItemsAsync(listId, userId);
        return Ok(items);
    }

    [HttpPost("{listId:int}/items")]
    public async Task<IActionResult> AddItem(int listId, [FromBody] AddReadingListItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var item = await _readingListService.AddItemAsync(listId, userId, dto);
        return Ok(item);
    }

    [HttpDelete("{listId:int}/items/{bookId:int}")]
    public async Task<IActionResult> RemoveItem(int listId, int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _readingListService.RemoveItemAsync(listId, bookId, userId);
        return NoContent();
    }
}
