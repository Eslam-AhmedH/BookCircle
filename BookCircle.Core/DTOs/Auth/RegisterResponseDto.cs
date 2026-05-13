namespace BookCircle.Core.DTOs.Auth;

public class RegisterResponseDto
{
    public bool NeedsApproval { get; set; }
    public string? Token { get; set; }
    public UserDto User { get; set; } = null!;
}
