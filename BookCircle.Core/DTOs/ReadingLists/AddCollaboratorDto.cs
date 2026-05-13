using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.ReadingLists;

public class AddCollaboratorDto
{
    [Required]
    public string UserId { get; set; } = string.Empty;
}
