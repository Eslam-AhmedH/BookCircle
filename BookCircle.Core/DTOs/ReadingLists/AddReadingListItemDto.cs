using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.ReadingLists;

public class AddReadingListItemDto
{
    [Required(ErrorMessage = "BookId is required")]
    [Range(1, int.MaxValue, ErrorMessage = "BookId must be a positive number")]
    public int BookId { get; set; }
}
