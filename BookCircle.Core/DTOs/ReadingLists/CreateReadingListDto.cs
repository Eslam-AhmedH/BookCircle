using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.ReadingLists;

public class CreateReadingListDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
