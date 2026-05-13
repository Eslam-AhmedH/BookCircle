using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Full name is required")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role is required")]
    [RegularExpression("^(Owner|Reader)$", ErrorMessage = "Role must be Owner or Reader")]
    public string Role { get; set; } = "Reader";
}
