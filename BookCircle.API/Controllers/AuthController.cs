using BookCircle.Core.DTOs.Auth;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookCircle.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Validation failed", errors = ModelState });

        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Invalid token", code = "UNAUTHORIZED" });

        var user = await _authService.GetCurrentUserAsync(userId);
        return Ok(user);
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout() => NoContent();
}
