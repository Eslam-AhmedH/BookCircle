using BookCircle.Core.DTOs.BorrowRequests;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api/borrow-requests")]
[Authorize]
public class BorrowRequestsController : ControllerBase
{
    private readonly IBorrowRequestService _borrowService;

    public BorrowRequestsController(IBorrowRequestService borrowService)
    {
        _borrowService = borrowService;
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpGet("incoming")]
    public async Task<IActionResult> GetIncoming()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _borrowService.GetIncomingAsync(userId);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _borrowService.GetMineAsync(userId);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBorrowRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _borrowService.CreateAsync(userId, dto);
        return Ok(result);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpPatch("{id:int}/respond")]
    public async Task<IActionResult> Respond(int id, [FromBody] RespondBorrowRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        var result = await _borrowService.RespondAsync(id, userId, userRole, dto);
        return Ok(result);
    }

    [Authorize(Roles = "Owner,Admin")]
    [HttpPatch("{id:int}/return")]
    public async Task<IActionResult> Return(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userRole = User.FindFirstValue(ClaimTypes.Role)!;
        var result = await _borrowService.ReturnAsync(id, userId, userRole);
        return Ok(result);
    }
}
