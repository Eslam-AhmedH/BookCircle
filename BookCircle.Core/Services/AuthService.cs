using BookCircle.Core.DTOs.Auth;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BookCircle.Core.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<User> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
            throw new UnauthorizedAccessException("Invalid email or password");

        if (user.Role == UserRole.Owner && !user.IsApproved)
            throw new UnauthorizedAccessException(
                "Your account is pending admin approval. Please wait.");

        return new LoginResponseDto
        {
            Token = GenerateJwtToken(user),
            User = MapToUserDto(user)
        };
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("An account with this email already exists");

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            throw new ArgumentException("Invalid role. Must be Owner or Reader");

        if (role == UserRole.Admin)
            throw new InvalidOperationException("Cannot register as Admin");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email,
            Role = role,
            IsApproved = role == UserRole.Reader,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        await _userManager.AddToRoleAsync(user, role.ToString());

        var needsApproval = role == UserRole.Owner;
        var token = needsApproval ? null : GenerateJwtToken(user);

        return new RegisterResponseDto
        {
            NeedsApproval = needsApproval,
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<UserDto> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        return MapToUserDto(user);
    }

    private string GenerateJwtToken(User user)
    {
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key is not configured");

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("fullName", user.FullName),
            new Claim("role", user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(
                signingKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email!,
        Role = user.Role.ToString(),
        AvatarUrl = user.AvatarUrl,
        IsApproved = user.IsApproved
    };
}
