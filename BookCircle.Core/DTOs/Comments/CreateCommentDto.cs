using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.Comments;

public class CreateCommentDto
{
    [Required(ErrorMessage = "Content is required")]
    [MinLength(1)]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public int? ParentId { get; set; }
}
