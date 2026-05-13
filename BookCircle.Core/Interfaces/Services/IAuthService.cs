using BookCircle.Core.DTOs.Auth;

namespace BookCircle.Core.Interfaces.Services;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<UserDto> GetCurrentUserAsync(string userId);
}
