using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("pending-users")]
    public async Task<IActionResult> GetPendingUsers()
    {
        var users = await _adminService.GetPendingUsersAsync();
        return Ok(users);
    }

    [HttpPatch("users/{userId}/approve")]
    public async Task<IActionResult> ApproveUser(string userId)
    {
        await _adminService.ApproveUserAsync(userId);
        return NoContent();
    }

    [HttpPatch("users/{userId}/reject")]
    public async Task<IActionResult> RejectUser(string userId)
    {
        await _adminService.RejectUserAsync(userId);
        return NoContent();
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        await _adminService.DeleteUserAsync(userId);
        return NoContent();
    }

    [HttpGet("pending-books")]
    public async Task<IActionResult> GetPendingBooks()
    {
        var books = await _adminService.GetPendingBooksAsync();
        return Ok(books);
    }

    [HttpPatch("books/{bookId:int}/approve")]
    public async Task<IActionResult> ApproveBook(int bookId)
    {
        await _adminService.ApproveBookAsync(bookId);
        return NoContent();
    }

    [HttpPatch("books/{bookId:int}/reject")]
    public async Task<IActionResult> RejectBook(int bookId)
    {
        await _adminService.RejectBookAsync(bookId);
        return NoContent();
    }
}
