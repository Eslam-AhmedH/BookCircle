using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.Books;

public class ReactBookDto
{
    [Required(ErrorMessage = "Reaction is required")]
    [RegularExpression("^(Like|Dislike)$", ErrorMessage = "Reaction must be Like or Dislike")]
    public string Reaction { get; set; } = string.Empty;
}
